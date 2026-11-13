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
  if (timeSecondsEl) timeSecondsEl.textContent = `:${seconds}`;

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
 * Format: v1.MMDDYYYY.HHmm EST
 */
export const APP_BUILD_VERSION = 'v1.11122026.1955 EST';

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
    id: 'photo-autumn',
    title: 'Autumn Timberland Path',
    artist: 'Paul Jarvis',
    year: '2023',
    source: 'Curated Fine Photography',
    sourceIcon: '📷',
    imageUrl: 'https://picsum.photos/id/10/1600/900.jpg',
  },
  {
    id: 'aic-bedroom',
    title: 'The Bedroom',
    artist: 'Vincent van Gogh',
    year: '1889',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    imageUrl: 'https://www.artic.edu/iiif/2/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/843,/0/default.jpg',
  },
  {
    id: 'aic-monet-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    imageUrl: 'https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/843,/0/default.jpg',
  },
  {
    id: 'aic-wheat',
    title: 'Stacks of Wheat (End of Summer)',
    artist: 'Claude Monet',
    year: '1891',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    imageUrl: 'https://www.artic.edu/iiif/2/a38e2828-ec6f-ece1-a30f-70243449197b/full/843,/0/default.jpg',
  },
  {
    id: 'aic-train',
    title: 'Arrival of the Normandy Train, Gare Saint-Lazare',
    artist: 'Claude Monet',
    year: '1877',
    source: 'Art Institute of Chicago',
    sourceIcon: '🏛️',
    imageUrl: 'https://www.artic.edu/iiif/2/0f1cc0e0-e42e-be16-3f71-2022da38cb93/full/843,/0/default.jpg',
  },
  {
    id: 'photo-waterfall',
    title: 'Coastal Mist & Waterfall',
    artist: 'Alejandro Escamilla',
    year: '2023',
    source: 'Curated Fine Photography',
    sourceIcon: '📷',
    imageUrl: 'https://picsum.photos/id/15/1600/900.jpg',
  },
  {
    id: 'nasa-carina',
    title: 'Cosmic Cliffs in the Carina Nebula',
    artist: 'NASA / ESA / CSA / STScI',
    year: '2022',
    source: 'NASA Cosmic Library',
    sourceIcon: '🔭',
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
 * Ingestion: Local Curated Manifest
 */
async function loadLocalManifest() {
  try {
    const res = await fetch('/local_art_manifest.json', { cache: 'no-store' });
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
    const res = await fetch(url, { cache: 'no-store' });
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
    const res = await fetch(url, { cache: 'no-store' });
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
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Picsum status: ${res.status}`);
    const list = await res.json();
    return list
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
    const res = await fetch(url, { cache: 'no-store' });
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
}

/**
 * Preload an image URL into browser memory with safety timeout & universal TV aspect-ratio gate
 */
function preloadImage(url, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
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
 * Dual-Buffer Cross-Fade Transition
 */
async function transitionToNextArtwork(skipCount = 0) {
  if (isTransitioning || artworkQueue.length === 0) return;
  if (skipCount > 12) {
    console.warn('[Art] Too many consecutive skips, resuming normal rotation');
    return;
  }

  isTransitioning = true;

  // Advance queue index
  currentQueueIndex = (currentQueueIndex + 1) % artworkQueue.length;
  const nextArtwork = artworkQueue[currentQueueIndex];

  // Target the INACTIVE layer
  const targetLayerKey = activeLayer === 'a' ? 'b' : 'a';

  let loadedRatio = nextArtwork.aspectRatio || null;
  try {
    // Preload image and validate landscape aspect ratio before buffer swap
    const result = await preloadImage(nextArtwork.imageUrl);
    loadedRatio = result.ratio;
  } catch (err) {
    console.warn('[Art] Skipping unsuitable artwork:', nextArtwork.title, err.message);
    isTransitioning = false;
    // Advance to next
    transitionToNextArtwork(skipCount + 1);
    return;
  }

  // Assign artwork to inactive layer with smart cover/contain fit
  applyArtworkToLayer(targetLayerKey, nextArtwork, loadedRatio);

  // Cross-fade buffers over 1.5s CSS transition
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

  // Update bottom-left caption synced with cross-fade
  if (artCaptionEl) {
    artCaptionEl.style.opacity = '0';
    setTimeout(() => {
      updateArtworkHUD(nextArtwork);
      artCaptionEl.style.opacity = '1';
    }, 350);
  } else {
    updateArtworkHUD(nextArtwork);
  }

  // Allow next transition after cross-fade completes
  setTimeout(() => {
    isTransitioning = false;
  }, 1600);
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
 * Populate In-Memory Artwork Queue
 */
async function initializeArtworkEngine() {
  // Synchronously render the initial baseline piece on layer A immediately
  applyArtworkToLayer('a', artworkQueue[0], 16 / 9);
  updateArtworkHUD(artworkQueue[0]);

  // Concurrently fetch all online collections in the background
  try {
    const [manifestItems, aicItems, cmaItems, picsumItems, nasaItems] = await Promise.all([
      loadLocalManifest(),
      fetchAICArtworks(),
      fetchCMAArtworks(),
      fetchPicsumPhotography(),
      fetchNASAPhotography(),
    ]);

    const combined = [
      ...BASELINE_MASTERWORKS,
      ...manifestItems,
      ...aicItems,
      ...cmaItems,
      ...picsumItems,
      ...nasaItems,
    ];

    if (combined.length > 0) {
      // Remove duplicates by ID and shuffle
      const uniqueMap = new Map();
      combined.forEach((item) => {
        if (item.imageUrl && !uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      const uniqueList = Array.from(uniqueMap.values());
      const shuffled = shuffleArray(uniqueList);

      // Keep current playing item at position 0, shuffle the rest
      artworkQueue = [artworkQueue[0], ...shuffled.filter((item) => item.id !== artworkQueue[0]?.id)];
      console.log(`[Art Engine] Ingestion complete. Total queue: ${artworkQueue.length} pieces.`);
    }
  } catch (err) {
    console.warn('[Art] Remote collection assembly warning:', err);
  }

  // Start auto-rotation
  startRotationCycle();
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
const wakeStatusTextEl = document.getElementById('wake-status-text');

async function requestScreenWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      if (wakeStatusTextEl) wakeStatusTextEl.textContent = 'AWAKE';
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

/**
 * Phone-Home Update Checker
 * @param {boolean} isManual - true when explicitly tapped/clicked by user
 */
async function checkPhoneHomeUpdate(isManual = false) {
  if (isCheckingUpdate) return;
  isCheckingUpdate = true;

  if (isManual && buildStampEl) {
    buildStampEl.classList.remove('up-to-date', 'updating');
    buildStampEl.classList.add('checking');
    buildStampEl.textContent = 'CHECKING...';
    buildStampEl.setAttribute('aria-busy', 'true');
  }

  try {
    // 1. If an updated worker is waiting and we already have a controller, trigger it
    if (swRegistration && swRegistration.waiting && navigator.serviceWorker.controller) {
      console.log('[PWA] Waiting service worker found, sending SKIP_WAITING...');
      if (isManual && buildStampEl) {
        buildStampEl.classList.remove('checking');
        buildStampEl.classList.add('updating');
        buildStampEl.textContent = 'UPDATING...';
      }
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return;
    }

    // 2. Query ServiceWorkerRegistration to check for newer sw.js
    if (swRegistration) {
      await swRegistration.update();

      const targetWorker = swRegistration.installing || swRegistration.waiting;
      // Only show update state if we already have an active controller (not initial boot)
      if (targetWorker && navigator.serviceWorker.controller) {
        console.log('[PWA] New version currently installing...');
        if (isManual && buildStampEl) {
          buildStampEl.classList.remove('checking');
          buildStampEl.classList.add('updating');
          buildStampEl.textContent = 'DOWNLOADING...';
        }
        targetWorker.addEventListener('statechange', () => {
          if (targetWorker.state === 'installed') {
            targetWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
        return;
      }
    }

    // 3. Cache-busted phone-home server ping to verify online connection
    await fetch(`/?phone_home=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
    });

    // 4. If manual check completed and no update was found, display confirmation
    if (isManual && buildStampEl) {
      buildStampEl.classList.remove('checking', 'updating');
      buildStampEl.classList.add('up-to-date');
      buildStampEl.textContent = 'LATEST VERSION ✓';
      buildStampEl.removeAttribute('aria-busy');

      setTimeout(() => {
        buildStampEl.classList.remove('up-to-date');
        buildStampEl.textContent = APP_BUILD_VERSION;
      }, 2200);
    }
  } catch (err) {
    console.warn('[PWA] Phone-home check encountered an error:', err);
    if (isManual && buildStampEl) {
      buildStampEl.classList.remove('checking', 'updating');
      buildStampEl.textContent = 'OFFLINE';
      buildStampEl.removeAttribute('aria-busy');

      setTimeout(() => {
        buildStampEl.textContent = APP_BUILD_VERSION;
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

  // Immediate check if a worker is already waiting and we have an active controller
  if (reg.waiting && navigator.serviceWorker.controller) {
    console.log('[PWA] Service worker was already waiting in background');
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    if (!newWorker) return;

    // Do NOT show "UPDATING..." on initial app install
    if (!navigator.serviceWorker.controller) {
      console.log('[PWA] Initial service worker installing; keeping version stamp clean.');
      return;
    }

    console.log('[PWA] Real update discovered on server!');
    if (buildStampEl) {
      buildStampEl.classList.remove('checking');
      buildStampEl.classList.add('updating');
      buildStampEl.textContent = 'UPDATING...';
    }

    // Safety fallback: if update does not finish within 7 seconds, revert UI
    const safetyTimer = setTimeout(() => {
      if (buildStampEl && buildStampEl.classList.contains('updating')) {
        buildStampEl.classList.remove('updating', 'checking');
        buildStampEl.textContent = APP_BUILD_VERSION;
      }
    }, 7000);

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        clearTimeout(safetyTimer);
        console.log('[PWA] New version downloaded. Activating now...');
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      } else if (newWorker.state === 'redundant') {
        clearTimeout(safetyTimer);
        if (buildStampEl) {
          buildStampEl.classList.remove('updating', 'checking');
          buildStampEl.textContent = APP_BUILD_VERSION;
        }
      }
    });
  });
}

async function registerPWA() {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] Service Worker registered with scope:', swRegistration.scope);

      // Listen for background updates
      listenForSWUpdates(swRegistration);

      // Deterministic auto-check on boot
      checkPhoneHomeUpdate(false);

      // Check for updates whenever window regains focus
      window.addEventListener('focus', () => {
        checkPhoneHomeUpdate(false);
      });

      // Periodic background auto-check every 30 minutes
      setInterval(() => {
        checkPhoneHomeUpdate(false);
      }, 30 * 60 * 1000);

      // Handle transparent reload when a new service worker claims control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] New version activated, transparently reloading interface...');
          if (buildStampEl) {
            buildStampEl.textContent = 'RELOADING...';
          }
          setTimeout(() => {
            window.location.reload();
          }, 350);
        }
      });
    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  }
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


