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

async function createApp() {
  const app = express();

  // Private server-side proxy for Smithsonian Open Access API
  app.get('/api/smithsonian', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
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
    app.use(express.static(DIST_DIR));
    app.get('/local_art_manifest.json', (_req, res) => {
      res.sendFile(path.join(__dirname, 'local_art_manifest.json'));
    });
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        allowedHosts: true,
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.method !== 'GET') return next();
      try {
        const htmlPath = path.join(__dirname, 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gimme TV] Server listening on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

createApp();
