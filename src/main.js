/**
 * Gimme TV - Ambient HUD
 * Clock, Date, and Open-Meteo Weather Engine
 */

// WMO Weather Interpretation Codes (WW)
const WMO_CODE_MAP = {
  0: { label: 'CLEAR SKY', emoji: '☀️', icon: 'sun' },
  1: { label: 'MAINLY CLEAR', emoji: '🌤️', icon: 'sun-cloud' },
  2: { label: 'PARTLY CLOUDY', emoji: '⛅', icon: 'sun-cloud' },
  3: { label: 'OVERCAST', emoji: '☁️', icon: 'cloud' },
  45: { label: 'FOG', emoji: '🌫️', icon: 'fog' },
  48: { label: 'ICY FOG', emoji: '🌫️', icon: 'fog' },
  51: { label: 'LIGHT DRIZZLE', emoji: '🌦️', icon: 'drizzle' },
  53: { label: 'DRIZZLE', emoji: '🌧️', icon: 'drizzle' },
  55: { label: 'DENSE DRIZZLE', emoji: '🌧️', icon: 'drizzle' },
  56: { label: 'FREEZING DRIZZLE', emoji: '🌨️', icon: 'sleet' },
  57: { label: 'HEAVY FREEZING DRIZZLE', emoji: '🌨️', icon: 'sleet' },
  61: { label: 'LIGHT RAIN', emoji: '🌧️', icon: 'rain' },
  63: { label: 'RAIN', emoji: '🌧️', icon: 'rain' },
  65: { label: 'HEAVY RAIN', emoji: '🌧️', icon: 'rain-heavy' },
  66: { label: 'FREEZING RAIN', emoji: '🌨️', icon: 'sleet' },
  67: { label: 'HEAVY FREEZING RAIN', emoji: '🌨️', icon: 'sleet' },
  71: { label: 'LIGHT SNOW', emoji: '🌨️', icon: 'snow' },
  73: { label: 'SNOW', emoji: '❄️', icon: 'snow' },
  75: { label: 'HEAVY SNOW', emoji: '❄️', icon: 'snow' },
  77: { label: 'SNOW FLURRIES', emoji: '❄️', icon: 'snow' },
  80: { label: 'RAIN SHOWERS', emoji: '🌧️', icon: 'rain' },
  81: { label: 'HEAVY SHOWERS', emoji: '🌧️', icon: 'rain-heavy' },
  82: { label: 'VIOLENT SHOWERS', emoji: '🌧️', icon: 'rain-heavy' },
  85: { label: 'SNOW SHOWERS', emoji: '🌨️', icon: 'snow' },
  86: { label: 'HEAVY SNOW SHOWERS', emoji: '❄️', icon: 'snow' },
  95: { label: 'THUNDERSTORM', emoji: '⛈️', icon: 'thunder' },
  96: { label: 'THUNDERSTORM W/ HAIL', emoji: '⛈️', icon: 'thunder' },
  99: { label: 'SEVERE HAILSTORM', emoji: '⛈️', icon: 'thunder' },
};

// DOM Elements
const timeDigitsEl = document.getElementById('hud-time-digits');
const timePeriodEl = document.getElementById('hud-time-period');
const timeSecondsEl = document.getElementById('hud-time-seconds');
const dayTextEl = document.getElementById('hud-day');
const dateTextEl = document.getElementById('hud-date');

const conditionIconEl = document.getElementById('hud-condition-icon');
const weatherCondEl = document.getElementById('hud-weather-condition');
const weatherTempEl = document.getElementById('hud-weather-temp');
const weatherHumidityEl = document.getElementById('hud-weather-humidity');
const weatherPressureEl = document.getElementById('hud-weather-pressure');
const weatherUvEl = document.getElementById('hud-weather-uv');
const buildStampEl = document.getElementById('hud-build-stamp');

/**
 * Update Time & Date
 */
function updateClock() {
  const now = new Date();

  // 12-hour format calculation
  let hours = now.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  if (timeDigitsEl) timeDigitsEl.textContent = `${hours}:${minutes}`;
  if (timePeriodEl) timePeriodEl.textContent = period;
  if (timeSecondsEl) timeSecondsEl.textContent = seconds;

  // Full day name and formatted date
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (dayTextEl) dayTextEl.textContent = dayName;
  if (dateTextEl) dateTextEl.textContent = fullDate;
}

/**
 * Current Application Build Version (Updated with every release & feature update)
 * Format: v1.MMDDYYYY.HHmm
 */
export const APP_BUILD_VERSION = 'v1.11132026.2208';

function formatBuildStamp() {
  return APP_BUILD_VERSION;
}

// Location DOM Element
const locationNameEl = document.getElementById('hud-location-name');

/**
 * Dynamic Coordinates State
 * Defaults to Waltham, MA as baseline fallback
 */
let currentCoordinates = {
  lat: 42.3765,
  lon: -71.2356,
  name: 'WALTHAM, MA',
};

/**
 * Open-Meteo Weather Polling (uses currentCoordinates)
 */
async function fetchWeather() {
  try {
    const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${currentCoordinates.lat}&longitude=${currentCoordinates.lon}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,uv_index&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Weather response: ${response.status}`);

    const data = await response.json();
    const current = data.current;

    if (current) {
      const tempF = Math.round(current.temperature_2m);
      const humidity = Math.round(current.relative_humidity_2m);
      const code = current.weather_code;

      // Pressure conversion: 1 hPa = 0.02953 inHg
      const pressureVal = current.surface_pressure
        ? (current.surface_pressure * 0.02953).toFixed(2)
        : '--';

      // UV index
      const uvVal = typeof current.uv_index === 'number' ? Math.round(current.uv_index) : 0;

      const mapping = WMO_CODE_MAP[code] || { label: 'OVERCAST', emoji: '☁️', icon: 'cloud' };

      if (weatherTempEl) weatherTempEl.textContent = `${tempF}`;
      if (conditionIconEl) conditionIconEl.textContent = mapping.emoji;
      if (weatherCondEl) weatherCondEl.textContent = mapping.label;
      if (weatherHumidityEl) weatherHumidityEl.textContent = `${humidity}%`;
      if (weatherPressureEl) weatherPressureEl.innerHTML = `${pressureVal}<span class="atmo-unit"> in</span>`;
      if (weatherUvEl) weatherUvEl.innerHTML = `${uvVal}<span class="atmo-unit">uv</span>`;
    }
  } catch (err) {
    console.warn('[HUD Weather] Offline or unable to fetch:', err);
    if (weatherCondEl && weatherTempEl.textContent === '--') {
      weatherCondEl.textContent = 'WEATHER OFFLINE';
    }
  }
}

/**
 * Dynamic Location Detection Pipeline
 * 1. Attempts navigator.geolocation (GPS / Device Geolocation)
 * 2. If denied or unsupported on TV browser, falls back to IP Geolocation (ipwho.is)
 * 3. Reverse geocodes coordinates to City, State
 */
async function detectLocation() {
  let detected = false;

  // 1. Try Browser / TV Geolocation API
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 300000,
          enableHighAccuracy: false,
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Reverse geocode via OpenStreetMap Nominatim
      try {
        const revRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'User-Agent': 'GimmeTV-AmbientPWA/1.0' } }
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          const addr = revData.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'LOCAL AREA';
          const state = addr['ISO3166-2-lvl4']?.replace('US-', '') || addr.state || '';
          const formattedName = state ? `${city.toUpperCase()}, ${state.toUpperCase()}` : city.toUpperCase();

          currentCoordinates = { lat, lon, name: formattedName };
          if (locationNameEl) locationNameEl.textContent = formattedName;
          detected = true;
          await fetchWeather();
          return;
        }
      } catch (revErr) {
        console.warn('[Location] Reverse geocoding failed, using coords:', revErr);
        currentCoordinates = { lat, lon, name: 'CURRENT LOCATION' };
        if (locationNameEl) locationNameEl.textContent = 'CURRENT LOCATION';
        detected = true;
        await fetchWeather();
        return;
      }
    } catch (geoErr) {
      // Geolocation denied, timed out, or unprompted on TV; proceed to IP fallback
      console.info('[Location] Browser geolocation unavailable, attempting IP location:', geoErr.message);
    }
  }

  // 2. Fallback: Network IP Geolocation
  if (!detected) {
    try {
      const ipRes = await fetch('https://ipwho.is/', { cache: 'no-store' });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.success && ipData.latitude && ipData.longitude) {
          const city = ipData.city || 'LOCAL';
          const region = ipData.region_code || ipData.region || '';
          const formattedName = region
            ? `${city.toUpperCase()}, ${region.toUpperCase()}`
            : city.toUpperCase();

          currentCoordinates = {
            lat: ipData.latitude,
            lon: ipData.longitude,
            name: formattedName,
          };
          if (locationNameEl) locationNameEl.textContent = formattedName;
          detected = true;
          await fetchWeather();
          return;
        }
      }
    } catch (ipErr) {
      console.warn('[Location] IP geolocation fetch failed:', ipErr);
    }
  }

  // 3. Ultimate Fallback (Default Waltham, MA)
  if (!detected) {
    if (locationNameEl) locationNameEl.textContent = currentCoordinates.name;
    await fetchWeather();
  }
}

// Dual-Buffer Stage Elements
const layerAEl = document.getElementById('layer-a');
const layerBEl = document.getElementById('layer-b');
const backdropAEl = document.getElementById('backdrop-a');
const backdropBEl = document.getElementById('backdrop-b');
const artworkAEl = document.getElementById('artwork-a');
const artworkBEl = document.getElementById('artwork-b');
const stageEl = document.getElementById('stage');

// Bottom-Left Minimal Artwork Caption Elements
const artTitleEl = document.getElementById('hud-art-title');
const artArtistWrapEl = document.getElementById('hud-art-artist-wrap');
const artArtistEl = document.getElementById('hud-art-artist');
const artYearWrapEl = document.getElementById('hud-art-year-wrap');
const artYearEl = document.getElementById('hud-art-year');
const artSourceWrapEl = document.getElementById('hud-art-source-wrap');
const artSourceNameEl = document.getElementById('hud-art-source-name');
const artCaptionEl = document.getElementById('artwork-caption');

// Widescreen & Landscape TV Aspect Ratio Thresholds
const MIN_LANDSCAPE_RATIO = 1.2; // Keeps 4:3 paintings (1.33+) and widescreen; rejects portraits/squares
const FULL_BLEED_MIN_RATIO = 1.60; // Auto-fills 16:9 screen edge-to-edge
const FULL_BLEED_MAX_RATIO = 2.25;
const MIN_TV_IMAGE_WIDTH = 750;

/**
 * Immediate Zero-Wait Baseline Masterworks (Guarantees instant paint on boot)
 */
const BASELINE_MASTERWORKS = [
  {
    id: 'aic-monet-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    aspectRatio: 1.25,
    imageUrl: 'https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/1200,/0/default.jpg',
  },
  {
    id: 'aic-bedroom',
    title: 'The Bedroom',
    artist: 'Vincent van Gogh',
    year: '1889',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    aspectRatio: 1.25,
    imageUrl: 'https://www.artic.edu/iiif/2/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/1200,/0/default.jpg',
  },
  {
    id: 'aic-wheat',
    title: 'Stacks of Wheat (End of Summer)',
    artist: 'Claude Monet',
    year: '1891',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    aspectRatio: 1.44,
    imageUrl: 'https://www.artic.edu/iiif/2/a38e2828-ec6f-ece1-a30f-70243449197b/full/1200,/0/default.jpg',
  },
  {
    id: 'aic-train',
    title: 'Arrival of the Normandy Train, Gare Saint-Lazare',
    artist: 'Claude Monet',
    year: '1877',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    aspectRatio: 1.35,
    imageUrl: 'https://www.artic.edu/iiif/2/0f1cc0e0-e42e-be16-3f71-2022da38cb93/full/1200,/0/default.jpg',
  },
  {
    id: 'nasa-carina',
    title: 'Cosmic Cliffs in the Carina Nebula',
    artist: 'NASA / ESA / CSA / STScI',
    year: '2022',
    source: 'NASA Cosmic Library',
    sourceIcon: '🔭',
    aspectRatio: 1.73,
    imageUrl: 'https://images-assets.nasa.gov/image/PIA14417/PIA14417~medium.jpg',
  },
];

/**
 * Multi-Source Artwork Ingestion & Dual-Buffer Engine
 */
let artworkQueue = [...BASELINE_MASTERWORKS];
let currentQueueIndex = 0;
let activeLayer = 'a'; // Alternates between 'a' and 'b'
let isTransitioning = false;
let rotationTimer = null;
const ROTATION_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes per slide

/**
 * Fisher-Yates Shuffle
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fetch wrapper with strict AbortController timeout so slow APIs never stall boot
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ingestion: Local Curated Manifest
 */
async function loadLocalManifest() {
  try {
    const res = await fetchWithTimeout('/local_art_manifest.json', { cache: 'no-store' }, 3000);
    if (!res.ok) throw new Error('Local manifest not found');
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('[Art] Local manifest load failed:', e);
    return [];
  }
}

/**
 * Ingestion: Art Institute of Chicago (AIC) - Landscape Filtered
 */
async function fetchAICArtworks() {
  try {
    const page = Math.floor(Math.random() * 8) + 1;
    const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=40&fields=id,title,artist_title,date_display,image_id,thumbnail`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500);
    if (!res.ok) throw new Error(`AIC status: ${res.status}`);
    const json = await res.json();
    const items = (json.data || [])
      .filter((d) => {
        if (!d.image_id || !d.title || !d.thumbnail?.width || !d.thumbnail?.height) return false;
        const ratio = d.thumbnail.width / d.thumbnail.height;
        return ratio >= MIN_LANDSCAPE_RATIO;
      })
      .map((d) => {
        const targetWidth = d.thumbnail.width >= 1200 ? 1200 : 843;
        return {
          id: `aic-${d.id}`,
          title: d.title || 'Untitled',
          artist: d.artist_title || 'Unknown Artist',
          year: d.date_display || '',
          source: 'Art Institute of Chicago',
          sourceIcon: '🏛️',
          aspectRatio: d.thumbnail.width / d.thumbnail.height,
          imageUrl: `https://www.artic.edu/iiif/2/${d.image_id}/full/${targetWidth},/0/default.jpg`,
        };
      });
    return items;
  } catch (e) {
    console.warn('[Art] AIC fetch failed:', e);
    return [];
  }
}

/**
 * Ingestion: Cleveland Museum of Art (CMA) - Landscape Filtered
 */
async function fetchCMAArtworks() {
  try {
    const skip = Math.floor(Math.random() * 40);
    const url = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=40&skip=${skip}`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500);
    if (!res.ok) throw new Error(`CMA status: ${res.status}`);
    const json = await res.json();
    const items = (json.data || [])
      .filter((d) => {
        const web = d.images?.web;
        if (!web?.url || !web?.width || !web?.height) return false;
        const w = Number(web.width);
        const h = Number(web.height);
        return h > 0 && w / h >= MIN_LANDSCAPE_RATIO;
      })
      .map((d) => {
        const rawArtist = d.creators && d.creators[0] ? d.creators[0].description : 'Unknown Artist';
        const cleanArtist = rawArtist.split('(')[0].trim() || rawArtist;
        const w = Number(d.images.web.width);
        const h = Number(d.images.web.height);
        return {
          id: `cma-${d.id}`,
          title: d.title || 'Untitled',
          artist: cleanArtist,
          year: d.creation_date || '',
          source: 'Cleveland Museum of Art',
          sourceIcon: '🏛️',
          aspectRatio: w / h,
          imageUrl: d.images.web.url,
        };
      });
    return items;
  } catch (e) {
    console.warn('[Art] CMA fetch failed:', e);
    return [];
  }
}

/**
 * Ingestion: Picsum Photos (Curated Unsplash Fine Art Photography - Natural Landscapes Only)
 */
async function fetchPicsumPhotography() {
  try {
    const page = Math.floor(Math.random() * 8) + 1;
    const url = `https://picsum.photos/v2/list?page=${page}&limit=35`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 3000);
    if (!res.ok) throw new Error(`Picsum status: ${res.status}`);
    const list = await res.json();
    const candidates = list
      .filter((d) => d.width && d.height && d.width / d.height >= MIN_LANDSCAPE_RATIO)
      .map((d) => ({
        id: `picsum-${d.id}`,
        title: 'Curated Photography',
        artist: d.author || 'Featured Photographer',
        year: '',
        source: 'Curated Fine Photography',
        sourceIcon: '📷',
        aspectRatio: 16 / 9,
        imageUrl: `https://picsum.photos/id/${d.id}/1600/900.jpg`,
      }));

    if (candidates.length === 0) return [];

    // Probe image CDN responsiveness before queuing to avoid dead/522 hosts stalling rotation
    try {
      await preloadImage(candidates[0].imageUrl, 2500);
      return candidates;
    } catch (probeErr) {
      console.warn('[Art] Picsum image CDN unhealthy/timed out, skipping batch:', probeErr.message);
      return [];
    }
  } catch (e) {
    console.warn('[Art] Picsum photography fetch failed:', e);
    return [];
  }
}

/**
 * Ingestion: NASA Deep Space Imagery
 */
async function fetchNASAPhotography() {
  try {
    const queries = ['nebula', 'galaxy', 'hubble', 'webb'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    const url = `https://images-api.nasa.gov/search?q=${q}&media_type=image`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500);
    if (!res.ok) throw new Error(`NASA status: ${res.status}`);
    const json = await res.json();
    const items = (json.collection?.items || [])
      .filter((it) => it.links && it.links[0] && it.links[0].href && it.data && it.data[0])
      .slice(0, 15)
      .map((it) => {
        const d = it.data[0];
        return {
          id: `nasa-${d.nasa_id || Math.random()}`,
          title: d.title || 'Cosmic Deep Space',
          artist: d.secondary_creator || 'NASA / STScI',
          year: d.date_created ? d.date_created.substring(0, 4) : '',
          source: 'NASA Cosmic Library',
          sourceIcon: '🔭',
          imageUrl: it.links[0].href,
        };
      });
    return items;
  } catch (e) {
    console.warn('[Art] NASA fetch failed:', e);
    return [];
  }
}

/**
 * Strip HTML tags from Wikimedia Commons extmetadata fields
 */
function stripHtml(raw) {
  if (!raw) return '';
  const doc = new DOMParser().parseFromString(String(raw), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

/**
 * Clean up Wikimedia file/object titles for gallery-grade captions
 */
function cleanWikiTitle(rawTitle, fallbackLabel) {
  let title = stripHtml(rawTitle)
    .replace(/^File:/i, '')
    .replace(/\.(jpe?g|png|webp|gif)$/i, '')
    .replace(/\s*-\s*panoramio\s*\(\d+\)\s*$/i, '')
    .replace(/\s*\(\d{6,}\)\s*$/, '')
    .replace(/_/g, ' ')
    .trim();

  // Replace raw numeric camera/social filenames with a clean descriptive label
  if (!title || /^[\d\s_-]+(o|n)?(-\d+)?$/i.test(title) || /^(IMG|DSC|DSCF|PXL|MVIMG)[_\s-]?\d+/i.test(title)) {
    return fallbackLabel;
  }
  return title;
}

/**
 * Ingestion: Wikimedia Commons (Street Art, Murals, Graffiti & Contemporary Public Art)
 */
async function fetchWikimediaStreetArt() {
  const categories = [
    { name: 'Category:Street_art', label: 'Street Art' },
    { name: 'Category:Murals', label: 'Wall Mural' },
    { name: 'Category:East_Side_Gallery', label: 'East Side Gallery Mural' },
    { name: 'Category:Street_art_in_London', label: 'London Street Art' },
    { name: 'Category:Street_art_in_New_York_City', label: 'NYC Street Art' },
    { name: 'Category:Street_art_in_Berlin', label: 'Berlin Street Art' },
    { name: 'Category:Street_art_in_Melbourne', label: 'Melbourne Street Art' },
    { name: 'Category:Graffiti', label: 'Graffiti Art' },
    { name: 'Category:Contemporary_art', label: 'Contemporary Art' },
  ];

  // Pick 2 distinct categories per boot for rich variety
  const picked = shuffleArray(categories).slice(0, 2);

  try {
    const results = await Promise.all(
      picked.map(async (cat) => {
        const url =
          `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers` +
          `&gcmtitle=${encodeURIComponent(cat.name)}&gcmtype=file&gcmlimit=25` +
          `&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1600&format=json&origin=*`;

        const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500);
        if (!res.ok) throw new Error(`Wikimedia status: ${res.status}`);
        const json = await res.json();
        const pages = Object.values(json.query?.pages || {});

        return pages
          .filter((p) => {
            const ii = p.imageinfo?.[0];
            if (!ii || !ii.thumburl || !ii.mime?.startsWith('image/') || ii.mime === 'image/svg+xml') {
              return false;
            }
            const w = ii.thumbwidth || ii.width || 0;
            const h = ii.thumbheight || ii.height || 0;
            return w >= MIN_TV_IMAGE_WIDTH && h > 0 && w / h >= MIN_LANDSCAPE_RATIO;
          })
          .map((p) => {
            const ii = p.imageinfo[0];
            const meta = ii.extmetadata || {};
            const w = ii.thumbwidth || ii.width;
            const h = ii.thumbheight || ii.height;

            const rawTitle = meta.ObjectName?.value || p.title;
            const title = cleanWikiTitle(rawTitle, cat.label);

            let artist = stripHtml(meta.Artist?.value || '')
              .replace(/^User:/i, '')
              .replace(/\s*\([^)]*\)\s*/g, ' ')
              .trim();
            if (!artist || /^unknown$/i.test(artist) || artist.length > 60) {
              artist = 'Unknown Artist';
            }

            const rawDate = stripHtml(meta.DateTimeOriginal?.value || '');
            const yearMatch = rawDate.match(/\b(19|20)\d{2}\b/);
            const year = yearMatch ? yearMatch[0] : '';

            return {
              id: `wiki-${p.pageid}`,
              title,
              artist,
              year,
              source: 'Wikimedia Commons',
              sourceIcon: '🎨',
              aspectRatio: w / h,
              imageUrl: ii.thumburl,
            };
          });
      })
    );

    return results.flat();
  } catch (e) {
    console.warn('[Art] Wikimedia Commons fetch failed:', e);
    return [];
  }
}

/**
 * Apply artwork assets to buffer layer (a or b)
 * Automatically switches between full-bleed cover (16:9-ish) and contain+halo (4:3 / 3:2)
 */
function applyArtworkToLayer(layerKey, artwork, naturalRatio = null) {
  if (!artwork || !artwork.imageUrl) return;

  const ratio = naturalRatio || artwork.aspectRatio || 1.5;
  const shouldFillCover = ratio >= FULL_BLEED_MIN_RATIO && ratio <= FULL_BLEED_MAX_RATIO;

  const backdropEl = layerKey === 'a' ? backdropAEl : backdropBEl;
  const foregroundEl = layerKey === 'a' ? artworkAEl : artworkBEl;

  if (backdropEl) {
    backdropEl.style.backgroundImage = `url("${artwork.imageUrl}")`;
  }
  if (foregroundEl) {
    foregroundEl.classList.toggle('fill-cover', shouldFillCover);
    foregroundEl.src = artwork.imageUrl;
  }
}

/**
 * Update Bottom-Left Minimal Artwork Caption
 */
function updateArtworkHUD(artwork) {
  if (!artwork) return;

  if (artTitleEl) artTitleEl.textContent = artwork.title || 'Untitled';

  const hasArtist = Boolean(artwork.artist && artwork.artist !== 'Unknown Artist');
  const hasYear = Boolean(artwork.year);

  if (artArtistWrapEl) {
    artArtistWrapEl.style.display = hasArtist || hasYear ? 'inline' : 'none';
  }
  if (artArtistEl) {
    artArtistEl.textContent = hasArtist ? artwork.artist : '';
  }
  if (artYearWrapEl && artYearEl) {
    if (hasYear) {
      artYearEl.textContent = artwork.year;
      artYearWrapEl.style.display = 'inline';
      // Adjust separator comma only if artist is also shown
      artYearWrapEl.firstChild.textContent = hasArtist ? ', ' : '';
    } else {
      artYearWrapEl.style.display = 'none';
    }
  }

  if (artSourceWrapEl && artSourceNameEl) {
    if (artwork.source) {
      artSourceNameEl.textContent = artwork.source;
      artSourceWrapEl.style.display = 'inline';
    } else {
      artSourceWrapEl.style.display = 'none';
    }
  }
}

/**
 * Preload an image URL into browser memory with safety timeout & universal TV aspect-ratio gate
 */
function preloadImage(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Preload timed out for ' + url));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      const ratio = h > 0 ? w / h : 0;

      if (w < MIN_TV_IMAGE_WIDTH || ratio < MIN_LANDSCAPE_RATIO) {
        reject(new Error(`Non-landscape or low-res (${w}x${h}, ratio ${ratio.toFixed(2)})`));
        return;
      }

      resolve({ img, ratio });
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Failed to load ' + url));
    };
    img.src = url;
  });
}

/**
 * Commit artwork to target layer, cross-fade buffers, and update caption
 */
function commitLayerTransition(targetLayerKey, artwork, ratio) {
  applyArtworkToLayer(targetLayerKey, artwork, ratio);

  if (targetLayerKey === 'a') {
    if (layerAEl) {
      layerAEl.classList.add('active');
      layerAEl.setAttribute('aria-hidden', 'false');
    }
    if (layerBEl) {
      layerBEl.classList.remove('active');
      layerBEl.setAttribute('aria-hidden', 'true');
    }
    activeLayer = 'a';
  } else {
    if (layerBEl) {
      layerBEl.classList.add('active');
      layerBEl.setAttribute('aria-hidden', 'false');
    }
    if (layerAEl) {
      layerAEl.classList.remove('active');
      layerAEl.setAttribute('aria-hidden', 'true');
    }
    activeLayer = 'b';
  }

  if (artCaptionEl) {
    artCaptionEl.style.opacity = '0';
    setTimeout(() => {
      updateArtworkHUD(artwork);
      artCaptionEl.style.opacity = '1';
    }, 350);
  } else {
    updateArtworkHUD(artwork);
  }

  setTimeout(() => {
    isTransitioning = false;
  }, 1600);
}

/**
 * Dual-Buffer Cross-Fade Transition
 */
async function transitionToNextArtwork(skipCount = 0) {
  if (isTransitioning || artworkQueue.length === 0) return;

  const targetLayerKey = activeLayer === 'a' ? 'b' : 'a';

  if (skipCount > 12) {
    console.warn('[Art] Too many consecutive skips, applying verified baseline fallback');
    isTransitioning = true;
    const fallback = BASELINE_MASTERWORKS[Math.floor(Math.random() * BASELINE_MASTERWORKS.length)];
    let fallbackRatio = fallback.aspectRatio || 1.33;
    try {
      const result = await preloadImage(fallback.imageUrl, 5000);
      fallbackRatio = result.ratio;
    } catch (_) {
      // Proceed with fallback asset directly so screen never remains blank
    }
    commitLayerTransition(targetLayerKey, fallback, fallbackRatio);
    return;
  }

  isTransitioning = true;

  // Advance queue index
  currentQueueIndex = (currentQueueIndex + 1) % artworkQueue.length;
  const nextArtwork = artworkQueue[currentQueueIndex];

  let loadedRatio = nextArtwork.aspectRatio || null;
  try {
    // Preload image and validate landscape aspect ratio before buffer swap
    const result = await preloadImage(nextArtwork.imageUrl, 5000);
    loadedRatio = result.ratio;
  } catch (err) {
    console.warn('[Art] Skipping unsuitable artwork:', nextArtwork.title, err.message);
    isTransitioning = false;
    // Advance to next
    transitionToNextArtwork(skipCount + 1);
    return;
  }

  commitLayerTransition(targetLayerKey, nextArtwork, loadedRatio);
}

/**
 * Start Auto-Rotation Timer
 */
function startRotationCycle() {
  if (rotationTimer) clearInterval(rotationTimer);
  rotationTimer = setInterval(() => {
    transitionToNextArtwork();
  }, ROTATION_INTERVAL_MS);
}

/**
 * Progressively merge newly resolved collections into the live queue without blocking boot
 */
function mergeIntoArtworkQueue(newItems) {
  if (!Array.isArray(newItems) || newItems.length === 0) return;
  const existingIds = new Set(artworkQueue.map((item) => item.id));
  const freshItems = newItems.filter((item) => item && item.imageUrl && !existingIds.has(item.id));
  if (freshItems.length === 0) return;

  const currentItem = artworkQueue[currentQueueIndex];
  const before = artworkQueue.slice(0, currentQueueIndex + 1);
  const remaining = artworkQueue.slice(currentQueueIndex + 1);
  const mergedTail = shuffleArray([...remaining, ...freshItems]);

  artworkQueue = currentItem ? [...before, ...mergedTail] : shuffleArray(freshItems);
  console.log(`[Art Engine] Merged ${freshItems.length} pieces. Total queue: ${artworkQueue.length}`);
}

/**
 * Populate In-Memory Artwork Queue (Non-Blocking Progressive Ingestion)
 */
function initializeArtworkEngine() {
  // Synchronously render the initial baseline piece on layer A immediately
  const initialArtwork = artworkQueue[0];
  applyArtworkToLayer('a', initialArtwork, initialArtwork?.aspectRatio || 1.25);
  updateArtworkHUD(initialArtwork);

  // Guard against boot image failure so stage never sits black
  if (artworkAEl) {
    const handleBootError = () => {
      if (activeLayer === 'a' && !isTransitioning) {
        console.warn('[Art] Initial layer A image failed, advancing to next artwork');
        transitionToNextArtwork();
      }
    };
    artworkAEl.addEventListener('error', handleBootError);
    if (artworkAEl.complete && artworkAEl.naturalWidth === 0) {
      handleBootError();
    }
  }

  // Start rotation immediately; never block on slow remote sources
  startRotationCycle();

  // Concurrently fetch each collection and merge progressively as each resolves
  const sources = [
    loadLocalManifest(),
    fetchAICArtworks(),
    fetchCMAArtworks(),
    fetchNASAPhotography(),
    fetchWikimediaStreetArt(),
    fetchPicsumPhotography(),
  ];

  sources.forEach((promise) => {
    promise
      .then((items) => mergeIntoArtworkQueue(items))
      .catch((err) => console.warn('[Art] Collection warning:', err));
  });
}

/**
 * User Interaction Listeners (Tap / Remote Click / Keyboard)
 */
function setupUserControls() {
  // Tap anywhere on the stage advances immediately
  if (stageEl) {
    stageEl.addEventListener('click', () => {
      transitionToNextArtwork();
      startRotationCycle(); // Reset timer
    });
  }

  // Keyboard navigation for TV Remote (D-Pad right, Enter, Space)
  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'Enter', ' ', 'MediaTrackNext'].includes(e.key)) {
      e.preventDefault();
      transitionToNextArtwork();
      startRotationCycle(); // Reset timer
    }
  });
}

// Initial Boot Sequence
updateClock();
setInterval(updateClock, 1000);

if (buildStampEl) {
  const currentStamp = formatBuildStamp();
  buildStampEl.textContent = currentStamp;
  buildStampEl.setAttribute('data-version', currentStamp);
  buildStampEl.classList.remove('checking', 'updating', 'up-to-date');

  // Manual tap/click on version stamp triggers immediate phone-home update check
  buildStampEl.addEventListener('click', (e) => {
    e.stopPropagation(); // Do not advance artwork stage on version tap
    checkPhoneHomeUpdate(true);
  });

  buildStampEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      checkPhoneHomeUpdate(true);
    }
  });
}

// Detect Location dynamically on boot
detectLocation();

// Refresh weather every 15 minutes as per specification
setInterval(fetchWeather, 15 * 60 * 1000);

// Periodically refresh location every 6 hours
setInterval(detectLocation, 6 * 60 * 60 * 1000);

// Boot Artwork Engine
initializeArtworkEngine();
setupUserControls();

/**
 * ----------------------------------------------------
 * SCREEN WAKE LOCK & TV STANDBY PREVENTION ENGINE
 * Keeps the TV panel awake continuously as an ambient screensaver
 * ----------------------------------------------------
 */
let wakeLockSentinel = null;
const wakeStatusDotEl = document.getElementById('wake-status-dot');

async function requestScreenWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      if (wakeStatusDotEl) wakeStatusDotEl.title = 'Display Wake Lock Active';
      console.log('[WakeLock] Screen Wake Lock successfully active');

      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        console.log('[WakeLock] Screen Wake Lock was released');
      });
    } catch (err) {
      console.warn('[WakeLock] Could not acquire screen wake lock:', err.message);
      activateFallbackWakeVideo();
    }
  } else {
    console.info('[WakeLock] Screen Wake Lock API unsupported; activating TV video loop fallback');
    activateFallbackWakeVideo();
  }
}

// Fallback for Smart TV browsers without native navigator.wakeLock
let fallbackVideoEl = null;
function activateFallbackWakeVideo() {
  if (fallbackVideoEl) return;
  try {
    fallbackVideoEl = document.createElement('video');
    fallbackVideoEl.setAttribute('playsinline', '');
    fallbackVideoEl.setAttribute('muted', '');
    fallbackVideoEl.setAttribute('loop', '');
    fallbackVideoEl.muted = true;
    fallbackVideoEl.style.position = 'fixed';
    fallbackVideoEl.style.width = '1px';
    fallbackVideoEl.style.height = '1px';
    fallbackVideoEl.style.opacity = '0.001';
    fallbackVideoEl.style.pointerEvents = 'none';
    fallbackVideoEl.style.zIndex = '-1';
    fallbackVideoEl.src = 'data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQN+BA0KFgQIYU4BnQN+BA0KFgQIYU4BnQN+BA0KFgQIYU4BnQN+BA0KFgQIYU4BnQN+B';
    document.body.appendChild(fallbackVideoEl);
    fallbackVideoEl.play().catch(() => {});
  } catch (e) {}
}

// Auto-reacquire Wake Lock on visibility change (when TV input switches back or window resumes)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestScreenWakeLock();
    // Proactively query phone-home update on window resume
    checkPhoneHomeUpdate(false);
  }
});

// Reacquire on user interaction
['click', 'touchstart', 'keydown'].forEach((evt) => {
  window.addEventListener(
    evt,
    () => {
      if (!wakeLockSentinel) {
        requestScreenWakeLock();
      }
    },
    { passive: true }
  );
});

// Request Screen Wake Lock immediately on boot
requestScreenWakeLock();

/**
 * ----------------------------------------------------
 * PWA SERVICE WORKER & PHONE-HOME AUTO-UPDATE ENGINE
 * (Conforming to Sections 1.2 & 5 of Architecture Guide)
 * ----------------------------------------------------
 */
let swRegistration = null;
let isCheckingUpdate = false;
let updateAvailableVersion = null;

/**
 * Display subtle "UPDATE AVAILABLE" badge on the version button until tapped
 */
function showUpdateAvailableUI(newVer = null) {
  if (!buildStampEl) return;
  buildStampEl.classList.remove('checking', 'updating', 'up-to-date');
  buildStampEl.classList.add('update-available');
  buildStampEl.textContent = 'UPDATE AVAILABLE';
  buildStampEl.removeAttribute('aria-busy');
  buildStampEl.title = newVer
    ? `Update ${newVer} available — tap to reload`
    : 'New update ready — tap to reload';
}

/**
 * Apply pending update when user taps "UPDATE AVAILABLE"
 */
function applyPendingUpdate() {
  if (buildStampEl) {
    buildStampEl.classList.remove('checking', 'update-available', 'up-to-date');
    buildStampEl.classList.add('updating');
    buildStampEl.textContent = 'UPDATING...';
  }

  if (swRegistration && swRegistration.waiting && navigator.serviceWorker.controller) {
    console.log('[PWA] Activating waiting service worker...');
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    // Safety reload fallback in case controllerchange does not fire
    setTimeout(() => {
      window.location.reload();
    }, 2500);
    return;
  }

  console.log('[PWA] Applying server update via reload...');
  if (buildStampEl) buildStampEl.textContent = 'RELOADING...';
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

/**
 * Phone-Home Update Checker (queries both Service Worker & /version.json)
 * @param {boolean} isManual - true when explicitly tapped/clicked by user
 */
async function checkPhoneHomeUpdate(isManual = false) {
  // If an update is already flagged and user taps the badge, apply it right away
  if (
    isManual &&
    (updateAvailableVersion || (swRegistration?.waiting && navigator.serviceWorker.controller))
  ) {
    applyPendingUpdate();
    return;
  }

  if (isCheckingUpdate) return;
  isCheckingUpdate = true;

  if (isManual && buildStampEl) {
    buildStampEl.classList.remove('up-to-date', 'updating', 'update-available');
    buildStampEl.classList.add('checking');
    buildStampEl.textContent = 'CHECKING...';
    buildStampEl.setAttribute('aria-busy', 'true');
  }

  try {
    // 1. Check Service Worker for newer sw.js
    if (swRegistration) {
      await swRegistration.update();

      if (swRegistration.waiting && navigator.serviceWorker.controller) {
        updateAvailableVersion = updateAvailableVersion || 'new';
        showUpdateAvailableUI(updateAvailableVersion);
        return;
      }
    }

    // 2. Fetch live /version.json bypassing all caches
    const verRes = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (verRes.ok) {
      const verData = await verRes.json();
      if (verData?.version && verData.version !== APP_BUILD_VERSION) {
        console.log(`[PWA] Newer version detected: ${verData.version} (current: ${APP_BUILD_VERSION})`);
        updateAvailableVersion = verData.version;
        showUpdateAvailableUI(verData.version);
        return;
      }
    }

    // 3. If manual check completed and no update was found, display confirmation
    if (isManual && buildStampEl) {
      buildStampEl.classList.remove('checking', 'updating', 'update-available');
      buildStampEl.classList.add('up-to-date');
      buildStampEl.textContent = 'LATEST VERSION ✓';
      buildStampEl.removeAttribute('aria-busy');

      setTimeout(() => {
        if (!updateAvailableVersion) {
          buildStampEl.classList.remove('up-to-date');
          buildStampEl.textContent = APP_BUILD_VERSION;
        }
      }, 2200);
    }
  } catch (err) {
    console.warn('[PWA] Phone-home check encountered an error:', err);
    if (isManual && buildStampEl) {
      buildStampEl.classList.remove('checking', 'updating');
      buildStampEl.textContent = 'OFFLINE';
      buildStampEl.removeAttribute('aria-busy');

      setTimeout(() => {
        if (updateAvailableVersion) {
          showUpdateAvailableUI(updateAvailableVersion);
        } else {
          buildStampEl.textContent = APP_BUILD_VERSION;
        }
      }, 2000);
    }
  } finally {
    isCheckingUpdate = false;
  }
}

/**
 * Listen for newly discovered Service Worker updates
 */
function listenForSWUpdates(reg) {
  if (!reg) return;

  // If a newer worker is already waiting, notify user in the HUD
  if (reg.waiting && navigator.serviceWorker.controller) {
    console.log('[PWA] Waiting service worker ready for activation');
    updateAvailableVersion = updateAvailableVersion || 'new';
    showUpdateAvailableUI();
  }

  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    if (!newWorker) return;

    // Do NOT flag initial app install as an update
    if (!navigator.serviceWorker.controller) {
      console.log('[PWA] Initial service worker installing.');
      return;
    }

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('[PWA] New version ready! Displaying UPDATE AVAILABLE.');
        updateAvailableVersion = updateAvailableVersion || 'new';
        showUpdateAvailableUI();
      }
    });
  });
}

async function registerPWA() {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] Service Worker registered with scope:', swRegistration.scope);

      // Listen for background SW updates
      listenForSWUpdates(swRegistration);

      // Handle transparent reload when a new service worker claims control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] New version activated, transparently reloading interface...');
          if (buildStampEl) {
            buildStampEl.classList.remove('update-available', 'checking');
            buildStampEl.classList.add('updating');
            buildStampEl.textContent = 'RELOADING...';
          }
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
      });
    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  }

  // Deterministic auto-check on boot
  checkPhoneHomeUpdate(false);

  // Check for updates whenever window regains focus
  window.addEventListener('focus', () => {
    checkPhoneHomeUpdate(false);
  });

  // Periodic background auto-check every 15 minutes
  setInterval(() => {
    checkPhoneHomeUpdate(false);
  }, 15 * 60 * 1000);
}

/**
 * ----------------------------------------------------
 * IN-APP PWA INSTALL PROMPT
 * ----------------------------------------------------
 */
let deferredInstallPrompt = null;
const pwaInstallBtn = document.getElementById('pwa-install-btn');

function setupPWAInstall() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  // If already running in standalone PWA mode, suppress install button
  if (isStandalone) {
    if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (pwaInstallBtn) {
      pwaInstallBtn.style.display = 'inline-flex';
    }
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        pwaInstallBtn.style.display = 'none';
        deferredInstallPrompt = null;
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
    deferredInstallPrompt = null;
    console.log('[PWA] App successfully installed');
  });
}

// Initialize PWA Lifecycle
registerPWA();
setupPWAInstall();


