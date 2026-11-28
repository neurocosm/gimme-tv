import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.join(__dirname, 'dist');
const IS_PROD =
  process.env.NODE_ENV === 'production' ||
  (process.env.NODE_ENV !== 'development' && fs.existsSync(path.join(DIST_DIR, 'index.html')));

const SMITHSONIAN_UNITS = [
  { code: 'HMSG', name: 'Hirshhorn Museum (Smithsonian)', maxStart: 3500 },
  { code: 'SAAM', name: 'Smithsonian American Art Museum', maxStart: 12000 },
  { code: 'NASM', name: 'National Air & Space Museum', maxStart: 8000 },
  { code: 'CHNDM', name: 'Cooper Hewitt Design Museum', maxStart: 12000 },
  { code: 'FSG', name: 'National Museum of Asian Art', maxStart: 8000 },
  { code: 'NPG', name: 'National Portrait Gallery (Smithsonian)', maxStart: 8000 },
];

function cleanSmithsonianCreator(raw) {
  if (!raw) return 'Unknown Artist';
  const cleaned = String(raw)
    .split(',')[0]
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .trim();
  if (!cleaned || /^unknown$/i.test(cleaned) || cleaned.length > 60) {
    return 'Unknown Artist';
  }
  return cleaned;
}

function setNoStoreHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

function getLiveBuildVersion() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'public', 'version.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.version === 'string' && parsed.version.trim()) {
      return parsed.version.trim();
    }
  } catch (_err) {}
  return String(Date.now());
}

function isHtmlNavigationRequest(req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const pathname = req.path || '/';
  if (pathname === '/' || pathname === '/index.html') return true;
  if (pathname.startsWith('/api/') || pathname.startsWith('/@')) return false;
  // Never serve index.html for asset paths with file extensions (e.g., .js, .css, .json, .png)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false;
  const accept = String(req.headers.accept || '');
  return accept.includes('text/html') || accept.includes('*/*') || accept === '';
}

async function createApp() {
  const app = express();

  // Never allow stale browser/proxy caching of service worker, version beacon, or HTML entry
  app.use((req, res, next) => {
    const p = req.path || '/';
    if (
      p === '/' ||
      p === '/index.html' ||
      p === '/sw.js' ||
      p === '/version.json' ||
      p.startsWith('/api/')
    ) {
      setNoStoreHeaders(res);
    }
    next();
  });

  // Private server-side proxy for Smithsonian Open Access API
  app.get('/api/smithsonian', async (req, res) => {
    setNoStoreHeaders(res);
    const apiKey = process.env.SMITHSONIAN_API_KEY;
    if (!apiKey) {
      return res.json({ configured: false, items: [] });
    }

    try {
      const requestedUnit = typeof req.query.unit === 'string' ? req.query.unit.toUpperCase() : '';
      const unitInfo =
        SMITHSONIAN_UNITS.find((u) => u.code === requestedUnit) ||
        SMITHSONIAN_UNITS[Math.floor(Math.random() * SMITHSONIAN_UNITS.length)];

      const rows = Math.min(Math.max(Number(req.query.rows) || 18, 1), 25);
      const rawStart = Number(req.query.start);
      const start =
        Number.isFinite(rawStart) && rawStart >= 0
          ? Math.min(Math.floor(rawStart), unitInfo.maxStart)
          : Math.floor(Math.random() * unitInfo.maxStart);

      const query = encodeURIComponent(`online_media_type:Images AND unit_code:${unitInfo.code}`);
      const url = `https://api.si.edu/openaccess/api/v1.0/search?q=${query}&rows=${rows}&start=${start}&api_key=${encodeURIComponent(apiKey)}`;

      const upstream = await fetch(url, { signal: AbortSignal.timeout(6500) });
      if (!upstream.ok) {
        return res.status(502).json({ configured: true, items: [], error: `Upstream ${upstream.status}` });
      }

      const json = await upstream.json();
      const rawRows = json?.response?.rows || [];

      const items = rawRows
        .map((row) => {
          const dnr = row?.content?.descriptiveNonRepeating || {};
          const mediaList = dnr?.online_media?.media || [];
          const imgMedia = mediaList.find(
            (m) => m && (m.type === 'Images' || !m.type) && (m.content || m.thumbnail)
          );
          if (!imgMedia) return null;

          let imageUrl = imgMedia.content || imgMedia.thumbnail;
          if (!imageUrl || typeof imageUrl !== 'string') return null;

          // Ensure TV-friendly resized delivery (~1200px wide) via Smithsonian IDS
          if (imageUrl.includes('ids.si.edu/ids/deliveryService') && !imageUrl.includes('max_w=')) {
            imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'max_w=1200';
          }

          const freetext = row?.content?.freetext || {};
          const rawCreator = freetext?.name?.[0]?.content || '';
          const rawDate = freetext?.date?.[0]?.content || '';
          const yearMatch = String(rawDate).match(/\b(1[5-9]\d{2}|20\d{2})\b/);

          return {
            id: `si-${row.id}`,
            title: String(row.title || 'Untitled').trim(),
            artist: cleanSmithsonianCreator(rawCreator),
            year: yearMatch ? yearMatch[0] : '',
            source: dnr.data_source || unitInfo.name,
            sourceIcon: '🏛️',
            providerKey: 'smithsonian',
            imageUrl,
          };
        })
        .filter(Boolean);

      return res.json({ configured: true, unit: unitInfo.code, items });
    } catch (err) {
      console.warn('[Smithsonian Proxy] Fetch error:', err instanceof Error ? err.message : err);
      return res.status(200).json({ configured: true, items: [] });
    }
  });

  if (IS_PROD) {
    app.use(
      express.static(DIST_DIR, {
        index: false,
        etag: false,
        lastModified: false,
        setHeaders(res, filePath) {
          if (
            filePath.endsWith('index.html') ||
            filePath.endsWith('sw.js') ||
            filePath.endsWith('version.json') ||
            filePath.endsWith('manifest.json')
          ) {
            setNoStoreHeaders(res);
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    app.get('/local_art_manifest.json', (_req, res) => {
      setNoStoreHeaders(res);
      res.sendFile(path.join(__dirname, 'local_art_manifest.json'), { etag: false, lastModified: false });
    });

    app.use((req, res, next) => {
      if (!isHtmlNavigationRequest(req)) return next();
      setNoStoreHeaders(res);
      res.sendFile(path.join(DIST_DIR, 'index.html'), { etag: false, lastModified: false });
    });
  } else {
    // Pure Express dev serving — zero Vite HMR client injection, zero WebSocket reconnect loops, zero JS-wrapped CSS
    const PUBLIC_DIR = path.join(__dirname, 'public');
    const SRC_DIR = path.join(__dirname, 'src');
    const THREE_DIR = path.join(__dirname, 'node_modules', 'three');
    const DEV_IMPORT_MAP =
      '<script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script>\n  ';

    app.use('/vendor/three', express.static(THREE_DIR));

    app.use(
      express.static(PUBLIC_DIR, {
        index: false,
        etag: false,
        lastModified: false,
        setHeaders(res, filePath) {
          if (
            filePath.endsWith('sw.js') ||
            filePath.endsWith('version.json') ||
            filePath.endsWith('manifest.json')
          ) {
            setNoStoreHeaders(res);
          }
        },
      })
    );

    // Stamp current build version onto lazy dreamscape import so tablets/TVs never reuse a cached ES module
    app.get('/src/main.js', (_req, res) => {
      setNoStoreHeaders(res);
      const ver = encodeURIComponent(getLiveBuildVersion());
      let code = fs.readFileSync(path.join(SRC_DIR, 'main.js'), 'utf-8');
      code = code.replace("import('./dreamscape.js')", `import('./dreamscape.js?v=${ver}')`);
      res.status(200).type('text/javascript; charset=utf-8').send(code);
    });

    app.use(
      '/src',
      express.static(SRC_DIR, {
        etag: false,
        lastModified: false,
        setHeaders(res) {
          setNoStoreHeaders(res);
        },
      })
    );

    app.get('/style.css', (_req, res) => {
      setNoStoreHeaders(res);
      res.type('text/css; charset=utf-8');
      res.sendFile(path.join(__dirname, 'style.css'), { etag: false, lastModified: false });
    });

    app.get('/local_art_manifest.json', (_req, res) => {
      setNoStoreHeaders(res);
      res.sendFile(path.join(__dirname, 'local_art_manifest.json'), { etag: false, lastModified: false });
    });

    app.use((req, res, next) => {
      if (!isHtmlNavigationRequest(req)) return next();
      setNoStoreHeaders(res);
      const ver = encodeURIComponent(getLiveBuildVersion());
      const htmlPath = path.join(__dirname, 'index.html');
      let html = fs.readFileSync(htmlPath, 'utf-8');
      html = html.replace(/href="\.?\/style\.css"/, `href="./style.css?v=${ver}"`);
      if (/<script type="importmap" id="three-importmap">[\s\S]*?<\/script>/.test(html)) {
        html = html.replace(
          /<script type="importmap" id="three-importmap">[\s\S]*?<\/script>/,
          DEV_IMPORT_MAP.trim()
        );
        html = html.replace(
          /<script type="module" src="\.?\/src\/main\.js"><\/script>/,
          `<script type="module" src="./src/main.js?v=${ver}"></script>`
        );
      } else {
        html = html.replace(
          /<script type="module" src="\.?\/src\/main\.js"><\/script>/,
          `${DEV_IMPORT_MAP}<script type="module" src="./src/main.js?v=${ver}"></script>`
        );
      }
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(html);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gimme TV] Server listening on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

createApp();
