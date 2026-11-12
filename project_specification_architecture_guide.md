# Project Specification: Ambient Art & Ambient HUD Screensaver PWA

## 1. Vision & Core Philosophy ("The Law of the Project")

The objective is to create a dedicated, low-overhead, self-updating Progressive Web App (PWA) tailored for Google TV / Sony Bravia landscape displays ($16:9$, typically $4\text{K}$ or $1080\text{p}$).

### Non-Negotiable Directives
1. **Zero Browser Data Hoarding:**
   - **Only the PWA shell** (`index.html`, minimal CSS/JS bundle, Web Manifest, launcher icons) may reside in Cache Storage.
   - **Zero Image / Data Caching:** Artworks, image blobs, and live weather payloads must strictly bypass `CacheStorage`, `localStorage`, and `IndexedDB`. All asset calls use `cache: 'no-store'` or network-only fetches to prevent TV memory degradation and storage bloat.
2. **Self-Awareness & Deterministic Auto-Update:**
   - On every boot, window focus, or resume event, the application proactively queries the host for new Service Worker registrations (`registration.update()`).
   - If an update is detected, the Service Worker invokes `skipWaiting()`, asserts control via `clients.claim()`, and transparently reloads the interface.
   - **Version String Convention:** `v1.MMDDYYYY.HHmm` in US Eastern Standard / Daylight Time (e.g., `v1.11112026.0626`). This stamp is compiled at deployment and displayed unobtrusively in the UI.
3. **Bandwidth & Memory Minimalism:**
   - TV processors and web runtimes have constrained VRAM. Never request uncompressed master files or raw $8\text{K}$ TIFF scans.
   - Request the **lowest acceptable resolution** that renders crisply on a large panel:
     - IIIF parameters: fixed width of `843px` to `1200px` (`/full/843,/0/default.jpg`).
     - Standard REST APIs: target web preview fields (e.g., The Met's `primaryImageSmall`, CMA's `web.url`).
4. **Legibility & Visual Balance:**
   - Art spans edge-to-edge ($100\text{vw} \times 100\text{vh}$).
   - The HUD is docked persistently to the **right side** of the display with a frosted glassmorphism backdrop (`backdrop-filter: blur(20px)`), guaranteeing that day, date, time, and weather remain legible across both pure-white and pitch-black artwork backgrounds.

---

## 2. Layout & UI Architecture

### 2.1 Base Layer: Dual-Buffer Artwork Stage
Classical and historical art rarely conforms to a native $16:9$ aspect ratio. To eliminate harsh black pillarboxes while avoiding destructive cropping:
- **Background Slot:** An expanded, heavily blurred, and dimmed replica of the artwork (`object-fit: cover; filter: blur(28px) brightness(0.45); transform: scale(1.1);`).
- **Foreground Slot:** The uncropped artwork rendered cleanly at its native aspect ratio (`object-fit: contain`).
- **Double-Buffered Cross-Fade:** Two static DOM containers (`#layer-a` and `#layer-b`) alternate `opacity: 0` and `opacity: 1` over a `1.5s ease-in-out` transition. No DOM elements are created or destroyed during rotation cycles.

### 2.2 Top Layer: Right-Justified Glassmorphism HUD
A vertical panel occupying the right quadrant:
- **Dimensions:** Width of `340px` to `380px`, height of `100vh`.
- **Styling:**
  - `background: rgba(15, 23, 42, 0.45);`
  - `backdrop-filter: blur(24px) saturate(180%);`
  - `border-left: 1px solid rgba(255, 255, 255, 0.14);`
  - `box-shadow: -10px 0 30px rgba(0, 0, 0, 0.35);`
- **HUD Hierarchy (Top to Bottom):**
  1. **Time:** Bold digital clock (12-hour or 24-hour with AM/PM indicator).
  2. **Calendar:** Day of the week and full date (e.g., `Wednesday, Nov 11, 2026`).
  3. **Weather:** Real-time temperature, condition badge/icon, and humidity via Open-Meteo.
  4. **Flexible Spacer / Ambient Divider**
  5. **Artwork Metadata:** Title, Artist, Creation Year, and Museum / Attribution source.
  6. **Build Signature:** Bottom right, muted timestamp `v1.MMDDYYYY.HHmm EST`.

---

## 3. Artwork Ingestion Pipeline

### 3.1 Primary Sources & Low-Bandwidth Endpoints

| Provider | Access Model | Target Endpoint / Size Parameter | Bandwidth per Slide |
| :--- | :--- | :--- | :--- |
| **Art Institute of Chicago (AIC)** | Keyless REST + IIIF | `https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg` | $\approx 140\text{–}220\text{ KB}$ |
| **Cleveland Museum of Art (CMA)** | Keyless REST | `https://openaccess-api.clevelandart.org/api/artworks/` $\rightarrow$ `images.web.url` | $\approx 180\text{–}300\text{ KB}$ |
| **The Metropolitan Museum of Art** | Keyless REST | `https://collectionapi.metmuseum.org/public/collection/v1/objects/{id}` $\rightarrow$ `primaryImageSmall` | $\approx 120\text{–}200\text{ KB}$ |
| **Local / Amateur Art Manifest** | Local / Custom CDN | Configured via `local_art_manifest.json` (pointing to local paths or public endpoints) | Scaled to $\le 1080\text{p}$ ($\approx 150\text{ KB}$) |

### 3.2 Rotation & Preload Lifecycle
```
[Boot] 
   │
   ▼
Fetch indices from APIs + local_art_manifest.json (Shuffle into in-memory queue)
   │
   ▼
Cycle Interval (e.g., 60 seconds)
   │
   ├─► At T-10s: Instantiate background Image() object with next URL
   │       │
   │       └─► Once loaded: Assign src to inactive staging layer
   │
   └─► At T-0s: Toggle opacities (Staging layer -> 1.0, Active layer -> 0.0)
           │
           └─► Update HUD metadata card (Title / Artist / Source)
```

---

## 4. Weather & Environmental Data

- **Service:** Open-Meteo REST API (Keyless, non-commercial open access).
- **Endpoint Structure:**
  ```text
  https://api.open-meteo.com/v1/forecast?latitude=42.3765&longitude=-71.2356&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York
  ```
- **Refresh Cadence:** Polled every 15 minutes.
- **WMO Weather Code Translation:** Mapped internally to readable descriptions (e.g., `0` = Clear Sky, `1-3` = Partly Cloudy, `61-65` = Rain, `71-75` = Snow).

---

## 5. Service Worker & Update Contract

### 5.1 Caching Rules
```javascript
// Whitelist: strictly shell files
const SHELL_CACHE = 'ambient-art-shell-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-512.png'
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If request is external (APIs, IIIF, images), BYPASS cache entirely
  if (url.origin !== self.location.origin || event.request.destination === 'image') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // Shell assets: Stale-While-Revalidate or Network-First
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
```

### 5.2 Dynamic Versioning Specification
- **Format:** `v1.MMDDYYYY.HHmm`
- **Timezone:** US Eastern Time (`America/New_York`).
- **Generation:** Embedded directly into the project configuration during deployment or dynamically tracked via build scripts.

---

## 6. Project Roadmap & Next Steps

1. [ ] **Step 1: Manifest & Local Repository Scaffolding**
   - Create `local_art_manifest.json` schema to allow drop-in hosting of regional, amateur, or personal artwork.
2. [ ] **Step 2: Single-Page Standalone Engine**
   - Assemble HTML/CSS/JS with the dual-buffer canvas, right-hand frosted HUD, Open-Meteo polling, and IIIF data connectors.
3. [ ] **Step 3: Service Worker & Lifecycle Setup**
   - Configure cache restrictions, auto-updater triggers, and the build version stamp.
4. [ ] **Step 4: TV Browser Compatibility & Remote Testing**
   - Verify fullscreen kiosk behavior on Sony Bravia via TV browser (e.g., BrowseHere, TVBro).