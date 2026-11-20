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
export const APP_BUILD_VERSION = 'v1.11192026.2052';

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

// TV Aspect Ratio & Resolution Thresholds (Relaxed for classic museum canvases framed by ambient halo)
const MIN_ASPECT_RATIO = 0.78; // Allows 4:5 portraits, squares, 4:3, and widescreen; rejects skinny phone strips
const FULL_BLEED_MIN_RATIO = 1.55; // Auto-fills 16:9 screen edge-to-edge
const FULL_BLEED_MAX_RATIO = 2.25;
const MIN_TV_LONG_EDGE = 720; // Crisp TV resolution on either width or height
const MIN_TV_SHORT_EDGE = 480;

/**
 * Immediate Zero-Wait Baseline Masterworks (Diverse starter pool across art & space)
 */
const BASELINE_MASTERWORKS = [
  {
    id: 'aic-nighthawks',
    title: 'Nighthawks',
    artist: 'Edward Hopper',
    year: '1942',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    providerKey: 'aic',
    aspectRatio: 1.83,
    imageUrl: 'https://www.artic.edu/iiif/2/831a05de-d3f6-f4fa-a460-23008dd58dda/full/1200,/0/default.jpg',
  },
  {
    id: 'aic-grande-jatte',
    title: 'A Sunday on La Grande Jatte — 1884',
    artist: 'Georges Seurat',
    year: '1884–86',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    providerKey: 'aic',
    aspectRatio: 1.49,
    imageUrl: 'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/1200,/0/default.jpg',
  },
  {
    id: 'aic-monet-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    providerKey: 'aic',
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
    providerKey: 'aic',
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
    providerKey: 'aic',
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
    providerKey: 'aic',
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
    providerKey: 'nasa',
    aspectRatio: 1.73,
    imageUrl: 'https://images-assets.nasa.gov/image/PIA14417/PIA14417~medium.jpg',
  },
  {
    id: 'nasa-lagoon',
    title: 'Hubble Reveals Heart of Lagoon Nebula',
    artist: 'NASA / ESA / STScI',
    year: '2017',
    source: 'NASA Cosmic Library',
    sourceIcon: '🔭',
    providerKey: 'nasa',
    aspectRatio: 1.5,
    imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001955/GSFC_20171208_Archive_e001955~medium.jpg',
  },
];

/**
 * Lightweight "Recently Seen" Ring Buffer (IDs only, ~6KB max, zero image caching)
 */
const SEEN_HISTORY_KEY = 'gimme_tv_seen_ids';
const MAX_SEEN_HISTORY = 400;
let seenHistoryList = [];
let seenHistorySet = new Set();

function loadSeenHistory() {
  try {
    const raw = localStorage.getItem(SEEN_HISTORY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      seenHistoryList = parsed.filter((id) => typeof id === 'string').slice(-MAX_SEEN_HISTORY);
      seenHistorySet = new Set(seenHistoryList);
    }
  } catch (e) {
    console.warn('[Art] Could not read seen history:', e);
  }
}

function recordSeenArtwork(id) {
  if (!id) return;
  if (seenHistorySet.has(id)) {
    seenHistoryList = seenHistoryList.filter((item) => item !== id);
  }
  seenHistoryList.push(id);
  if (seenHistoryList.length > MAX_SEEN_HISTORY) {
    seenHistoryList = seenHistoryList.slice(-MAX_SEEN_HISTORY);
  }
  seenHistorySet = new Set(seenHistoryList);
  try {
    localStorage.setItem(SEEN_HISTORY_KEY, JSON.stringify(seenHistoryList));
  } catch (_) {
    // Ignore storage quota / private mode restrictions
  }
}

function hasRecentlySeen(id) {
  return Boolean(id && seenHistorySet.has(id));
}

/**
 * 8-Source Equal-Seat Maximum Variety Engine
 * Strict rules:
 * 1. Equal seat cap (MAX_ITEMS_PER_PROVIDER = 6) so fast/large APIs never flood the queue.
 * 2. Provider-level round-robin across 8 distinct seats (Wikimedia capped to 1 of 8 seats ~12.5%).
 * 3. Hard cooldown: never repeat a provider back-to-back (4-slide window) or an artist within 8 slides.
 * 4. No tail dump: stops dealing once < 3 distinct providers remain, triggering an early fresh refill.
 */
const PROVIDER_KEYS = ['met', 'aic', 'cma', 'smk', 'smithsonian', 'loc', 'nasa', 'wikimedia'];
const MAX_ITEMS_PER_PROVIDER = 6;
const PROVIDER_COOLDOWN_WINDOW = 4;
const ARTIST_COOLDOWN_WINDOW = 8;

const providerPools = {
  met: [],
  aic: [],
  cma: [],
  smk: [],
  smithsonian: [],
  loc: [],
  nasa: [],
  wikimedia: [],
};
const queuedIds = new Set();
const usedPages = {
  met: new Set(),
  aic: new Set(),
  cma: new Set(),
  smk: new Set(),
  smithsonian: new Set(),
  loc: new Set(),
  nasa: new Set(),
};

let artworkQueue = [];
let currentQueueIndex = 0;
let activeLayer = 'a'; // Alternates between 'a' and 'b'
let isTransitioning = false;
let isReplenishing = false;
let hasBootAutoAdvanced = false;
let bootUpgradeTimer = null;
let rotationTimer = null;
const ROTATION_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes per slide
const BOOT_UPGRADE_DELAY_MS = 6000; // Auto-advance from starter to fresh remote art after 6s
const REPLENISH_THRESHOLD = 10; // Refill early while queue still has balanced slides

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
 * Pick an unused random integer in [minVal, maxVal] for deep API paging
 */
function pickUniqueRandomPage(bucketKey, minVal, maxVal) {
  const used = usedPages[bucketKey];
  if (used.size >= (maxVal - minVal + 1) * 0.8) {
    used.clear();
  }
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  const fallback = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  used.add(fallback);
  return fallback;
}

/**
 * Fetch wrapper with strict AbortController timeout so slow APIs never stall boot
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Helper to validate dimensions against our relaxed TV framing thresholds
 */
function passesDimensionGate(width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (w <= 0 || h <= 0) return false;
  const ratio = w / h;
  const longEdge = Math.max(w, h);
  const shortEdge = Math.min(w, h);
  return ratio >= MIN_ASPECT_RATIO && longEdge >= MIN_TV_LONG_EDGE && shortEdge >= MIN_TV_SHORT_EDGE;
}

/**
 * 1. The Metropolitan Museum of Art (v1.1 Elastic Search + Object Details)
 */
async function fetchMetArtworks() {
  const queries = [
    'painting',
    'landscape',
    'impressionism',
    'flowers',
    'woodblock',
    'sea',
    'garden',
    'still life',
    'architecture',
    'night',
    'forest',
    'textile',
    'ceramic',
    'modern',
    'japan',
    'european',
  ];

  try {
    const q = queries[Math.floor(Math.random() * queries.length)];
    const offset = pickUniqueRandomPage('met', 0, 260);
    const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1.1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(q)}&offset=${offset}&limit=12`;
    const res = await fetchWithTimeout(searchUrl, { cache: 'no-store' }, 6000);
    if (!res.ok) throw new Error(`Met search status: ${res.status}`);
    const json = await res.json();
    const ids = shuffleArray(json.objectIDs || []).slice(0, 8);
    if (ids.length === 0) return [];

    const details = await Promise.allSettled(
      ids.map(async (objectId) => {
        const objRes = await fetchWithTimeout(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
          { cache: 'no-store' },
          5000
        );
        if (!objRes.ok) return null;
        const obj = await objRes.json();
        const imageUrl = obj.primaryImageSmall || obj.primaryImage;
        if (!imageUrl || !obj.isPublicDomain) return null;

        const yearMatch = String(obj.objectDate || '').match(/\b(1[0-9]\d{2}|20\d{2})\b/);
        return {
          id: `met-${obj.objectID}`,
          title: obj.title || 'Untitled',
          artist: obj.artistDisplayName || obj.culture || 'Unknown Artist',
          year: yearMatch ? yearMatch[0] : obj.objectDate ? String(obj.objectDate).slice(0, 20) : '',
          source: 'The Metropolitan Museum of Art',
          sourceIcon: '🏛️',
          providerKey: 'met',
          imageUrl,
        };
      })
    );

    return details
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);
  } catch (e) {
    console.warn('[Art] Met fetch failed:', e);
    return [];
  }
}

/**
 * 2. Art Institute of Chicago (AIC) - Deep Public-Domain / IIIF
 */
async function fetchAICArtworks() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const page = pickUniqueRandomPage('aic', 1, 450);
      const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=25&fields=id,title,artist_title,date_display,image_id,thumbnail`;
      const res = await fetchWithTimeout(url, { cache: 'no-store' }, 6500);
      if (!res.ok) throw new Error(`AIC status: ${res.status}`);
      const json = await res.json();
      const items = (json.data || [])
        .filter((d) => {
          if (!d.image_id || !d.title || !d.thumbnail?.width || !d.thumbnail?.height) return false;
          return d.thumbnail.width / d.thumbnail.height >= MIN_ASPECT_RATIO;
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
            providerKey: 'aic',
            aspectRatio: d.thumbnail.width / d.thumbnail.height,
            imageUrl: `https://www.artic.edu/iiif/2/${d.image_id}/full/${targetWidth},/0/default.jpg`,
          };
        });
      if (items.length > 0) return items;
    } catch (e) {
      console.warn('[Art] AIC fetch failed:', e);
      return [];
    }
  }
  return [];
}

/**
 * 3. Cleveland Museum of Art (CMA) - Deep CC0 Open Access
 */
async function fetchCMAArtworks() {
  try {
    const skip = pickUniqueRandomPage('cma', 0, 3200);
    const url = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&cc0=1&limit=20&skip=${skip}`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 7000);
    if (!res.ok) throw new Error(`CMA status: ${res.status}`);
    const json = await res.json();
    return (json.data || [])
      .filter((d) => {
        const web = d.images?.web;
        if (!web?.url || !web?.width || !web?.height) return false;
        return passesDimensionGate(web.width, web.height);
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
          providerKey: 'cma',
          aspectRatio: w / h,
          imageUrl: d.images.web.url,
        };
      });
  } catch (e) {
    console.warn('[Art] CMA fetch failed:', e);
    return [];
  }
}

/**
 * 4. SMK — Statens Museum for Kunst (National Gallery of Denmark)
 */
async function fetchSMKArtworks() {
  try {
    const offset = pickUniqueRandomPage('smk', 0, 22000);
    const url = `https://api.smk.dk/api/v1/art/search/?keys=*&filters=[has_image:true],[public_domain:true]&offset=${offset}&rows=20`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 6500);
    if (!res.ok) throw new Error(`SMK status: ${res.status}`);
    const json = await res.json();

    return (json.items || [])
      .filter((d) => {
        if (!d.image_thumbnail || !d.image_width || !d.image_height) return false;
        return passesDimensionGate(d.image_width, d.image_height);
      })
      .map((d) => {
        const title =
          d.titles?.find((t) => t.language === 'en')?.title ||
          d.titles?.[0]?.title ||
          'Untitled';
        const artist =
          d.artist?.[0] ||
          d.production?.[0]?.creator ||
          'Unknown Artist';
        const rawDate = d.production_date?.[0]?.period || d.production_date?.[0]?.start || '';
        const yearMatch = String(rawDate).match(/\b(1[4-9]\d{2}|20\d{2})\b/);
        const imageUrl = String(d.image_thumbnail).replace(/\/full\/![0-9]+,\//, '/full/!1200,/');

        return {
          id: `smk-${d.object_number || d.id}`,
          title,
          artist,
          year: yearMatch ? yearMatch[0] : '',
          source: 'National Gallery of Denmark (SMK)',
          sourceIcon: '🏛️',
          providerKey: 'smk',
          aspectRatio: Number(d.image_width) / Number(d.image_height),
          imageUrl,
        };
      });
  } catch (e) {
    console.warn('[Art] SMK fetch failed:', e);
    return [];
  }
}

/**
 * 5. Smithsonian Open Access (via server-side /api/smithsonian proxy)
 */
async function fetchSmithsonianArtworks() {
  try {
    const units = ['HMSG', 'SAAM', 'NASM', 'CHNDM', 'FSG', 'NPG'];
    const unit = units[Math.floor(Math.random() * units.length)];
    const start = pickUniqueRandomPage('smithsonian', 0, 3200);
    const url = `/api/smithsonian?unit=${unit}&start=${start}&rows=18`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 7000);
    if (!res.ok) throw new Error(`Smithsonian proxy status: ${res.status}`);
    const json = await res.json();
    return Array.isArray(json.items) ? json.items : [];
  } catch (e) {
    console.warn('[Art] Smithsonian fetch failed:', e);
    return [];
  }
}

/**
 * 6. Library of Congress (Rotates across Highsmith Modern, 1940s Kodachrome, and 1890s Photochroms)
 */
async function fetchLOCPhotography() {
  const collections = [
    {
      slug: 'carol-m-highsmith',
      maxPage: 1500,
      defaultArtist: 'Carol M. Highsmith',
      sourceLabel: 'Library of Congress',
    },
    {
      slug: 'photochrom-prints',
      maxPage: 650,
      defaultArtist: 'Photochrom Print Archive',
      sourceLabel: 'Library of Congress Photochrom',
    },
    {
      slug: 'fsa-owi-color-photographs',
      maxPage: 150,
      defaultArtist: 'FSA / OWI Photographer',
      sourceLabel: 'Library of Congress 1940s Color',
    },
  ];

  try {
    const col = collections[Math.floor(Math.random() * collections.length)];
    const page = pickUniqueRandomPage('loc', 1, col.maxPage);
    const url = `https://www.loc.gov/collections/${col.slug}/?fo=json&c=15&sp=${page}`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 7000);
    if (!res.ok) throw new Error(`LOC status: ${res.status}`);
    const json = await res.json();

    return (json.results || [])
      .map((r) => {
        const variants = (r.image_url || [])
          .map((rawUrl) => {
            const match = rawUrl.match(/#h=(\d+)&w=(\d+)/);
            if (!match) return null;
            return {
              url: rawUrl.split('#')[0],
              h: Number(match[1]),
              w: Number(match[2]),
            };
          })
          .filter(Boolean);

        const best =
          variants.find((v) => v.w >= 950 && v.w <= 2200) ||
          variants[variants.length - 1];

        if (!best || !passesDimensionGate(best.w, best.h)) return null;

        const cleanTitle = String(r.title || 'Archival Photograph')
          .replace(/^\[|\]$/g, '')
          .replace(/[\s,./]+$/, '')
          .trim();
        const yearMatch = String(r.date || '').match(/\b(18|19|20)\d{2}\b/);

        let artist = col.defaultArtist;
        if (col.slug !== 'carol-m-highsmith' && Array.isArray(r.contributor) && r.contributor[0]) {
          const rawContrib = String(r.contributor[0]).trim();
          if (rawContrib.includes(',')) {
            const [last, first] = rawContrib.split(',').map((s) => s.trim());
            if (first && last) {
              artist = `${first} ${last}`.replace(/\b\w/g, (c) => c.toUpperCase());
            }
          }
        }

        return {
          id: `loc-${r.id ? r.id.split('/').filter(Boolean).pop() : Math.random()}`,
          title: cleanTitle,
          artist,
          year: yearMatch ? yearMatch[0] : '',
          source: col.sourceLabel,
          sourceIcon: '📷',
          providerKey: 'loc',
          aspectRatio: best.w / best.h,
          imageUrl: best.url,
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.warn('[Art] Library of Congress fetch failed:', e);
    return [];
  }
}

/**
 * 7. NASA Cosmic & Earth Library (Deep Query + Random Page Sampling)
 */
async function fetchNASAPhotography() {
  const topics = [
    'nebula',
    'galaxy',
    'hubble',
    'webb',
    'aurora',
    'saturn',
    'jupiter',
    'mars',
    'earth from space',
    'milky way',
    'supernova',
    'apollo',
    'cassini',
    'exoplanet',
    'solar flare',
    'carina',
    'orion',
    'andromeda',
    'lunar',
    'eclipse',
  ];

  try {
    const q = topics[Math.floor(Math.random() * topics.length)];
    const page = pickUniqueRandomPage('nasa', 1, 4);
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page=${page}`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 5500);
    if (!res.ok) throw new Error(`NASA status: ${res.status}`);
    const json = await res.json();
    const candidates = (json.collection?.items || []).filter(
      (it) => it.links?.[0]?.href && /\.(jpe?g|png)/i.test(it.links[0].href) && it.data?.[0]
    );

    return shuffleArray(candidates)
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
          providerKey: 'nasa',
          imageUrl: it.links[0].href,
        };
      });
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

  if (!title || /^[\d\s_-]+(o|n)?(-\d+)?$/i.test(title) || /^(IMG|DSC|DSCF|PXL|MVIMG)[_\s-]?\d+/i.test(title)) {
    return fallbackLabel;
  }
  return title;
}

/**
 * Generate random timestamp window for deep Wikimedia Commons category exploration
 */
function getRandomWikiStartIso() {
  const year = 2012 + Math.floor(Math.random() * 14); // 2012..2025
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00Z`;
}

/**
 * Shared Wikimedia Commons Category File Fetcher (Single Seat Capped)
 */
async function fetchWikimediaCategoryFiles(cat, sourceLabel, sourceIcon) {
  const buildUrl = (useTimestampWindow) => {
    const base =
      `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers` +
      `&gcmtitle=${encodeURIComponent(cat.name)}&gcmtype=file&gcmnamespace=6&gcmlimit=16` +
      `&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1600&format=json&origin=*`;
    if (!useTimestampWindow) return base;
    const dir = Math.random() < 0.5 ? 'ascending' : 'descending';
    return `${base}&gcmsort=timestamp&gcmdir=${dir}&gcmstart=${encodeURIComponent(getRandomWikiStartIso())}`;
  };

  const parseResponse = (json) => {
    const pages = Object.values(json.query?.pages || {});
    return pages
      .filter((p) => {
        const ii = p.imageinfo?.[0];
        if (!ii || !ii.thumburl || !ii.mime?.startsWith('image/') || ii.mime === 'image/svg+xml') {
          return false;
        }
        const w = ii.thumbwidth || ii.width || 0;
        const h = ii.thumbheight || ii.height || 0;
        return passesDimensionGate(w, h);
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
        const yearMatch = rawDate.match(/\b(18|19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : '';

        return {
          id: `wiki-${p.pageid}`,
          title,
          artist,
          year,
          source: sourceLabel,
          sourceIcon,
          providerKey: 'wikimedia',
          aspectRatio: w / h,
          imageUrl: ii.thumburl,
        };
      });
  };

  try {
    const res = await fetchWithTimeout(buildUrl(true), { cache: 'no-store' }, 5000);
    if (!res.ok) throw new Error(`Wikimedia status: ${res.status}`);
    let items = parseResponse(await res.json());

    if (items.length < 3) {
      const fallbackRes = await fetchWithTimeout(buildUrl(false), { cache: 'no-store' }, 4500);
      if (fallbackRes.ok) {
        const fallbackItems = parseResponse(await fallbackRes.json());
        if (fallbackItems.length > items.length) items = fallbackItems;
      }
    }
    return items;
  } catch (e) {
    console.warn(`[Art] Wikimedia fetch failed (${cat.name}):`, e);
    return [];
  }
}

/**
 * 8. Wikimedia Commons (Unified Single Seat: Featured Pictures + Street Art/Murals)
 */
async function fetchWikimediaUnified() {
  const streetCategories = [
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

  const featuredCat = {
    name: 'Category:Featured_pictures_on_Wikimedia_Commons',
    label: 'Featured Picture',
  };
  const streetCat = streetCategories[Math.floor(Math.random() * streetCategories.length)];

  const [featuredItems, streetItems] = await Promise.all([
    fetchWikimediaCategoryFiles(featuredCat, 'Wikimedia Featured Pictures', '📷'),
    fetchWikimediaCategoryFiles(streetCat, 'Wikimedia Street Art', '🎨'),
  ]);

  // Blend 50/50 within the single Wikimedia seat (capped to MAX_ITEMS_PER_PROVIDER downstream)
  return shuffleArray([
    ...shuffleArray(featuredItems).slice(0, 4),
    ...shuffleArray(streetItems).slice(0, 4),
  ]);
}

/**
 * Apply artwork assets to buffer layer (a or b)
 * Automatically switches between full-bleed cover (16:9-ish) and contain+halo (4:5 / 1:1 / 4:3)
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
 * Preload an image URL into browser memory with safety timeout & relaxed TV dimension gate
 */
function preloadImage(url, timeoutMs = 5500) {
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

      if (!passesDimensionGate(w, h)) {
        reject(new Error(`Unsuitable dimensions (${w}x${h}, ratio ${ratio.toFixed(2)})`));
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
 * Commit artwork to target layer, cross-fade buffers, update caption, and record seen ID
 */
function commitLayerTransition(targetLayerKey, artwork, ratio) {
  applyArtworkToLayer(targetLayerKey, artwork, ratio);
  recordSeenArtwork(artwork.id);

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
 * Dual-Buffer Cross-Fade Transition with Memory Pruning & Rolling Replenishment
 */
async function transitionToNextArtwork(skipCount = 0) {
  if (isTransitioning || artworkQueue.length === 0) return;

  hasBootAutoAdvanced = true;
  if (bootUpgradeTimer) {
    clearTimeout(bootUpgradeTimer);
    bootUpgradeTimer = null;
  }

  const targetLayerKey = activeLayer === 'a' ? 'b' : 'a';

  if (skipCount > 12) {
    console.warn('[Art] Too many consecutive skips, applying verified baseline fallback');
    isTransitioning = true;
    const fallback = pickRandomStarter();
    let fallbackRatio = fallback.aspectRatio || 1.33;
    try {
      const result = await preloadImage(fallback.imageUrl, 5000);
      fallbackRatio = result.ratio;
    } catch (_) {
      // Proceed with fallback asset directly so screen never remains blank
    }
    commitLayerTransition(targetLayerKey, fallback, fallbackRatio);
    replenishArtworkQueue();
    return;
  }

  isTransitioning = true;

  // Prune old played slides to keep memory flat during 24/7 playback
  if (currentQueueIndex > 20) {
    const pruneCount = currentQueueIndex - 10;
    artworkQueue.splice(0, pruneCount);
    currentQueueIndex -= pruneCount;
  }

  // If user advances quickly before batch flush completes, deal any waiting pool items immediately
  if (artworkQueue.length - 1 - currentQueueIndex < 2) {
    dealBalancedDeckFromPools(true);
  }

  // Trigger rolling background refill whenever < 10 unseen slides remain
  const remainingCount = artworkQueue.length - 1 - currentQueueIndex;
  if (remainingCount < REPLENISH_THRESHOLD) {
    replenishArtworkQueue();
  }

  // Advance queue index
  currentQueueIndex = (currentQueueIndex + 1) % artworkQueue.length;
  const nextArtwork = artworkQueue[currentQueueIndex];

  let loadedRatio = nextArtwork.aspectRatio || null;
  try {
    const result = await preloadImage(nextArtwork.imageUrl, 5500);
    loadedRatio = result.ratio;
  } catch (err) {
    console.warn('[Art] Skipping unsuitable artwork:', nextArtwork.title, err.message);
    isTransitioning = false;
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

let deckDealTimer = null;
let hasLiveItemsDealt = false;

/**
 * 8-Provider Equal-Seat Deck Builder (Strict No-Streak, No Tail Dump)
 */
function dealBalancedDeckFromPools(allowPartialDrain = false) {
  if (deckDealTimer) {
    clearTimeout(deckDealTimer);
    deckDealTimer = null;
  }

  // Pull any existing unplayed slides back into providerPools so late-arriving sources weave into the front
  if (artworkQueue.length > currentQueueIndex + 1) {
    const unplayedTail = artworkQueue.splice(currentQueueIndex + 1);
    unplayedTail.forEach((item) => {
      const key = PROVIDER_KEYS.includes(item.providerKey) ? item.providerKey : 'aic';
      providerPools[key].push(item);
    });
  }

  PROVIDER_KEYS.forEach((key) => {
    if (providerPools[key].length > 1) {
      providerPools[key] = shuffleArray(providerPools[key]);
    }
  });

  const dealt = [];
  const lookbackStart = Math.max(0, artworkQueue.length - ARTIST_COOLDOWN_WINDOW);
  const recentTail = artworkQueue.slice(lookbackStart);

  const recentProviders = recentTail
    .slice(-PROVIDER_COOLDOWN_WINDOW)
    .map((item) => item.providerKey)
    .filter(Boolean);

  const recentArtists = recentTail
    .map((item) => item.artist)
    .filter((a) => a && a !== 'Unknown Artist');

  const pickArtistSafeIndex = (pool) => {
    const idx = pool.findIndex(
      (item) => item.artist === 'Unknown Artist' || !recentArtists.includes(item.artist)
    );
    return idx !== -1 ? idx : 0;
  };

  const minDistinctProviders = allowPartialDrain ? 1 : 3;

  while (true) {
    const activeProviders = PROVIDER_KEYS.filter((k) => providerPools[k].length > 0);
    if (activeProviders.length === 0) break;
    // Stop before draining single-provider leftovers into a monotonous tail
    if (activeProviders.length < minDistinctProviders && dealt.length >= 12) break;

    const lastProvider = recentProviders[recentProviders.length - 1] || null;
    // Prefer providers not seen in the last 4 slides; fall back to any provider != lastProvider
    let eligible = activeProviders.filter((k) => !recentProviders.includes(k));
    if (eligible.length === 0) {
      eligible = activeProviders.filter((k) => k !== lastProvider);
    }
    if (eligible.length === 0) {
      if (!allowPartialDrain && dealt.length > 0) break;
      eligible = activeProviders;
    }

    const chosenKey = eligible[Math.floor(Math.random() * eligible.length)];
    const pool = providerPools[chosenKey];
    const idx = pickArtistSafeIndex(pool);
    const [chosen] = pool.splice(idx, 1);

    dealt.push(chosen);
    recentProviders.push(chosenKey);
    if (recentProviders.length > PROVIDER_COOLDOWN_WINDOW) {
      recentProviders.shift();
    }

    if (chosen.artist && chosen.artist !== 'Unknown Artist') {
      recentArtists.push(chosen.artist);
      if (recentArtists.length > ARTIST_COOLDOWN_WINDOW) {
        recentArtists.shift();
      }
    }
  }

  if (dealt.length > 0) {
    artworkQueue.push(...dealt);
    const counts = dealt.reduce((acc, item) => {
      acc[item.providerKey] = (acc[item.providerKey] || 0) + 1;
      return acc;
    }, {});
    console.log(`[Art Engine] Dealt ${dealt.length} balanced slides:`, counts);

    if (
      hasLiveItemsDealt &&
      !hasBootAutoAdvanced &&
      !bootUpgradeTimer &&
      currentQueueIndex === 0 &&
      artworkQueue.length > 1
    ) {
      bootUpgradeTimer = setTimeout(() => {
        bootUpgradeTimer = null;
        if (!hasBootAutoAdvanced && currentQueueIndex === 0 && artworkQueue.length > 1) {
          hasBootAutoAdvanced = true;
          transitionToNextArtwork();
          startRotationCycle();
        }
      }, BOOT_UPGRADE_DELAY_MS);
    }
  }
  return dealt.length;
}

/**
 * Ingest items into a single provider seat (strictly capped to MAX_ITEMS_PER_PROVIDER per refill)
 */
function ingestProviderBatch(providerKey, newItems, isLiveRemote = false) {
  if (!Array.isArray(newItems) || newItems.length === 0) return;
  const key = PROVIDER_KEYS.includes(providerKey) ? providerKey : 'aic';

  const uniqueFresh = shuffleArray(newItems)
    .filter((item) => item && item.id && item.imageUrl && !queuedIds.has(item.id) && !hasRecentlySeen(item.id))
    .slice(0, MAX_ITEMS_PER_PROVIDER);

  if (uniqueFresh.length === 0) return;

  uniqueFresh.forEach((item) => {
    queuedIds.add(item.id);
    providerPools[key].push({ ...item, providerKey: key });
  });

  if (isLiveRemote) hasLiveItemsDealt = true;

  // Batch concurrent arrivals for up to 2.5s (or once 5+ distinct providers have arrived)
  const populatedProviders = PROVIDER_KEYS.filter((k) => providerPools[k].length > 0).length;
  if (populatedProviders >= 5) {
    dealBalancedDeckFromPools(false);
  } else if (!deckDealTimer) {
    deckDealTimer = setTimeout(() => {
      dealBalancedDeckFromPools(false);
    }, 2500);
  }
}

/**
 * Pick a randomized fast starter artwork, preferring unseen items
 */
function pickRandomStarter() {
  const unseen = BASELINE_MASTERWORKS.filter((item) => !hasRecentlySeen(item.id));
  const pool = unseen.length > 0 ? unseen : BASELINE_MASTERWORKS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Fetch one deep randomized batch across all 8 distinct providers in parallel
 */
async function replenishArtworkQueue() {
  if (isReplenishing) return;
  isReplenishing = true;

  const providerJobs = [
    ['met', fetchMetArtworks()],
    ['aic', fetchAICArtworks()],
    ['cma', fetchCMAArtworks()],
    ['smk', fetchSMKArtworks()],
    ['smithsonian', fetchSmithsonianArtworks()],
    ['loc', fetchLOCPhotography()],
    ['nasa', fetchNASAPhotography()],
    ['wikimedia', fetchWikimediaUnified()],
  ];

  try {
    await Promise.allSettled(
      providerJobs.map(([providerKey, promise]) =>
        promise
          .then((items) => ingestProviderBatch(providerKey, items, true))
          .catch((err) => console.warn(`[Art] ${providerKey} source warning:`, err))
      )
    );
  } finally {
    // Allow partial deal only if very few slides exist in the queue
    const needsFallbackDrain = artworkQueue.length - 1 - currentQueueIndex < 6;
    dealBalancedDeckFromPools(needsFallbackDrain);
    isReplenishing = false;
  }
}

/**
 * Populate Artwork Queue (Randomized Boot Starter + Auto-Advance + 8-Source Equal-Seat Deck)
 */
function initializeArtworkEngine() {
  loadSeenHistory();

  // Synchronously render a randomized fast starter piece on layer A immediately
  const initialArtwork = pickRandomStarter();
  artworkQueue = [initialArtwork];
  queuedIds.add(initialArtwork.id);
  recordSeenArtwork(initialArtwork.id);

  applyArtworkToLayer('a', initialArtwork, initialArtwork?.aspectRatio || 1.33);
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

  // Trigger all 8 live deep-catalog sources immediately
  replenishArtworkQueue();
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


