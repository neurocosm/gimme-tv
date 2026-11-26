/**
 * Gimme TV — Three.js Multi-Layer Generative Dreamscape Engine
 * Combines 11 full-screen morphing GLSL shader worlds (Julia Fractals, Sacred Kaleidoscopes,
 * Luminous Stained Glass, Cosmic Nebulae/Supernovas, Underwater Caustics, Silk Aurora Curtains,
 * Liquid Oil/Iridescent Mercury, Prism Crystal Geode, Luminous Mycelial Web, Fractal Fern Canopy,
 * and Drifting Cloudscape) with 9 translucent 3D foreground modes (Sacred Geometry Tunnels,
 * Ringed Exoplanet fly-by, Underwater Bioluminescence Reef, Supernova Accretion Vortex,
 * Celestial Crystal Orrery, Open Vista, Psychedelic Bioluminescent Mushroom Grove,
 * Swaying Weeping Willow & Fern Veil, and Crystalline Icicle Sanctuary) plus 6 modular
 * Atmospheric FX Layers (Time-Warp Starfield, Underwater Bubbles & Ribbons, Forest Spores/Fireflies
 * & Drifting Leaves/Petals, Drifting Snowfall, Luminous Rain, and Rising Fire Wisps & Embers),
 * 12 contrasting Cosine Color Palettes, anti-repeat director, and silent dynamic resolution scaling.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Rotating poetic mode names
const MODE_NAMES = ['AETHER', 'LUCID', 'PRISM', 'REVERIE', 'DRIFT'];

// 12 Contrasting Curated Cosine Color Palettes across 6 distinct hue families
// color(t) = a + b * cos(2π(c * t + d))
const PALETTES = [
  {
    name: 'James Webb',
    mood: 'Astral',
    family: 'astral',
    a: new THREE.Vector3(0.18, 0.16, 0.28),
    b: new THREE.Vector3(0.45, 0.36, 0.44),
    c: new THREE.Vector3(1.0, 0.9, 0.85),
    d: new THREE.Vector3(0.08, 0.26, 0.56),
    key: new THREE.Color('#ffd39e'),
    rim: new THREE.Color('#63b3ff'),
    accent: new THREE.Color('#e27d60'),
    fog: new THREE.Color('#070914'),
  },
  {
    name: 'Molten Corona',
    mood: 'Solar',
    family: 'warm',
    a: new THREE.Vector3(0.30, 0.12, 0.08),
    b: new THREE.Vector3(0.50, 0.34, 0.22),
    c: new THREE.Vector3(1.0, 0.9, 0.75),
    d: new THREE.Vector3(0.02, 0.16, 0.36),
    key: new THREE.Color('#ffbe76'),
    rim: new THREE.Color('#ff5e57'),
    accent: new THREE.Color('#f9ca24'),
    fog: new THREE.Color('#140608'),
  },
  {
    name: 'Bioluminescent Abyss',
    mood: 'Abyssal',
    family: 'abyssal',
    a: new THREE.Vector3(0.05, 0.22, 0.32),
    b: new THREE.Vector3(0.22, 0.44, 0.48),
    c: new THREE.Vector3(0.9, 1.0, 0.95),
    d: new THREE.Vector3(0.48, 0.14, 0.24),
    key: new THREE.Color('#4fffe0'),
    rim: new THREE.Color('#38bdf8'),
    accent: new THREE.Color('#14b8a6'),
    fog: new THREE.Color('#030d18'),
  },
  {
    name: 'Emerald Canopy',
    mood: 'Verdant',
    family: 'botanical',
    a: new THREE.Vector3(0.08, 0.26, 0.16),
    b: new THREE.Vector3(0.28, 0.46, 0.30),
    c: new THREE.Vector3(0.85, 1.0, 0.8),
    d: new THREE.Vector3(0.28, 0.06, 0.42),
    key: new THREE.Color('#86efac'),
    rim: new THREE.Color('#fde047'),
    accent: new THREE.Color('#10b981'),
    fog: new THREE.Color('#04120c'),
  },
  {
    name: 'Cathedral Amethyst',
    mood: 'Velvet',
    family: 'royal',
    a: new THREE.Vector3(0.26, 0.11, 0.28),
    b: new THREE.Vector3(0.44, 0.30, 0.42),
    c: new THREE.Vector3(1.0, 0.85, 1.0),
    d: new THREE.Vector3(0.86, 0.18, 0.42),
    key: new THREE.Color('#f7b2d9'),
    rim: new THREE.Color('#c084fc'),
    accent: new THREE.Color('#f59e0b'),
    fog: new THREE.Color('#100618'),
  },
  {
    name: 'Copper & Verdigris',
    mood: 'Patina',
    family: 'mineral',
    a: new THREE.Vector3(0.22, 0.20, 0.18),
    b: new THREE.Vector3(0.42, 0.36, 0.32),
    c: new THREE.Vector3(0.95, 0.85, 0.9),
    d: new THREE.Vector3(0.05, 0.38, 0.52),
    key: new THREE.Color('#f59e6c'),
    rim: new THREE.Color('#2dd4bf'),
    accent: new THREE.Color('#d97706'),
    fog: new THREE.Color('#0b1012'),
  },
  {
    name: 'Sakura Pearl',
    mood: 'Blossom',
    family: 'royal',
    a: new THREE.Vector3(0.32, 0.18, 0.24),
    b: new THREE.Vector3(0.42, 0.34, 0.36),
    c: new THREE.Vector3(0.9, 0.85, 0.95),
    d: new THREE.Vector3(0.94, 0.22, 0.34),
    key: new THREE.Color('#fbcfe8'),
    rim: new THREE.Color('#fde68a'),
    accent: new THREE.Color('#f472b6'),
    fog: new THREE.Color('#160a12'),
  },
  {
    name: 'Boreal Aurora',
    mood: 'Boreal',
    family: 'botanical',
    a: new THREE.Vector3(0.08, 0.25, 0.26),
    b: new THREE.Vector3(0.28, 0.48, 0.44),
    c: new THREE.Vector3(0.95, 1.0, 1.1),
    d: new THREE.Vector3(0.32, 0.08, 0.52),
    key: new THREE.Color('#6ee7b7'),
    rim: new THREE.Color('#818cf8'),
    accent: new THREE.Color('#34d399'),
    fog: new THREE.Color('#041118'),
  },
  {
    name: 'Desert Terracotta',
    mood: 'Ochre',
    family: 'warm',
    a: new THREE.Vector3(0.32, 0.16, 0.12),
    b: new THREE.Vector3(0.44, 0.32, 0.26),
    c: new THREE.Vector3(0.9, 0.85, 0.8),
    d: new THREE.Vector3(0.04, 0.22, 0.44),
    key: new THREE.Color('#fdba74'),
    rim: new THREE.Color('#fb7185'),
    accent: new THREE.Color('#ea580c'),
    fog: new THREE.Color('#160a08'),
  },
  {
    name: 'Gilded Obsidian',
    mood: 'Gilded',
    family: 'mineral',
    a: new THREE.Vector3(0.24, 0.19, 0.11),
    b: new THREE.Vector3(0.46, 0.38, 0.22),
    c: new THREE.Vector3(1.0, 0.92, 0.78),
    d: new THREE.Vector3(0.06, 0.14, 0.32),
    key: new THREE.Color('#fde68a'),
    rim: new THREE.Color('#f59e0b'),
    accent: new THREE.Color('#fef3c7'),
    fog: new THREE.Color('#0c0905'),
  },
  {
    name: 'Pelagic Indigo',
    mood: 'Pelagic',
    family: 'abyssal',
    a: new THREE.Vector3(0.08, 0.16, 0.32),
    b: new THREE.Vector3(0.26, 0.38, 0.48),
    c: new THREE.Vector3(1.0, 0.95, 0.9),
    d: new THREE.Vector3(0.55, 0.24, 0.10),
    key: new THREE.Color('#7dd3fc'),
    rim: new THREE.Color('#a78bfa'),
    accent: new THREE.Color('#0ea5e9'),
    fog: new THREE.Color('#040918'),
  },
  {
    name: 'Opaline Glass',
    mood: 'Opaline',
    family: 'astral',
    a: new THREE.Vector3(0.22, 0.22, 0.30),
    b: new THREE.Vector3(0.38, 0.36, 0.42),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.33, 0.67),
    key: new THREE.Color('#f5d0fe'),
    rim: new THREE.Color('#67e8f9'),
    accent: new THREE.Color('#c4b5fd'),
    fog: new THREE.Color('#090b16'),
  },
];

// Layer 1 Full-Screen Procedural Shader Worlds (0..10)
const SHADER_WORLDS = [
  { id: 0, key: 'julia', noun: 'Filament', aquatic: false },
  { id: 1, key: 'kaleidoscope', noun: 'Mandala', aquatic: false },
  { id: 2, key: 'stainedGlass', noun: 'Cathedral', aquatic: false },
  { id: 3, key: 'nebula', noun: 'Supernova', aquatic: false },
  { id: 4, key: 'caustics', noun: 'Caustics', aquatic: true },
  { id: 5, key: 'aurora', noun: 'Aurora', aquatic: false },
  { id: 6, key: 'liquidOil', noun: 'Mirage', aquatic: false },
  { id: 7, key: 'prismGeode', noun: 'Prism', aquatic: false },
  { id: 8, key: 'mycelium', noun: 'Mycelium', aquatic: false },
  { id: 9, key: 'canopy', noun: 'Canopy', aquatic: false },
  { id: 10, key: 'cloudscape', noun: 'Cirrus', aquatic: false },
];

// Layer 2 Translucent 3D Worlds (0..8)
const THREE_WORLDS = [
  { id: 0, key: 'tunnel', noun: 'Sanctuary', aquatic: false },
  { id: 1, key: 'planet', noun: 'Horizon', aquatic: false },
  { id: 2, key: 'biolum', noun: 'Reef', aquatic: true },
  { id: 3, key: 'supernova', noun: 'Singularity', aquatic: false },
  { id: 4, key: 'orrery', noun: 'Orrery', aquatic: false },
  { id: 5, key: 'openVista', noun: 'Expanse', aquatic: false },
  { id: 6, key: 'mushrooms', noun: 'Mycelia', aquatic: false },
  { id: 7, key: 'willow', noun: 'Willow', aquatic: false },
  { id: 8, key: 'icicles', noun: 'Glacier', aquatic: false },
];

// Layer 3 Modular Atmospheric FX Keys (0..5)
const ATMOS_TYPES = ['stars', 'underwater', 'forest', 'snow', 'rain', 'embers'];

// Harmonious 3D pairings per shader world
const SHADER_AFFINITY = {
  0: [0, 3, 4, 6, 5],       // Julia Fractal -> Tunnel, Vortex, Orrery, Mushrooms, Open Vista
  1: [0, 4, 6, 3, 5],       // Kaleidoscope -> Tunnel, Orrery, Mushrooms, Vortex, Open Vista
  2: [0, 7, 8, 4, 5],       // Stained Glass -> Tunnel, Willow, Icicles, Orrery, Open Vista
  3: [1, 3, 4, 5],          // Cosmic Nebula -> Exoplanet, Vortex, Orrery, Open Vista
  4: [2, 5, 0],             // Underwater Caustics -> Bioluminescence Reef, Open Vista, Tunnel
  5: [8, 5, 4, 1, 7],       // Silk Aurora -> Icicles, Open Vista, Orrery, Exoplanet, Willow
  6: [6, 5, 0, 4, 2],       // Liquid Oil -> Mushrooms, Open Vista, Tunnel, Orrery, Reef
  7: [8, 4, 0, 5],          // Prism Crystal Geode -> Icicles, Orrery, Tunnel, Open Vista
  8: [6, 7, 0, 5],          // Luminous Mycelial Web -> Mushrooms, Willow, Tunnel, Open Vista
  9: [7, 6, 5, 0],          // Fractal Fern Canopy -> Willow, Mushrooms, Open Vista, Tunnel
  10: [5, 8, 7, 1, 4],      // Drifting Cloudscape -> Open Vista, Icicles, Willow, Exoplanet, Orrery
};

// Meditative lava-lamp timings (offset so worlds & color moods continually recombine)
const MORPH_CYCLE_SEC = 142.0;    // ~2.4 minutes per full scene evolution
const PALETTE_CYCLE_SEC = 155.0;  // ~2.6 minutes per color palette evolution

// Silent automatic dynamic resolution tiers (smoothly scales GPU load on Smart TVs / tablets)
const RENDER_TIERS = [0.44, 0.54, 0.66, 0.80, 1.0, 1.25, 1.5];

function detectSoftwareWebGL() {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch (_err) {
    return false;
  }
}

function createSoftGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.24, 'rgba(255, 255, 255, 0.72)');
  grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.18)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Sculpted organic curved leaf / blossom petal geometry for drifting Forest FX
function createCurvedLeafGeometry() {
  const geo = new THREE.PlaneGeometry(0.46, 0.92, 4, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const yn = (y + 0.46) / 0.92; // 0..1 base to tip
    // Taper smoothly into a graceful pointed willow leaf / petal silhouette
    const widthProfile = Math.sin(yn * Math.PI) * (0.4 + 0.65 * Math.sin(yn * Math.PI * 0.85));
    const nx = x * widthProfile;
    // Gentle organic cup & arc curl
    const nz = Math.sin(yn * Math.PI) * 0.11 - Math.abs(nx) * 0.16;
    pos.setXYZ(i, nx, y, nz);
  }
  geo.computeVertexNormals();
  return geo;
}

// ============================================================
// LAYER 1: FULL-SCREEN MORPHING GLSL BACKDROP SHADER (11 WORLDS)
// ============================================================
const BACKDROP_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const BACKDROP_FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uSceneA;
  uniform float uSceneB;
  uniform float uMorph;
  uniform float uTwist;
  uniform float uKaleido;
  uniform float uQuality;
  uniform float uUnderwater;
  uniform vec3 uPalA;
  uniform vec3 uPalB;
  uniform vec3 uPalC;
  uniform vec3 uPalD;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  vec3 palette(float t) {
    return clamp(uPalA + uPalB * cos(TAU * (uPalC * t + uPalD)), 0.0, 1.35);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
    vec3 a = fract(p.xyx * vec3(123.34, 234.34, 345.65));
    a += dot(a, a + 34.45);
    return fract(vec2(a.x * a.y, a.y * a.z));
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
    int oct = uQuality > 0.65 ? 5 : (uQuality > 0.30 ? 4 : 3);
    for (int i = 0; i < 5; i++) {
      if (i >= oct) break;
      v += a * vnoise(p);
      p = m * p * 2.02 + vec2(0.13, -0.17);
      a *= 0.5;
    }
    return v;
  }

  // World 0: Silk Julia Fractal
  vec3 renderJulia(vec2 p, float t) {
    vec2 z = p * (1.22 + 0.18 * sin(t * 0.09));
    z *= rot(t * 0.035);
    vec2 c = vec2(-0.745, 0.186) + 0.048 * vec2(cos(t * 0.068), sin(t * 0.059));
    float trapMin = 10.0;
    float trapLine = 10.0;
    float iterSmooth = 0.0;
    int maxIter = uQuality > 0.65 ? 40 : (uQuality > 0.30 ? 30 : 22);

    for (int i = 0; i < 40; i++) {
      if (i >= maxIter) break;
      z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      float r2 = dot(z, z);
      trapMin = min(trapMin, r2);
      trapLine = min(trapLine, abs(z.x * z.y));
      if (r2 > 16.0) {
        iterSmooth = float(i) - log2(log2(r2)) + 4.0;
        break;
      }
      iterSmooth = float(i);
    }

    float n = iterSmooth / float(maxIter);
    float glow = exp(-2.8 * sqrt(trapMin));
    float silk = exp(-6.5 * trapLine);
    vec3 col = palette(n * 1.45 + t * 0.025 + glow * 0.45);
    col *= (0.28 + 0.95 * pow(n, 0.72));
    col += palette(glow + 0.28 + t * 0.03) * (glow * 0.58 + silk * 0.45);
    return col * 0.85;
  }

  // World 1: Sacred Kaleidoscope Mandala
  vec3 renderKaleidoscope(vec2 p, float t) {
    vec2 q = p * rot(t * 0.028);
    float r = length(q);
    float a = atan(q.y, q.x);
    float petals = 6.0 + 2.0 * floor(0.5 + 0.5 * sin(t * 0.04) * 2.0 + 1.0);
    float seg = TAU / max(petals, 6.0);
    a = mod(a + PI, seg);
    a = abs(a - seg * 0.5);
    vec2 kp = vec2(cos(a), sin(a)) * r;

    vec2 w1 = vec2(fbm(kp * 2.2 + t * 0.04), fbm(kp * 2.2 - t * 0.035 + 4.2));
    float field = fbm(kp * 3.1 + w1 * 1.85 - vec2(t * 0.03, 0.0));
    float rings = 0.5 + 0.5 * sin(r * 11.0 - t * 0.24 + field * 6.0);
    float filigree = pow(1.0 - abs(sin(kp.y * 14.0 + field * 4.0)), 6.0);

    vec3 col = palette(field * 1.3 + r * 0.35 + t * 0.02);
    col *= (0.42 + 0.65 * rings);
    col += palette(field + 0.42) * filigree * 0.48;
    col *= smoothstep(1.9, 0.15, r * 0.85);
    return col * 0.9;
  }

  // World 2: Luminous Stained Glass Cathedral
  vec3 renderStainedGlass(vec2 p, float t) {
    vec2 q = p * rot(t * 0.018);
    float r = length(q);
    float a = atan(q.y, q.x);
    float fold = TAU / 8.0;
    vec2 rose = vec2(cos(abs(mod(a + PI, fold) - fold * 0.5)), sin(abs(mod(a + PI, fold) - fold * 0.5))) * r;
    vec2 uv = mix(q, rose, 0.42 + 0.25 * sin(t * 0.05)) * 2.75;
    uv += vec2(sin(t * 0.04) * 0.4, cos(t * 0.035) * 0.4);

    vec2 n = floor(uv);
    vec2 f = fract(uv);

    float md1 = 8.0;
    float md2 = 8.0;
    vec2 bestCell = vec2(0.0);

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash22(n + g);
        o = 0.5 + 0.42 * sin(t * 0.18 + TAU * o);
        vec2 diff = g + o - f;
        float d = length(diff);
        if (d < md1) {
          md2 = md1;
          md1 = d;
          bestCell = n + g;
        } else if (d < md2) {
          md2 = d;
        }
      }
    }

    float edge = md2 - md1;
    float leadLine = smoothstep(0.025, 0.095, edge);
    float bevelGlow = exp(-edge * 14.0) * 0.55;
    float cellId = hash21(bestCell);
    float glassLight = 0.55 + 0.45 * sin(md1 * 5.0 - t * 0.2 + cellId * TAU);

    vec3 glassCol = palette(cellId * 1.15 + r * 0.25 + t * 0.022);
    float shimmer = fbm(uv * 1.8 + vec2(t * 0.06, -t * 0.04));
    glassCol *= (0.55 + 0.72 * glassLight * (0.7 + 0.5 * shimmer));
    glassCol += palette(cellId + 0.5) * bevelGlow;
    vec3 col = mix(vec3(0.02, 0.02, 0.04), glassCol, leadLine);
    col *= (0.7 + 0.55 * exp(-r * 0.95));
    return col * 0.88;
  }

  // World 3: Cosmic Nebula & Supernova Shockwave
  vec3 renderNebula(vec2 p, float t) {
    vec2 q = p * rot(t * 0.015);
    float r = length(q);

    vec2 warp1 = vec2(
      fbm(q * 1.45 + vec2(t * 0.024, -t * 0.018)),
      fbm(q * 1.45 + vec2(-t * 0.02, t * 0.026) + 5.2)
    );
    vec2 warp2 = vec2(
      fbm(q * 2.1 + warp1 * 1.7 + vec2(1.7, 9.2) + t * 0.015),
      fbm(q * 2.1 + warp1 * 1.7 + vec2(8.3, 2.8) - t * 0.014)
    );
    float cloud = fbm(q * 1.8 + warp2 * 1.65);

    float wavePhase = fract(t * 0.018);
    float waveR = wavePhase * 1.75;
    float shock = exp(-pow((r - waveR) * 8.5, 2.0)) * (1.0 - wavePhase) * (0.5 + 0.8 * cloud);
    float core = exp(-r * 2.6) * (0.65 + 0.5 * warp1.x);

    vec3 col = palette(cloud * 1.4 + warp2.x * 0.45 + t * 0.018);
    col *= smoothstep(0.18, 0.88, cloud) * 0.95;
    col += palette(warp1.y + 0.35) * shock * 0.9;
    col += palette(0.15 + t * 0.02) * core * 0.72;

    vec2 sg = floor(q * 28.0);
    vec2 sf = fract(q * 28.0) - 0.5;
    float rnd = hash21(sg);
    if (rnd > 0.965) {
      float twinkle = 0.55 + 0.45 * sin(t * 1.8 + rnd * 90.0);
      float star = smoothstep(0.14, 0.01, length(sf)) * twinkle;
      col += vec3(0.95, 0.97, 1.0) * star * 0.85;
    }

    return col;
  }

  // World 4: Underwater Bioluminescent Caustics & Ocean Wave Current
  vec3 renderCaustics(vec2 p, float t) {
    vec2 waveOffset = vec2(
      sin(p.y * 2.6 + t * 0.36) * 0.045 + cos(p.x * 1.8 - t * 0.24) * 0.025,
      cos(p.x * 2.2 + t * 0.30) * 0.035
    );
    vec2 q = (p + waveOffset) * 1.32;
    q.y -= t * 0.024;
    vec2 drift = vec2(sin(t * 0.05) * 0.34, cos(t * 0.04) * 0.22);

    vec2 c1 = q * 2.35 + drift;
    vec2 c2 = (q * rot(0.52)) * 2.85 - drift * 1.18;

    float w1 = fbm(c1 + vec2(fbm(c1 + t * 0.065), fbm(c1 - t * 0.052)));
    float w2 = fbm(c2 + vec2(fbm(c2 - t * 0.058), fbm(c2 + t * 0.048)));
    float caustic = pow(1.0 - abs(w1 - w2) * 1.9, 5.0);
    float deepWater = fbm(q * 1.15 + vec2(0.0, t * 0.032));

    float rayAngle = p.x * 4.4 + p.y * 1.35 + sin(t * 0.14) * 0.85;
    float rays = pow(0.5 + 0.5 * sin(rayAngle + fbm(p * 1.4 + t * 0.045) * 3.4), 4.0);
    rays *= smoothstep(-0.95, 0.98, p.y);
    float surfaceGlow = exp(-pow((1.05 - p.y) * 2.2, 2.0)) * (0.35 + 0.65 * caustic);

    vec3 abyss = palette(0.68 + deepWater * 0.35 + t * 0.012) * (0.26 + 0.40 * deepWater);
    vec3 web = palette(0.22 + caustic * 0.45 + t * 0.018) * caustic * 0.96;
    vec3 rayCol = palette(0.40 + t * 0.015) * (rays * 0.38 + surfaceGlow * 0.45);
    return abyss + web + rayCol;
  }

  // World 5: Silk Aurora Curtains
  vec3 renderAurora(vec2 p, float t) {
    vec3 col = palette(0.75 + p.y * 0.18 + t * 0.008) * (0.14 + 0.16 * smoothstep(-1.0, 0.9, p.y));

    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float xFlow = p.x * (1.25 + fi * 0.38) + sin(t * 0.055 + fi * 2.1) * 0.45;
      float ribbonCurve = sin(xFlow * 1.9 + t * (0.11 + fi * 0.025)) * 0.28
        + cos(xFlow * 0.85 - t * 0.07 + fi) * 0.18;
      float yRel = (p.y - ribbonCurve + 0.12 - fi * 0.16);

      float fold = fbm(vec2(xFlow * 2.6 + t * 0.04, yRel * 0.65 - t * 0.025));
      float curtain = exp(-abs(yRel - fold * 0.32) * (3.6 + fi * 0.7));
      float upwardTrail = smoothstep(-0.45, 0.25, yRel) * exp(-max(yRel, 0.0) * 1.45);
      float shimmer = 0.55 + 0.45 * sin(xFlow * 11.0 + fold * 7.0 - t * 0.35);

      vec3 ribbonCol = palette(0.18 + fi * 0.27 + fold * 0.55 + yRel * 0.35 + t * 0.02);
      col += ribbonCol * (curtain * 0.55 + upwardTrail * fold * 0.42) * shimmer * (0.72 - fi * 0.12);
    }

    float horizon = exp(-pow((p.y + 0.82) * 3.0, 2.0));
    col += palette(0.35 + t * 0.015) * horizon * 0.22;
    return col * 0.92;
  }

  // World 6: Liquid Oil & Iridescent Mercury
  vec3 renderLiquidOil(vec2 p, float t) {
    vec2 q = p * 1.18;
    vec2 v1 = vec2(
      fbm(q * 1.35 + vec2(t * 0.032, -t * 0.024)),
      fbm(q * 1.35 + vec2(-t * 0.028, t * 0.034) + 3.7)
    );
    vec2 v2 = vec2(
      fbm(q * 1.9 + v1 * 2.4 + vec2(t * 0.02, 5.1)),
      fbm(q * 1.9 + v1 * 2.4 + vec2(8.4, -t * 0.022))
    );
    float pool = fbm(q * 1.65 + v2 * 2.2);

    float contour = 0.5 + 0.5 * sin(pool * 13.5 + v1.x * 5.0 - t * 0.18);
    float ridge = pow(smoothstep(0.45, 0.96, contour), 3.0);
    float sheen = pow(max(0.0, 1.0 - abs(v2.x - v2.y) * 2.8), 4.0);

    vec3 base = palette(pool * 1.55 + v1.y * 0.55 + t * 0.024);
    vec3 irid = palette(pool * 2.2 + 0.42 + v2.x * 0.5);
    vec3 col = base * (0.44 + 0.62 * contour) + irid * (ridge * 0.42 + sheen * 0.58);
    return col * 0.86;
  }

  // World 7: Prism Crystal Geode
  vec3 renderPrismGeode(vec2 p, float t) {
    vec2 q = p * rot(t * 0.014) * 2.35;
    q += vec2(sin(t * 0.035) * 0.35, cos(t * 0.03) * 0.35);

    vec2 n = floor(q);
    vec2 f = fract(q);
    float md1 = 8.0;
    float md2 = 8.0;
    vec2 bestVec = vec2(0.0);
    vec2 bestCell = vec2(0.0);

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash22(n + g);
        o = 0.5 + 0.38 * sin(t * 0.11 + TAU * o);
        vec2 diff = g + o - f;
        float d = dot(diff, diff);
        if (d < md1) {
          md2 = md1;
          md1 = d;
          bestVec = diff;
          bestCell = n + g;
        } else if (d < md2) {
          md2 = d;
        }
      }
    }

    float d1 = sqrt(md1);
    float d2 = sqrt(md2);
    float facetEdge = d2 - d1;
    float cellId = hash21(bestCell);

    vec2 facetN = normalize(bestVec + vec2(0.0001));
    vec2 beamDir = vec2(cos(t * 0.16), sin(t * 0.13));
    float spec = pow(max(0.0, dot(facetN, beamDir)), 3.2);
    float edgeHighlight = exp(-facetEdge * 18.0);

    vec3 facetCol = palette(cellId * 1.4 + dot(facetN, vec2(0.5, 0.8)) * 0.25 + t * 0.02);
    vec3 prismSpark = palette(cellId + spec * 0.65 + 0.33);
    vec3 col = facetCol * (0.42 + 0.58 * (1.0 - d1 * 0.65))
      + prismSpark * (spec * 0.68 + edgeHighlight * 0.52);

    float depthVignette = smoothstep(2.1, 0.2, length(p));
    return col * (0.62 + 0.45 * depthVignette) * 0.86;
  }

  // World 8: Luminous Mycelial Web (pulsing organic bioluminescent fungal network)
  vec3 renderMycelium(vec2 p, float t) {
    vec2 q = p * 2.15 + vec2(sin(t * 0.028) * 0.4, cos(t * 0.022) * 0.35);
    vec2 warp = vec2(fbm(q * 0.85 + t * 0.024), fbm(q * 0.85 - t * 0.021 + 4.8));
    vec2 uv = q + warp * 1.35;

    vec2 n = floor(uv);
    vec2 f = fract(uv);
    float md1 = 8.0;
    float md2 = 8.0;
    vec2 bestCell = vec2(0.0);

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash22(n + g);
        o = 0.5 + 0.42 * sin(t * 0.12 + TAU * o);
        vec2 diff = g + o - f;
        float d = length(diff);
        if (d < md1) {
          md2 = md1;
          md1 = d;
          bestCell = n + g;
        } else if (d < md2) {
          md2 = d;
        }
      }
    }

    // Primary thick mycelium filaments + fine secondary root tendrils
    float ridge = md2 - md1;
    float strandMain = exp(-ridge * 14.5);
    float strandSoft = exp(-ridge * 4.5);
    float fineThreads = pow(1.0 - abs(fbm(uv * 2.4 + t * 0.03) * 2.0 - 1.0), 5.0);

    // Slow travelling bioluminescent nutrient pulses gliding along the fungal web
    float pulse = 0.45 + 0.55 * sin(length(p) * 3.8 - t * 0.55 + warp.x * 5.0);
    float sporeNode = exp(-md1 * 7.0) * (0.5 + 0.5 * sin(t * 0.7 + hash21(bestCell) * TAU));

    vec3 soil = palette(0.72 + warp.y * 0.32 + t * 0.01) * (0.16 + 0.24 * warp.x);
    vec3 webCol = palette(0.24 + warp.x * 0.5 + pulse * 0.28 + t * 0.018);
    vec3 col = soil
      + webCol * (strandMain * (0.75 + 0.65 * pulse) + strandSoft * 0.28)
      + palette(0.55 + warp.y * 0.4) * (fineThreads * 0.42 + sporeNode * 0.85);
    return col * 0.90;
  }

  // World 9: Unfurling Fractal Fern Canopy (golden-angle botanical spirals & sunlit foliage)
  vec3 renderCanopy(vec2 p, float t) {
    vec2 q = p * rot(sin(t * 0.035) * 0.14);
    float r = length(q);
    float a = atan(q.y, q.x);

    // Layered botanical logarithmic fern spiral + frond ribs
    float spiral1 = sin(log(max(r, 0.02)) * 7.5 - a * 5.0 - t * 0.22);
    float spiral2 = sin(log(max(r, 0.02)) * 12.0 + a * 8.0 + t * 0.16);
    float sway = fbm(q * 1.9 + vec2(t * 0.03, -t * 0.025));

    // Delicate feather-like fern leaflet venation
    float leafCoord = (a * 6.0 + log(max(r, 0.02)) * 4.0 + sway * 2.6);
    float frond = pow(0.5 + 0.5 * sin(leafCoord), 2.5);
    float pinnae = pow(0.5 + 0.5 * sin(r * 24.0 + spiral1 * 2.4 - t * 0.3), 3.0);
    float veins = frond * (0.45 + 0.55 * pinnae);

    // Dappled forest sunlight beams piercing through moving leaves
    float sunDapple = pow(fbm(q * 2.3 + vec2(sin(t * 0.04) * 0.6, cos(t * 0.035) * 0.5)), 2.2) * 1.6;
    float bokeh = exp(-abs(spiral1 + spiral2 * 0.5) * 3.2) * 0.45;

    vec3 foliage = palette(0.32 + sway * 0.52 + veins * 0.35 + t * 0.015) * (0.30 + 0.72 * veins);
    vec3 sunlit = palette(0.12 + sunDapple * 0.4 + t * 0.02) * (sunDapple * 0.55 + bokeh * 0.55);
    return (foliage + sunlit) * 0.88;
  }

  // World 10: Drifting Volumetric Cloudscape & Sunlit Mist
  vec3 renderCloudscape(vec2 p, float t) {
    // Slow wind-driven multi-depth cloud layers (high cirrus + billowing cumulus)
    vec2 windSlow = vec2(t * 0.026, sin(t * 0.018) * 0.06);
    vec2 windFast = vec2(t * 0.048, -cos(t * 0.015) * 0.05);

    vec2 q1 = p * vec2(0.85, 1.25) - windSlow;
    vec2 warp = vec2(fbm(q1 * 1.15 + 1.4), fbm(q1 * 1.15 + 6.7));
    float cumulus = fbm(q1 * 1.55 + warp * 1.35);

    vec2 q2 = p * vec2(1.35, 1.95) - windFast;
    float cirrus = fbm(q2 * 1.85 + vec2(warp.y * 0.9, -warp.x * 0.7));

    // Soft backlit silver-lining rim along cloud tops
    float lightSample = fbm((q1 + vec2(-0.08, 0.10)) * 1.55 + warp * 1.35);
    float silverLining = clamp((cumulus - lightSample) * 4.2, 0.0, 1.0);
    float cloudMask = smoothstep(0.30, 0.82, cumulus);
    float wispMask = smoothstep(0.42, 0.85, cirrus) * 0.55;

    // Sky twilight vertical gradient
    vec3 sky = palette(0.68 + p.y * 0.22 + t * 0.012) * (0.28 + 0.26 * smoothstep(-1.0, 1.0, p.y));
    vec3 cloudBody = palette(0.28 + cumulus * 0.55 + t * 0.018) * (0.45 + 0.65 * cloudMask);
    vec3 rimGlow = palette(0.08 + t * 0.02) * (silverLining * 0.78 + wispMask * 0.45);

    vec3 col = mix(sky, cloudBody, cloudMask * 0.82) + rimGlow;
    return col * 0.92;
  }

  vec3 sampleWorld(float id, vec2 p, float t) {
    if (id < 0.5) return renderJulia(p, t);
    if (id < 1.5) return renderKaleidoscope(p, t);
    if (id < 2.5) return renderStainedGlass(p, t);
    if (id < 3.5) return renderNebula(p, t);
    if (id < 4.5) return renderCaustics(p, t);
    if (id < 5.5) return renderAurora(p, t);
    if (id < 6.5) return renderLiquidOil(p, t);
    if (id < 7.5) return renderPrismGeode(p, t);
    if (id < 8.5) return renderMycelium(p, t);
    if (id < 9.5) return renderCanopy(p, t);
    return renderCloudscape(p, t);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (vUv - 0.5) * 2.0 * aspect;

    // Gentle liquid underwater wave sway when aquatic atmosphere is active
    if (uUnderwater > 0.01) {
      p.x += sin(p.y * 2.8 + uTime * 0.48) * 0.028 * uUnderwater;
      p.y += cos(p.x * 2.3 - uTime * 0.38) * 0.020 * uUnderwater;
    }

    float dist = length(p);
    float twistAngle = uTwist * sin(dist * 1.35 - uTime * 0.065) * 0.45;
    vec2 wp = p * rot(twistAngle);

    if (uKaleido > 0.01) {
      float a = atan(wp.y, wp.x);
      float seg = TAU / 8.0;
      float fa = abs(mod(a + PI, seg) - seg * 0.5);
      vec2 kp = vec2(cos(fa), sin(fa)) * length(wp);
      wp = mix(wp, kp, uKaleido * 0.36);
    }

    vec3 color;
    if (uMorph < 0.004) {
      color = sampleWorld(uSceneA, wp, uTime);
    } else if (uMorph > 0.996) {
      color = sampleWorld(uSceneB, wp, uTime);
    } else {
      vec3 colA = sampleWorld(uSceneA, wp, uTime);
      vec3 colB = sampleWorld(uSceneB, wp, uTime);

      float maskNoise = fbm(p * 1.45 + vec2(uTime * 0.025, -uTime * 0.02));
      float lumB = dot(colB, vec3(0.299, 0.587, 0.114));
      float dissolve = smoothstep(
        uMorph * 1.45 - 0.45,
        uMorph * 1.45 + 0.10,
        maskNoise * 0.72 + lumB * 0.28
      );
      float blendW = 1.0 - dissolve;

      vec3 baseMix = mix(colA, colB, blendW);
      float overlapAmt = sin(clamp(uMorph, 0.0, 1.0) * PI);
      vec3 screenBlend = 1.0 - (1.0 - colA * 0.85) * (1.0 - colB * 0.85);
      color = mix(baseMix, screenBlend, overlapAmt * 0.42);
    }

    float vig = smoothstep(2.05, 0.35, dist);
    color *= (0.48 + 0.58 * vig);

    // Gentle HUD legibility guardrail under top-right clock/weather column
    float hudMask = smoothstep(0.70, 0.96, vUv.x) * smoothstep(0.22, 0.82, vUv.y);
    color *= mix(1.0, 0.62, hudMask);

    gl_FragColor = vec4(max(color, 0.0), 1.0);
  }
`;

// ============================================================
// CUSTOM 3D SHADERS
// ============================================================
const PLANET_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vLocalPos;
  varying vec3 vViewPos;
  void main() {
    vLocalPos = normalize(position);
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const PLANET_FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vLocalPos;
  varying vec3 vViewPos;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uKeyColor;
  uniform vec3 uRimColor;
  uniform vec3 uAccentColor;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p = p * 2.05 + vec3(0.4, -0.3, 0.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    vec3 lightDir = normalize(vec3(-0.75, 0.45, 0.65));

    float swirl = fbm3(vLocalPos * 3.2 + vec3(uTime * 0.04, 0.0, -uTime * 0.03));
    float bands = sin(vLocalPos.y * 14.0 + swirl * 4.2) * 0.5 + 0.5;
    float fine = fbm3(vLocalPos * 7.0 + vec3(swirl * 2.0, uTime * 0.02, 0.0));

    vec3 colA = mix(uAccentColor * 0.45, uKeyColor, bands);
    vec3 surface = mix(colA, uRimColor * 0.9, fine * 0.48);

    float diff = smoothstep(-0.22, 0.95, dot(n, lightDir));
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.2);

    vec3 lit = surface * (0.12 + 0.95 * diff) + uRimColor * fresnel * (0.45 + 0.85 * diff);
    gl_FragColor = vec4(lit, uOpacity);
  }
`;

const RING_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uKeyColor;
  uniform vec3 uRimColor;

  void main() {
    vec2 centered = vUv - 0.5;
    float r = length(centered) * 2.0;
    if (r < 0.46 || r > 1.0) discard;

    float t = (r - 0.46) / 0.54;
    float fineBands = 0.5 + 0.5 * sin(t * 58.0 + sin(t * 14.0) * 1.5);
    float cassiniGap = smoothstep(0.02, 0.06, abs(t - 0.62));
    float edgeFade = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.82, t);
    float angle = atan(centered.y, centered.x);
    float shimmer = 0.8 + 0.2 * sin(angle * 3.0 + uTime * 0.15);

    vec3 col = mix(uRimColor, uKeyColor, 0.35 + 0.65 * fineBands);
    float alpha = edgeFade * cassiniGap * (0.28 + 0.55 * fineBands) * shimmer * uOpacity * 0.78;
    gl_FragColor = vec4(col, alpha);
  }
`;

const FRESNEL_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uPulse;
  void main() {
    vUv = uv;
    vec3 pos = position;
    if (uPulse > 0.001) {
      float wave = sin(uTime * 0.95 - pos.y * 2.6) * 0.08 * uPulse;
      pos.x *= (1.0 + wave);
      pos.z *= (1.0 + wave);
    }
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRESNEL_FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec2 vUv;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  uniform float uPower;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    float fres = pow(1.0 - abs(dot(n, v)), uPower);
    vec3 col = mix(uColorA, uColorB, clamp(fres + vUv.y * 0.35, 0.0, 1.0));
    float alpha = clamp((0.14 + 0.86 * fres) * uOpacity, 0.0, 0.95);
    gl_FragColor = vec4(col * (1.1 + fres * 0.6), alpha);
  }
`;

// Psychedelic Bioluminescent Mushroom Cap Shader (fluted gills + glowing spots + iridescent rim)
const MUSHROOM_CAP_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vUv = uv;
    vLocalPos = position;
    vec3 pos = position;
    // Gentle organic breathing pulsation along cap rim
    float rimFactor = smoothstep(0.2, 1.2, length(pos.xz));
    float breath = sin(uTime * 0.75 + atan(pos.z, pos.x) * 3.0) * 0.045 * rimFactor;
    pos.y += breath;
    pos.xz *= (1.0 + breath * 0.45);
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const MUSHROOM_CAP_FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    float fres = pow(1.0 - abs(dot(n, v)), 1.9);

    float angle = atan(vLocalPos.z, vLocalPos.x);
    float radial = length(vLocalPos.xz);
    // Radial fluted gill striations + soft bioluminescent spots
    float gills = 0.5 + 0.5 * sin(angle * 28.0 + radial * 4.0);
    float spots = pow(max(0.0, sin(angle * 7.0 + uTime * 0.15) * sin(radial * 9.5 - uTime * 0.25)), 4.0);
    float pulse = 0.78 + 0.22 * sin(uTime * 0.85 - radial * 2.5);

    vec3 capCol = mix(uColorA, uColorB, clamp(fres * 0.85 + radial * 0.45, 0.0, 1.0));
    capCol += uColorC * (spots * 0.85 + gills * 0.24) * pulse;
    float alpha = clamp((0.20 + 0.72 * fres + gills * 0.14) * uOpacity, 0.0, 0.90);
    gl_FragColor = vec4(capCol * (0.95 + fres * 0.55), alpha);
  }
`;

const ETHEREAL_POLY_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vViewDist;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vViewDist = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ETHEREAL_POLY_FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vViewDist;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    float fres = pow(1.0 - abs(dot(n, v)), 1.55);
    float farFade = smoothstep(64.0, 24.0, vViewDist);
    float nearFade = smoothstep(2.4, 11.8, vViewDist);
    float depthFade = farFade * nearFade;
    vec3 col = mix(uColorA, uColorB, 0.25 + 0.75 * fres);
    float alpha = (0.32 + 0.68 * fres) * depthFade * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

const ETHEREAL_LINE_VERTEX_SHADER = `
  varying float vViewDist;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDist = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ETHEREAL_LINE_FRAGMENT_SHADER = `
  precision highp float;
  varying float vViewDist;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float farFade = smoothstep(62.0, 22.0, vViewDist);
    float nearFade = smoothstep(3.0, 12.5, vViewDist);
    float alpha = farFade * nearFade * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// Translucent Glassy Underwater Bubble Shader (InstancedMesh compatible)
const BUBBLE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vViewDist;
  void main() {
    vec4 localPos = vec4(position, 1.0);
    vec3 localNormal = normal;
    #ifdef USE_INSTANCING
      localPos = instanceMatrix * localPos;
      localNormal = mat3(instanceMatrix) * localNormal;
    #endif
    vNormal = normalize(normalMatrix * localNormal);
    vec4 mvPos = modelViewMatrix * localPos;
    vViewPos = -mvPos.xyz;
    vViewDist = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const BUBBLE_FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vViewDist;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    float ndv = max(dot(n, v), 0.0);
    float rim = pow(1.0 - ndv, 2.75);
    vec3 lightDir = normalize(vec3(-0.45, 0.78, 0.55));
    vec3 halfVec = normalize(lightDir + v);
    float spec = pow(max(dot(n, halfVec), 0.0), 26.0);
    float depthFade = smoothstep(32.0, 12.0, vViewDist) * smoothstep(1.2, 4.2, vViewDist);

    vec3 col = mix(uColorA, uColorB, rim * 0.75) * (0.85 + 0.65 * rim) + vec3(0.95, 0.99, 1.0) * spec * 1.15;
    float alpha = clamp((rim * 0.72 + spec * 0.85 + 0.04) * depthFade * uOpacity, 0.0, 0.92);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Translucent Veined Leaf / Blossom Petal Shader (InstancedMesh compatible)
const LEAF_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vViewDist;
  void main() {
    vUv = uv;
    vec4 localPos = vec4(position, 1.0);
    vec3 localNormal = normal;
    #ifdef USE_INSTANCING
      localPos = instanceMatrix * localPos;
      localNormal = mat3(instanceMatrix) * localNormal;
    #endif
    vNormal = normalize(normalMatrix * localNormal);
    vec4 mvPos = modelViewMatrix * localPos;
    vViewPos = -mvPos.xyz;
    vViewDist = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const LEAF_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vViewDist;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    float fres = pow(1.0 - abs(dot(n, v)), 1.6);
    // Delicate central midrib & feathery side veins
    float midrib = exp(-abs(vUv.x - 0.5) * 28.0);
    float veins = pow(0.5 + 0.5 * sin((vUv.y * 16.0 - abs(vUv.x - 0.5) * 14.0)), 4.0) * 0.4;
    float edgeSoft = sin(vUv.x * 3.14159265) * sin(vUv.y * 3.14159265);
    float depthFade = smoothstep(30.0, 10.0, vViewDist) * smoothstep(1.5, 4.5, vViewDist);

    vec3 col = mix(uColorA, uColorB, vUv.y * 0.7 + fres * 0.3) * (0.85 + midrib * 0.65 + veins);
    float alpha = clamp((0.26 + 0.44 * fres + midrib * 0.35) * smoothstep(0.0, 0.22, edgeSoft) * depthFade * uOpacity, 0.0, 0.85);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Swaying Underwater Light Curtain / Willow Veil / Rising Fire Wisp Ribbon Shader
const FLOW_RIBBON_VERTEX_SHADER = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uPhase;
  uniform float uSwayAmp;
  uniform float uSpeed;
  uniform float uAnchorTop;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // If anchored at top (willow veil), top stays still while lower tips sway gracefully
    float mobility = uAnchorTop > 0.5 ? (1.0 - uv.y) : (0.3 + uv.y * 0.9);
    float sway = sin(pos.y * 0.45 + uTime * uSpeed + uPhase) * uSwayAmp
      + cos(pos.y * 0.9 - uTime * uSpeed * 0.65 + uPhase * 1.7) * (uSwayAmp * 0.4);
    pos.x += sway * mobility;
    pos.z += cos(pos.y * 0.5 + uTime * uSpeed * 0.8 + uPhase) * (uSwayAmp * 0.55) * mobility;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FLOW_RIBBON_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uPhase;
  uniform float uVeinsFreq;
  void main() {
    float edgeX = sin(vUv.x * 3.14159265);
    float edgeY = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
    float veins = 0.52 + 0.48 * sin(vUv.x * uVeinsFreq + vUv.y * 9.0 - uTime * 0.55 + uPhase);
    vec3 col = mix(uColorA, uColorB, vUv.y);
    float alpha = pow(edgeX, 1.65) * edgeY * veins * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Faceted Translucent Ice Crystal / Icicle Refraction Shader
const ICE_CRYSTAL_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ICE_CRYSTAL_FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);
    float fres = pow(1.0 - abs(dot(n, v)), 2.2);
    vec3 lightDir = normalize(vec3(sin(uTime * 0.18) * 0.7, 0.65, 0.6));
    float spec = pow(max(dot(n, normalize(lightDir + v)), 0.0), 22.0);
    float shimmer = 0.75 + 0.25 * sin(vUv.y * 14.0 - uTime * 0.45);

    vec3 col = mix(uColorA, uColorB, fres * 0.7 + vUv.y * 0.3) * (0.75 + 0.55 * fres)
      + vec3(0.92, 0.98, 1.0) * spec * 1.1;
    float alpha = clamp((0.18 + 0.65 * fres + spec * 0.6) * shimmer * uOpacity, 0.0, 0.88);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ============================================================
// DREAMSCAPE ENGINE CLASS
// ============================================================
export class DreamscapeEngine {
  constructor(container, { onTitleChange } = {}) {
    this.container = container;
    this.onTitleChange = typeof onTitleChange === 'function' ? onTitleChange : null;

    this.isSoftwareGl = detectSoftwareWebGL();
    this.isRunning = false;
    this.isDisposed = false;
    this.frameId = 0;

    // Reusable scratch objects (zero GC in render loop)
    this._dummy = new THREE.Object3D();
    this._tmpColor = new THREE.Color();
    this._whiteColor = new THREE.Color(0xffffff);
    this._warmEmberA = new THREE.Color('#ff9f43');
    this._warmEmberB = new THREE.Color('#ff4d4d');
    this._iceTint = new THREE.Color('#e0f2fe');
    this._curPalA = new THREE.Vector3();
    this._curPalB = new THREE.Vector3();
    this._curPalC = new THREE.Vector3();
    this._curPalD = new THREE.Vector3();
    this._curKey = new THREE.Color();
    this._curRim = new THREE.Color();
    this._curAccent = new THREE.Color();
    this._curFog = new THREE.Color();

    // Silent automatic dynamic resolution & shader quality scaling state
    this.maxNativeDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.availableTiers = RENDER_TIERS.filter((r) => r <= this.maxNativeDpr + 0.02);
    if (this.availableTiers.length === 0) this.availableTiers = [0.66, 1.0];
    this.tierIdx = this._pickInitialTierIndex();
    this.currentScale = this.availableTiers[this.tierIdx];
    this.shaderQuality = this._scaleToQuality(this.currentScale);
    this.targetShaderQuality = this.shaderQuality;
    this.perfWarmupSec = 0;
    this.perfWindowSec = 0;
    this.perfWindowFrames = 0;
    this.lowFpsStreak = 0;
    this.highFpsStreak = 0;
    this.upgradeCount = 0;

    // Anti-repeat variety director history
    this.recentShaders = [];
    this.recentWorlds3d = [];
    this.recentAtmos = [];

    // Choreography timers
    this.clock = new THREE.Clock(false);
    this.elapsed = Math.random() * 140;
    this.stepCounter = 0;
    this.stepA = this._pickNextStep(null);
    this.stepB = this._pickNextStep(this.stepA);
    this.morphProgress = 0.0;
    this.nudgeBoost = 0.0;

    // Palette anti-repeat state
    this.paletteIdxA = Math.floor(Math.random() * PALETTES.length);
    this.paletteIdxB = this._pickNextPalette(this.paletteIdxA);
    this.paletteProgress = 0.0;

    this.modeNameIdx = Math.floor(Math.random() * MODE_NAMES.length);
    this.lastTitleKey = '';

    // 3D World weights (0..8) & 6 Atmospheric FX weights
    this.worldWeights = new Array(THREE_WORLDS.length).fill(0);
    this.atmosWeights = {
      stars: 0,
      underwater: 0,
      forest: 0,
      snow: 0,
      rain: 0,
      embers: 0,
    };
    this.atmosWeights[this.stepA.atmos] = 1.0;
    this.warpClock = Math.random() * 110;

    this._initRenderer();
    this._initScene();
    this._initBackdrop();

    // Layer 3: 6 Modular Atmospheric FX Layers
    this._initWarpStarfield();
    this._initUnderwaterFX();
    this._initForestFX();
    this._initSnowFX();
    this._initRainFX();
    this._initEmberFX();

    // Layer 2: 8 Active 3D Centerpiece Worlds (+ world 5 Open Vista)
    this._initSacredTunnel();
    this._initExoplanet();
    this._initBioluminescence();
    this._initSupernovaVortex();
    this._initCelestialOrrery();
    this._initMushroomGrove();
    this._initWillowVeil();
    this._initIcicleSanctuary();

    this._onResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._onResize);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this._emitTitle(true);
  }

  _pickInitialTierIndex() {
    if (this.isSoftwareGl) {
      const idx = this.availableTiers.findIndex((r) => r >= 0.65);
      return idx >= 0 ? idx : 0;
    }
    const cores = navigator.hardwareConcurrency || 4;
    const largeScreen = Math.max(window.innerWidth, window.innerHeight) >= 1800;
    const targetStart = (cores <= 4 || largeScreen) ? 0.80 : Math.min(this.maxNativeDpr, 1.25);
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < this.availableTiers.length; i++) {
      const diff = Math.abs(this.availableTiers[i] - targetStart);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  _scaleToQuality(scale) {
    if (scale <= 0.48) return 0.22;
    if (scale <= 0.58) return 0.42;
    if (scale <= 0.70) return 0.68;
    return 1.0;
  }

  _applyRenderTier(newIdx) {
    const clamped = Math.max(0, Math.min(this.availableTiers.length - 1, newIdx));
    if (clamped === this.tierIdx) return;
    this.tierIdx = clamped;
    this.currentScale = this.availableTiers[this.tierIdx];
    this.targetShaderQuality = this._scaleToQuality(this.currentScale);
    if (this.renderer && !this.isDisposed) {
      this.renderer.setPixelRatio(this.currentScale);
      this.renderer.setSize(window.innerWidth, Math.max(window.innerHeight, 1), false);
    }
  }

  _monitorPerformance(rawDt) {
    if (this.isSoftwareGl) return;
    if (rawDt <= 0 || rawDt > 0.45) return;

    if (this.perfWarmupSec < 3.5) {
      this.perfWarmupSec += rawDt;
      return;
    }

    this.perfWindowSec += rawDt;
    this.perfWindowFrames += 1;

    if (this.perfWindowSec >= 2.2) {
      const avgFps = this.perfWindowFrames / this.perfWindowSec;
      this.perfWindowSec = 0;
      this.perfWindowFrames = 0;

      if (avgFps < 27.5) {
        this.lowFpsStreak += 1;
        this.highFpsStreak = 0;
        if (this.lowFpsStreak >= 2 && this.tierIdx > 0) {
          this.lowFpsStreak = 0;
          this._applyRenderTier(this.tierIdx - 1);
        }
      } else if (avgFps > 52.0) {
        this.highFpsStreak += 1;
        this.lowFpsStreak = 0;
        if (this.highFpsStreak >= 3 && this.tierIdx < this.availableTiers.length - 1 && this.upgradeCount < 2) {
          this.highFpsStreak = 0;
          this.upgradeCount += 1;
          this._applyRenderTier(this.tierIdx + 1);
        }
      } else {
        this.lowFpsStreak = 0;
        this.highFpsStreak = 0;
      }
    }
  }

  _pickNextPalette(prevIdx) {
    const prevFamily = PALETTES[prevIdx].family;
    const candidates = [];
    for (let i = 0; i < PALETTES.length; i++) {
      if (i !== prevIdx && PALETTES[i].family !== prevFamily) {
        candidates.push(i);
      }
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  _pickAtmosphereForScene(shader, world3d) {
    // Hard realm matches first so ocean feels aquatic, forest feels alive, glacier feels snowy
    let pool = [];
    if (shader === 4 || world3d === 2) {
      pool = ['underwater'];
    } else if (world3d === 6 || world3d === 7 || shader === 8 || shader === 9) {
      pool = ['forest', 'forest', 'rain', 'embers'];
    } else if (world3d === 8) {
      pool = ['snow', 'snow', 'stars'];
    } else if (shader === 10) {
      pool = ['rain', 'snow', 'forest', 'embers', 'stars'];
    } else if (shader === 5 || shader === 7) {
      pool = ['snow', 'stars', 'embers'];
    } else if (shader === 3 || world3d === 1 || world3d === 3) {
      pool = ['stars', 'stars', 'embers'];
    } else if (shader === 6) {
      pool = ['embers', 'forest', 'stars'];
    } else {
      pool = ['stars', 'embers', 'forest', 'rain', 'snow'];
    }

    // Prefer an atmosphere that wasn't just active
    const fresh = pool.filter((a) => !this.recentAtmos.includes(a));
    const chosen = fresh.length > 0
      ? fresh[Math.floor(Math.random() * fresh.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    this.recentAtmos.push(chosen);
    if (this.recentAtmos.length > 2) this.recentAtmos.shift();
    return chosen;
  }

  _pickNextStep(prevStep) {
    const shaderCandidates = [];
    for (let s = 0; s < SHADER_WORLDS.length; s++) {
      if (!this.recentShaders.includes(s)) shaderCandidates.push(s);
    }
    const shader = shaderCandidates.length > 0
      ? shaderCandidates[Math.floor(Math.random() * shaderCandidates.length)]
      : Math.floor(Math.random() * SHADER_WORLDS.length);

    const affinity = SHADER_AFFINITY[shader] || [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let worldCandidates = affinity.filter((w) => !this.recentWorlds3d.includes(w));
    if (worldCandidates.length === 0) {
      worldCandidates = affinity.filter((w) => !prevStep || w !== prevStep.world3d);
    }
    if (worldCandidates.length === 0) worldCandidates = affinity;
    const world3d = worldCandidates[Math.floor(Math.random() * worldCandidates.length)];

    this.recentShaders.push(shader);
    if (this.recentShaders.length > 3) this.recentShaders.shift();
    this.recentWorlds3d.push(world3d);
    if (this.recentWorlds3d.length > 2) this.recentWorlds3d.shift();

    const atmos = this._pickAtmosphereForScene(shader, world3d);

    const twist = (shader === 4 || shader === 5 || shader === 9 || shader === 10)
      ? 0.05 + Math.random() * 0.07
      : 0.12 + Math.random() * 0.22;
    const kaleido = shader === 1
      ? 0.65 + Math.random() * 0.35
      : (shader === 2 || shader === 7 ? Math.random() * 0.30 : (Math.random() < 0.18 ? 0.20 : 0.0));

    const sideBias = -2.8 + Math.random() * 2.4;
    return { shader, world3d, atmos, twist, kaleido, sideBias };
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && this.currentScale >= 0.8,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.currentScale);
    this.renderer.setSize(window.innerWidth, Math.max(window.innerHeight, 1), false);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070914, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      150
    );
    this.camera.position.set(0, 0, 12);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    pmrem.dispose();

    this.hemiLight = new THREE.HemisphereLight(0x88ccff, 0x1e1b4b, 0.85);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffd39e, 1.65);
    this.keyLight.position.set(-10, 7, 10);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x63b3ff, 1.1);
    this.rimLight.position.set(10, -5, -8);
    this.scene.add(this.rimLight);

    this.glowTex = createSoftGlowTexture();
  }

  _initBackdrop() {
    const geo = new THREE.PlaneGeometry(2, 2);
    this.backdropMat = new THREE.ShaderMaterial({
      vertexShader: BACKDROP_VERTEX_SHADER,
      fragmentShader: BACKDROP_FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, Math.max(window.innerHeight, 1)) },
        uSceneA: { value: this.stepA.shader },
        uSceneB: { value: this.stepB.shader },
        uMorph: { value: 0 },
        uTwist: { value: 0.15 },
        uKaleido: { value: 0.0 },
        uQuality: { value: this.shaderQuality },
        uUnderwater: { value: 0.0 },
        uPalA: { value: new THREE.Vector3(0.18, 0.16, 0.28) },
        uPalB: { value: new THREE.Vector3(0.45, 0.36, 0.44) },
        uPalC: { value: new THREE.Vector3(1.0, 0.9, 0.85) },
        uPalD: { value: new THREE.Vector3(0.08, 0.26, 0.56) },
      },
    });
    this.backdropMesh = new THREE.Mesh(geo, this.backdropMat);
    this.backdropMesh.frustumCulled = false;
    this.backdropMesh.renderOrder = -100;
    this.scene.add(this.backdropMesh);
  }

  // ============================================================
  // LAYER 3: 6 MODULAR ATMOSPHERIC FX LAYERS
  // ============================================================

  // 3A: Slow Time-Warp 3D Starfield
  _initWarpStarfield() {
    this.starGroup = new THREE.Group();
    const count = 380;
    this.starCount = count;
    this.starData = [];

    const headPositions = new Float32Array(count * 3);
    const headColors = new Float32Array(count * 3);
    const streakPositions = new Float32Array(count * 2 * 3);
    const streakColors = new Float32Array(count * 2 * 3);

    const starTints = [
      new THREE.Color('#fff9eb'),
      new THREE.Color('#dbeafe'),
      new THREE.Color('#fde68a'),
      new THREE.Color('#e0e7ff'),
      new THREE.Color('#fbcfe8'),
    ];

    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 62;
      let y = (Math.random() - 0.5) * 40;
      if (Math.hypot(x, y) < 2.2) x += (x >= 0 ? 2.5 : -2.5);
      const z = -Math.random() * 76 + 10;
      const speed = 0.65 + Math.random() * 0.95;
      const tint = starTints[i % starTints.length];

      this.starData.push({ x, y, z, speed });

      headPositions[i * 3] = x;
      headPositions[i * 3 + 1] = y;
      headPositions[i * 3 + 2] = z;

      headColors[i * 3] = tint.r;
      headColors[i * 3 + 1] = tint.g;
      headColors[i * 3 + 2] = tint.b;

      const s6 = i * 6;
      streakPositions[s6] = x;
      streakPositions[s6 + 1] = y;
      streakPositions[s6 + 2] = z;
      streakPositions[s6 + 3] = x;
      streakPositions[s6 + 4] = y;
      streakPositions[s6 + 5] = z - 0.5;

      streakColors[s6] = tint.r;
      streakColors[s6 + 1] = tint.g;
      streakColors[s6 + 2] = tint.b;
      streakColors[s6 + 3] = tint.r * 0.08;
      streakColors[s6 + 4] = tint.g * 0.12;
      streakColors[s6 + 5] = tint.b * 0.20;
    }

    this.starHeadPosAttr = new THREE.BufferAttribute(headPositions, 3);
    const headGeo = new THREE.BufferGeometry();
    headGeo.setAttribute('position', this.starHeadPosAttr);
    headGeo.setAttribute('color', new THREE.BufferAttribute(headColors, 3));

    this.starMat = new THREE.PointsMaterial({
      map: this.glowTex,
      size: 0.36,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.starField = new THREE.Points(headGeo, this.starMat);
    this.starField.frustumCulled = false;

    this.starStreakPosAttr = new THREE.BufferAttribute(streakPositions, 3);
    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute('position', this.starStreakPosAttr);
    streakGeo.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));

    this.starStreakMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.starStreaks = new THREE.LineSegments(streakGeo, this.starStreakMat);
    this.starStreaks.frustumCulled = false;

    this.starGroup.add(this.starField, this.starStreaks);
    this.scene.add(this.starGroup);
  }

  // 3B: Underwater Glass Bubbles & Swaying Abyssal Ribbons
  _initUnderwaterFX() {
    this.underwaterGroup = new THREE.Group();

    const bubbleCount = 145;
    const bubbleGeo = new THREE.SphereGeometry(0.28, 14, 10);
    this.bubbleMat = new THREE.ShaderMaterial({
      vertexShader: BUBBLE_VERTEX_SHADER,
      fragmentShader: BUBBLE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: new THREE.Color('#67e8f9') },
        uColorB: { value: new THREE.Color('#c4b5fd') },
        uOpacity: { value: 0.0 },
      },
    });
    this.bubbleMesh = new THREE.InstancedMesh(bubbleGeo, this.bubbleMat, bubbleCount);
    this.bubbleMesh.frustumCulled = false;

    this.bubbleVents = [];
    for (let v = 0; v < 8; v++) {
      this.bubbleVents.push({
        baseX: -12 + v * 3.2 + (Math.random() - 0.5) * 1.4,
        z: -3 - Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.bubbleData = [];
    for (let i = 0; i < bubbleCount; i++) {
      const ventIdx = i % this.bubbleVents.length;
      const tier = Math.random();
      const radiusScale = tier < 0.58
        ? 0.18 + Math.random() * 0.24
        : (tier < 0.88 ? 0.45 + Math.random() * 0.42 : 0.95 + Math.random() * 0.72);

      this.bubbleData.push({
        ventIdx,
        offsetX: (Math.random() - 0.5) * 3.4,
        y: -11 + Math.random() * 22,
        offsetZ: (Math.random() - 0.5) * 3.0,
        scale: radiusScale,
        riseSpeed: (0.42 + Math.random() * 0.58) * (0.7 + 0.5 / Math.max(radiusScale, 0.35)),
        wobbleFreq: 0.7 + Math.random() * 1.1,
        wobbleAmp: 0.28 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        isHero: tier >= 0.88,
      });
    }
    this.underwaterGroup.add(this.bubbleMesh);

    this.abyssRibbons = [];
    const ribbonGeo = new THREE.PlaneGeometry(1.4, 15.5, 4, 20);
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: FLOW_RIBBON_VERTEX_SHADER,
        fragmentShader: FLOW_RIBBON_FRAGMENT_SHADER,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: i * 1.37 },
          uSwayAmp: { value: 0.65 },
          uSpeed: { value: 0.42 },
          uAnchorTop: { value: 0.0 },
          uVeinsFreq: { value: 16.0 },
          uColorA: { value: new THREE.Color('#2dd4bf') },
          uColorB: { value: new THREE.Color('#38bdf8') },
          uOpacity: { value: 0.0 },
        },
      });
      const ribbon = new THREE.Mesh(ribbonGeo, mat);
      ribbon.position.set(
        -10.5 + i * 3.6 + (Math.random() - 0.5) * 1.4,
        -1.5 + (i % 2) * 1.4,
        -11.5 - (i % 3) * 3.5
      );
      ribbon.rotation.y = (Math.random() - 0.5) * 0.7;
      this.underwaterGroup.add(ribbon);
      this.abyssRibbons.push({ mesh: ribbon, mat });
    }

    this.underwaterGroup.visible = false;
    this.scene.add(this.underwaterGroup);
  }

  // 3C: Living Forest FX (Luminous Spores, Pulsing Fireflies & Floating Translucent Leaves/Petals)
  _initForestFX() {
    this.forestGroup = new THREE.Group();

    // 1. 120 Spores & Pulsing Fireflies
    const sporeCount = 120;
    const sporeGeo = new THREE.OctahedronGeometry(0.10, 0);
    this.sporeMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sporeMesh = new THREE.InstancedMesh(sporeGeo, this.sporeMat, sporeCount);
    this.sporeMesh.frustumCulled = false;
    this.sporeData = [];

    for (let i = 0; i < sporeCount; i++) {
      const isFirefly = i < 38;
      this.sporeData.push({
        x: (Math.random() - 0.5) * 28 - 1.0,
        y: (Math.random() - 0.5) * 18,
        z: -Math.random() * 19 + 3,
        scale: isFirefly ? (0.85 + Math.random() * 0.85) : (0.32 + Math.random() * 0.45),
        riseSpeed: isFirefly ? (0.06 + Math.random() * 0.14) : (0.14 + Math.random() * 0.28),
        driftX: (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2,
        blinkRate: isFirefly ? (0.85 + Math.random() * 1.25) : (0.35 + Math.random() * 0.45),
        isFirefly,
      });
      this._tmpColor.setHSL(isFirefly ? (0.12 + Math.random() * 0.08) : (0.38 + Math.random() * 0.22), 0.9, 0.72);
      this.sporeMesh.setColorAt(i, this._tmpColor);
    }
    this.sporeMesh.instanceColor.needsUpdate = true;
    this.forestGroup.add(this.sporeMesh);

    // 2. 48 Floating Translucent Willow Leaves & Blossom Petals tumbling gently in 3D breeze
    const leafCount = 48;
    const leafGeo = createCurvedLeafGeometry();
    this.leafMat = new THREE.ShaderMaterial({
      vertexShader: LEAF_VERTEX_SHADER,
      fragmentShader: LEAF_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: new THREE.Color('#86efac') },
        uColorB: { value: new THREE.Color('#fbcfe8') },
        uOpacity: { value: 0.0 },
      },
    });
    this.leafMesh = new THREE.InstancedMesh(leafGeo, this.leafMat, leafCount);
    this.leafMesh.frustumCulled = false;
    this.leafData = [];

    for (let i = 0; i < leafCount; i++) {
      const isPetal = i % 3 === 0;
      this.leafData.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 20,
        z: -Math.random() * 16 + 2.5,
        scaleX: isPetal ? (0.85 + Math.random() * 0.55) : (0.55 + Math.random() * 0.4),
        scaleY: isPetal ? (0.65 + Math.random() * 0.4) : (0.95 + Math.random() * 0.65),
        fallSpeed: 0.28 + Math.random() * 0.36,
        glideX: 0.35 + Math.random() * 0.48,
        tumbleSpeedX: (Math.random() - 0.5) * 0.95,
        tumbleSpeedY: (Math.random() - 0.5) * 1.15,
        tumbleSpeedZ: (Math.random() - 0.5) * 0.75,
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.forestGroup.add(this.leafMesh);

    this.forestGroup.visible = false;
    this.scene.add(this.forestGroup);
  }

  // 3D: Drifting Snowfall & Frost Motes
  _initSnowFX() {
    this.snowGroup = new THREE.Group();
    const count = 170;
    const flakeGeo = new THREE.OctahedronGeometry(0.11, 0);
    this.snowMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.snowMesh = new THREE.InstancedMesh(flakeGeo, this.snowMat, count);
    this.snowMesh.frustumCulled = false;
    this.snowData = [];

    for (let i = 0; i < count; i++) {
      this.snowData.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 22,
        z: -Math.random() * 20 + 3.5,
        scale: 0.35 + Math.random() * 1.05,
        fallSpeed: 0.48 + Math.random() * 0.65,
        swayFreq: 0.4 + Math.random() * 0.65,
        swayAmp: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.snowGroup.add(this.snowMesh);
    this.snowGroup.visible = false;
    this.scene.add(this.snowGroup);
  }

  // 3E: Luminous Diagonal Rain Shower (ultra-lightweight LineSegments)
  _initRainFX() {
    this.rainGroup = new THREE.Group();
    const count = 175;
    this.rainCount = count;
    this.rainData = [];

    const positions = new Float32Array(count * 2 * 3);
    const colors = new Float32Array(count * 2 * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 22;
      const z = -Math.random() * 18 + 3.5;
      const speed = 7.5 + Math.random() * 5.5;
      const len = 0.85 + Math.random() * 1.15;
      this.rainData.push({ x, y, z, speed, len });

      const s6 = i * 6;
      positions[s6] = x;
      positions[s6 + 1] = y;
      positions[s6 + 2] = z;
      positions[s6 + 3] = x + len * 0.18;
      positions[s6 + 4] = y + len;
      positions[s6 + 5] = z;

      // Soft brighter droplet head, fading tail
      colors[s6] = 0.92;
      colors[s6 + 1] = 0.96;
      colors[s6 + 2] = 1.0;
      colors[s6 + 3] = 0.25;
      colors[s6 + 4] = 0.35;
      colors[s6 + 5] = 0.48;
    }

    this.rainPosAttr = new THREE.BufferAttribute(positions, 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', this.rainPosAttr);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.rainMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      color: 0xbfe7ff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.rainLines = new THREE.LineSegments(geo, this.rainMat);
    this.rainLines.frustumCulled = false;
    this.rainGroup.add(this.rainLines);
    this.rainGroup.visible = false;
    this.scene.add(this.rainGroup);
  }

  // 3F: Rising Fire Wisps & Swirling Glowing Embers
  _initEmberFX() {
    this.emberGroup = new THREE.Group();

    // 1. 110 Swirling glowing embers rising on warm thermal updrafts
    const emberCount = 110;
    const emberGeo = new THREE.OctahedronGeometry(0.095, 0);
    this.emberMat = new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.emberMesh = new THREE.InstancedMesh(emberGeo, this.emberMat, emberCount);
    this.emberMesh.frustumCulled = false;
    this.emberData = [];

    for (let i = 0; i < emberCount; i++) {
      this.emberData.push({
        x: (Math.random() - 0.5) * 28 - 1.0,
        y: -11 + Math.random() * 22,
        z: -Math.random() * 18 + 3,
        scale: 0.38 + Math.random() * 0.95,
        riseSpeed: 0.72 + Math.random() * 1.15,
        swirlRadius: 0.45 + Math.random() * 1.15,
        swirlFreq: 0.65 + Math.random() * 0.95,
        phase: Math.random() * Math.PI * 2,
      });
      this._tmpColor.copy(this._warmEmberA).lerp(this._warmEmberB, Math.random());
      this.emberMesh.setColorAt(i, this._tmpColor);
    }
    this.emberMesh.instanceColor.needsUpdate = true;
    this.emberGroup.add(this.emberMesh);

    // 2. 7 Gossamer curling flame/wisp ribbons rising lazily in the mist
    this.fireWisps = [];
    const wispGeo = new THREE.PlaneGeometry(1.15, 11.5, 4, 18);
    for (let i = 0; i < 7; i++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: FLOW_RIBBON_VERTEX_SHADER,
        fragmentShader: FLOW_RIBBON_FRAGMENT_SHADER,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: i * 1.9 },
          uSwayAmp: { value: 0.95 },
          uSpeed: { value: 0.75 },
          uAnchorTop: { value: 0.0 },
          uVeinsFreq: { value: 12.0 },
          uColorA: { value: new THREE.Color('#ff6b6b') },
          uColorB: { value: new THREE.Color('#fde047') },
          uOpacity: { value: 0.0 },
        },
      });
      const wisp = new THREE.Mesh(wispGeo, mat);
      wisp.position.set(
        -9.5 + i * 2.9 + (Math.random() - 0.5) * 1.2,
        -2.5 + (i % 2) * 1.5,
        -9.0 - (i % 3) * 3.2
      );
      wisp.rotation.y = (Math.random() - 0.5) * 0.8;
      this.emberGroup.add(wisp);
      this.fireWisps.push({ mesh: wisp, mat });
    }

    this.emberGroup.visible = false;
    this.scene.add(this.emberGroup);
  }

  // ============================================================
  // LAYER 2: 3D FOREGROUND WORLDS (0..8)
  // ============================================================

  // 3D WORLD 0: Sacred Geometry Tunnel (7 varied gossamer polygon archetypes with shifting centers)
  _initSacredTunnel() {
    this.tunnelGroup = new THREE.Group();
    this.tunnelRings = [];

    const tetraEdges = new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(3.25, 0));
    const octaEdges = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(3.35, 0));
    const dodecaEdges = new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(3.4, 0));
    const icosaEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.45, 0));

    this.tunnelArchetypes = [
      { outer: new THREE.TorusGeometry(4.1, 0.028, 6, 3), inner: new THREE.TorusGeometry(3.35, 0.019, 6, 3), innerRot: Math.PI, filigree: tetraEdges },
      { outer: new THREE.TorusGeometry(4.2, 0.028, 6, 4), inner: new THREE.TorusGeometry(2.9, 0.019, 6, 4), innerRot: Math.PI / 4, filigree: octaEdges },
      { outer: new THREE.TorusGeometry(4.25, 0.027, 6, 5), inner: new THREE.TorusGeometry(2.8, 0.018, 6, 5), innerRot: Math.PI / 5, filigree: dodecaEdges },
      { outer: new THREE.TorusGeometry(4.3, 0.026, 6, 6), inner: new THREE.TorusGeometry(2.75, 0.018, 6, 6), innerRot: Math.PI / 6, filigree: icosaEdges },
      { outer: new THREE.TorusGeometry(4.25, 0.025, 6, 7), inner: new THREE.TorusGeometry(2.85, 0.017, 6, 7), innerRot: Math.PI / 7, filigree: dodecaEdges },
      { outer: new THREE.TorusGeometry(4.35, 0.025, 6, 8), inner: new THREE.TorusGeometry(2.95, 0.017, 6, 8), innerRot: Math.PI / 8, filigree: octaEdges },
      { outer: new THREE.TorusGeometry(4.4, 0.022, 6, 10), inner: new THREE.TorusKnotGeometry(2.55, 0.016, 64, 5, 2, 3), innerRot: 0, filigree: icosaEdges },
    ];

    this.tunnelOuterMat = new THREE.ShaderMaterial({
      vertexShader: ETHEREAL_POLY_VERTEX_SHADER,
      fragmentShader: ETHEREAL_POLY_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: new THREE.Color('#93c5fd') },
        uColorB: { value: new THREE.Color('#38bdf8') },
        uOpacity: { value: 0.0 },
      },
    });

    this.tunnelInnerMat = new THREE.ShaderMaterial({
      vertexShader: ETHEREAL_POLY_VERTEX_SHADER,
      fragmentShader: ETHEREAL_POLY_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: new THREE.Color('#f0abfc') },
        uColorB: { value: new THREE.Color('#ffd39e') },
        uOpacity: { value: 0.0 },
      },
    });

    this.tunnelLineMat = new THREE.ShaderMaterial({
      vertexShader: ETHEREAL_LINE_VERTEX_SHADER,
      fragmentShader: ETHEREAL_LINE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color('#e0f2fe') },
        uOpacity: { value: 0.0 },
      },
    });

    const ringCount = 22;
    this.tunnelSpan = 66;
    const initialFamily = Math.floor(Math.random() * this.tunnelArchetypes.length);

    for (let i = 0; i < ringCount; i++) {
      const archIdx = (initialFamily + Math.floor(i / 4) + (i % 2)) % this.tunnelArchetypes.length;
      const arch = this.tunnelArchetypes[archIdx];

      const portal = new THREE.Group();
      const outer = new THREE.Mesh(arch.outer, this.tunnelOuterMat);
      const inner = new THREE.Mesh(arch.inner, this.tunnelInnerMat);
      inner.rotation.z = arch.innerRot;
      const lattice = new THREE.LineSegments(arch.filigree, this.tunnelLineMat);
      lattice.scale.set(0.95, 0.95, 0.14);

      portal.add(outer, inner, lattice);
      const zPos = -i * (this.tunnelSpan / ringCount) + 6;
      portal.position.set(0, 0, zPos);
      portal.rotation.z = i * 0.34;
      portal.userData = {
        index: i,
        outerMesh: outer,
        innerMesh: inner,
        latticeMesh: lattice,
        baseRot: i * 0.34,
        spinDir: i % 2 === 0 ? 1 : -1,
        spinSpeed: 0.035 + (i % 5) * 0.011,
        eccentricRadius: 0.55 + (i % 4) * 0.42,
        eccentricPhase: i * 1.17,
        tiltAmp: 0.08 + (i % 3) * 0.06,
      };
      this.tunnelGroup.add(portal);
      this.tunnelRings.push(portal);
    }

    this.tunnelGroup.visible = false;
    this.scene.add(this.tunnelGroup);
  }

  // 3D WORLD 1: Procedural Ringed Exoplanet & Moons (grand fly-by arc)
  _initExoplanet() {
    this.planetGroup = new THREE.Group();

    const planetGeo = new THREE.SphereGeometry(2.45, 44, 32);
    this.planetCoreMat = new THREE.ShaderMaterial({
      vertexShader: PLANET_VERTEX_SHADER,
      fragmentShader: PLANET_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: true,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uKeyColor: { value: new THREE.Color('#ffd39e') },
        uRimColor: { value: new THREE.Color('#63b3ff') },
        uAccentColor: { value: new THREE.Color('#e27d60') },
      },
    });
    this.planetSphere = new THREE.Mesh(planetGeo, this.planetCoreMat);
    this.planetGroup.add(this.planetSphere);

    const atmoGeo = new THREE.SphereGeometry(2.76, 36, 28);
    this.planetAtmoMat = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uColorA: { value: new THREE.Color('#38bdf8') },
        uColorB: { value: new THREE.Color('#f0abfc') },
        uOpacity: { value: 0 },
        uPower: { value: 3.1 },
      },
    });
    this.planetAtmo = new THREE.Mesh(atmoGeo, this.planetAtmoMat);
    this.planetAtmo.renderOrder = 4;
    this.planetGroup.add(this.planetAtmo);

    const ringGeo = new THREE.PlaneGeometry(11.4, 11.4, 1, 1);
    this.planetRingMat = new THREE.ShaderMaterial({
      vertexShader: RING_VERTEX_SHADER,
      fragmentShader: RING_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uKeyColor: { value: new THREE.Color('#ffd39e') },
        uRimColor: { value: new THREE.Color('#63b3ff') },
      },
    });
    this.planetRing = new THREE.Mesh(ringGeo, this.planetRingMat);
    this.planetRing.rotation.x = Math.PI * 0.42;
    this.planetRing.rotation.y = 0.24;
    this.planetRing.renderOrder = 3;
    this.planetGroup.add(this.planetRing);

    this.moonMatA = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.25,
      roughness: 0.72,
      metalness: 0.15,
      transparent: true,
      opacity: 0,
    });
    this.moonMatB = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.65,
      transparent: true,
      opacity: 0,
    });

    this.moonA = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 3), this.moonMatA);
    this.moonB = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), this.moonMatB);
    this.planetGroup.add(this.moonA, this.moonB);

    this.planetGroup.position.set(-2.2, 0.2, -5.0);
    this.planetGroup.visible = false;
    this.scene.add(this.planetGroup);
  }

  // 3D WORLD 2: Underwater Bioluminescence Reef
  _initBioluminescence() {
    this.biolumGroup = new THREE.Group();
    this.jellies = [];

    const bellPts = [
      new THREE.Vector2(0.01, 1.05),
      new THREE.Vector2(0.42, 0.96),
      new THREE.Vector2(0.84, 0.68),
      new THREE.Vector2(1.06, 0.22),
      new THREE.Vector2(1.02, -0.18),
      new THREE.Vector2(0.82, -0.12),
    ];
    const bellGeo = new THREE.LatheGeometry(bellPts, 24);
    const coreGeo = new THREE.SphereGeometry(0.42, 18, 14);

    this.jellyBellMat = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 1.0 },
        uColorA: { value: new THREE.Color('#2dd4bf') },
        uColorB: { value: new THREE.Color('#a78bfa') },
        uOpacity: { value: 0 },
        uPower: { value: 2.1 },
      },
    });

    this.jellyCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.1,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    this.tentacleMat = new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const jellyConfigs = [
      { pos: [-3.4, -0.6, -2.0], scale: 1.25, phase: 0.0, speed: 0.22 },
      { pos: [0.6, 1.5, -5.5], scale: 0.95, phase: 2.1, speed: 0.18 },
      { pos: [-5.6, 2.2, -7.2], scale: 0.82, phase: 4.3, speed: 0.15 },
      { pos: [-1.2, -2.8, -9.0], scale: 0.72, phase: 5.4, speed: 0.20 },
    ];

    jellyConfigs.forEach((cfg) => {
      const jelly = new THREE.Group();
      const bell = new THREE.Mesh(bellGeo, this.jellyBellMat);
      const core = new THREE.Mesh(coreGeo, this.jellyCoreMat);
      core.position.y = 0.25;
      core.scale.set(0.85, 1.15, 0.85);
      jelly.add(bell, core);

      for (let t = 0; t < 6; t++) {
        const ang = (t / 6) * Math.PI * 2;
        const rad = 0.35 + (t % 2) * 0.24;
        const curvePts = [];
        for (let k = 0; k <= 7; k++) {
          const frac = k / 7;
          curvePts.push(
            new THREE.Vector3(
              Math.cos(ang) * rad + Math.sin(frac * 4.5 + t) * 0.22 * frac,
              -0.1 - frac * 3.1,
              Math.sin(ang) * rad + Math.cos(frac * 4.0 + t) * 0.22 * frac
            )
          );
        }
        const curve = new THREE.CatmullRomCurve3(curvePts);
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.022, 5, false);
        jelly.add(new THREE.Mesh(tubeGeo, this.tentacleMat));
      }

      jelly.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      jelly.scale.setScalar(cfg.scale);
      jelly.userData = { ...cfg, basePos: new THREE.Vector3(...cfg.pos) };
      this.biolumGroup.add(jelly);
      this.jellies.push(jelly);
    });

    const planktonCount = 220;
    const moteGeo = new THREE.OctahedronGeometry(0.085, 1);
    this.planktonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x2dd4bf,
      emissiveIntensity: 1.25,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.planktonMesh = new THREE.InstancedMesh(moteGeo, this.planktonMat, planktonCount);
    this.planktonMesh.frustumCulled = false;

    this.planktonData = [];
    for (let i = 0; i < planktonCount; i++) {
      this.planktonData.push({
        x: (Math.random() - 0.5) * 24 - 1.0,
        y: (Math.random() - 0.5) * 16,
        z: -Math.random() * 18 + 2,
        scale: 0.55 + Math.random() * 0.95,
        speed: 0.18 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
      });
      this._tmpColor.setHSL(0.46 + Math.random() * 0.22, 0.85, 0.65);
      this.planktonMesh.setColorAt(i, this._tmpColor);
    }
    this.planktonMesh.instanceColor.needsUpdate = true;
    this.biolumGroup.add(this.planktonMesh);

    this.biolumGroup.visible = false;
    this.scene.add(this.biolumGroup);
  }

  // 3D WORLD 3: Supernova & Relativistic Accretion Vortex
  _initSupernovaVortex() {
    this.vortexGroup = new THREE.Group();

    const count = 1900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cInner = new THREE.Color('#fff5e6');
    const cMid = new THREE.Color('#38bdf8');
    const cOuter = new THREE.Color('#c084fc');

    for (let i = 0; i < count; i++) {
      const arm = i % 4;
      const radius = 0.8 + Math.pow(Math.random(), 1.35) * 9.5;
      const spin = radius * 0.85 + (arm * Math.PI * 2) / 4;
      const spread = (Math.random() - 0.5) * (0.28 + radius * 0.12);
      const ySpread = (Math.random() - 0.5) * (0.45 * Math.exp(-radius * 0.16) + 0.12);

      positions[i * 3] = Math.cos(spin) * radius + spread;
      positions[i * 3 + 1] = ySpread;
      positions[i * 3 + 2] = Math.sin(spin) * radius + spread;

      const t = THREE.MathUtils.clamp((radius - 0.8) / 9.5, 0, 1);
      if (t < 0.4) {
        this._tmpColor.copy(cInner).lerp(cMid, t / 0.4);
      } else {
        this._tmpColor.copy(cMid).lerp(cOuter, (t - 0.4) / 0.6);
      }
      colors[i * 3] = this._tmpColor.r;
      colors[i * 3 + 1] = this._tmpColor.g;
      colors[i * 3 + 2] = this._tmpColor.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.vortexPointsMat = new THREE.PointsMaterial({
      map: this.glowTex,
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.vortexPoints = new THREE.Points(pGeo, this.vortexPointsMat);
    this.vortexGroup.add(this.vortexPoints);

    this.vortexCoreMat = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uColorA: { value: new THREE.Color('#ffbe76') },
        uColorB: { value: new THREE.Color('#c084fc') },
        uOpacity: { value: 0 },
        uPower: { value: 1.8 },
      },
    });
    this.vortexCore = new THREE.Mesh(new THREE.SphereGeometry(1.15, 28, 22), this.vortexCoreMat);

    this.vortexRingMat = new THREE.MeshStandardMaterial({
      color: 0xffd39e,
      emissive: 0xf472b6,
      emissiveIntensity: 0.9,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.vortexRingA = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.055, 10, 72), this.vortexRingMat);
    this.vortexRingB = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.04, 10, 84), this.vortexRingMat);
    this.vortexRingB.rotation.x = Math.PI * 0.46;

    this.vortexGroup.add(this.vortexCore, this.vortexRingA, this.vortexRingB);
    this.vortexGroup.position.set(-1.6, 0.1, -4.5);
    this.vortexGroup.rotation.x = 0.55;
    this.vortexGroup.visible = false;
    this.scene.add(this.vortexGroup);
  }

  // 3D WORLD 4: Celestial Crystal Orrery
  _initCelestialOrrery() {
    this.orreryGroup = new THREE.Group();

    this.orreryRingMat = new THREE.ShaderMaterial({
      vertexShader: ETHEREAL_POLY_VERTEX_SHADER,
      fragmentShader: ETHEREAL_POLY_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: new THREE.Color('#fde68a') },
        uColorB: { value: new THREE.Color('#38bdf8') },
        uOpacity: { value: 0.0 },
      },
    });

    this.orreryRings = [];
    const ringRadii = [2.2, 3.35, 4.55, 5.75];
    for (let i = 0; i < ringRadii.length; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadii[i], 0.026 - i * 0.002, 8, 96),
        this.orreryRingMat
      );
      ring.rotation.x = i * 0.72;
      ring.rotation.y = i * 0.55;
      this.orreryGroup.add(ring);
      this.orreryRings.push(ring);
    }

    this.orreryStarMatA = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uColorA: { value: new THREE.Color('#fff5e6') },
        uColorB: { value: new THREE.Color('#ffd39e') },
        uOpacity: { value: 0.0 },
        uPower: { value: 1.6 },
      },
    });
    this.orreryStarMatB = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uColorA: { value: new THREE.Color('#67e8f9') },
        uColorB: { value: new THREE.Color('#a78bfa') },
        uOpacity: { value: 0.0 },
        uPower: { value: 1.8 },
      },
    });
    this.orreryStarA = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), this.orreryStarMatA);
    this.orreryStarB = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), this.orreryStarMatB);
    this.orreryGroup.add(this.orreryStarA, this.orreryStarB);

    this.orreryShardMat = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uColorA: { value: new THREE.Color('#f5d0fe') },
        uColorB: { value: new THREE.Color('#7dd3fc') },
        uOpacity: { value: 0.0 },
        uPower: { value: 2.0 },
      },
    });
    const shardGeo = new THREE.OctahedronGeometry(0.32, 0);
    this.orreryShards = [];
    for (let i = 0; i < 18; i++) {
      const shard = new THREE.Mesh(shardGeo, this.orreryShardMat);
      shard.scale.set(0.65, 1.75 + (i % 3) * 0.45, 0.65);
      shard.userData = {
        orbitRadius: 2.3 + (i % 5) * 0.92,
        orbitSpeed: (0.07 + (i % 4) * 0.03) * (i % 2 === 0 ? 1 : -1),
        inclination: (Math.random() - 0.5) * 1.15,
        phase: (i / 18) * Math.PI * 2,
      };
      this.orreryGroup.add(shard);
      this.orreryShards.push(shard);
    }

    this.orreryGroup.position.set(-1.8, 0.2, -5.0);
    this.orreryGroup.visible = false;
    this.scene.add(this.orreryGroup);
  }

  // 3D WORLD 6: Psychedelic Bioluminescent Mushroom Grove
  _initMushroomGrove() {
    this.mushroomGroup = new THREE.Group();
    this.mushrooms = [];

    // Sculpted graceful parasol mushroom cap profile
    const capPts = [
      new THREE.Vector2(0.01, 0.88),
      new THREE.Vector2(0.42, 0.82),
      new THREE.Vector2(0.95, 0.56),
      new THREE.Vector2(1.42, 0.16),
      new THREE.Vector2(1.56, -0.06),
      new THREE.Vector2(1.18, -0.02),
      new THREE.Vector2(0.45, 0.14),
      new THREE.Vector2(0.16, 0.04),
    ];
    const capGeo = new THREE.LatheGeometry(capPts, 32);

    this.mushroomCapMat = new THREE.ShaderMaterial({
      vertexShader: MUSHROOM_CAP_VERTEX_SHADER,
      fragmentShader: MUSHROOM_CAP_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color('#c084fc') },
        uColorB: { value: new THREE.Color('#2dd4bf') },
        uColorC: { value: new THREE.Color('#fde047') },
        uOpacity: { value: 0.0 },
      },
    });

    this.mushroomStemMat = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX_SHADER,
      fragmentShader: FRESNEL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0.0 },
        uColorA: { value: new THREE.Color('#86efac') },
        uColorB: { value: new THREE.Color('#f5d0fe') },
        uOpacity: { value: 0.0 },
        uPower: { value: 1.85 },
      },
    });

    const configs = [
      { pos: [-3.4, -3.2, -3.5], scale: 1.35, tilt: 0.14, phase: 0.0, bend: 0.55 },
      { pos: [-0.2, -3.8, -5.8], scale: 1.05, tilt: -0.18, phase: 1.7, bend: -0.45 },
      { pos: [-6.0, -2.9, -6.5], scale: 0.92, tilt: 0.22, phase: 3.1, bend: 0.62 },
      { pos: [2.2, -4.1, -8.2], scale: 0.85, tilt: -0.12, phase: 4.5, bend: -0.38 },
      { pos: [-1.8, -4.4, -1.8], scale: 0.72, tilt: 0.16, phase: 2.4, bend: 0.32 },
    ];

    configs.forEach((cfg) => {
      const shroom = new THREE.Group();

      // Organic curving stem rising from base up into cap underside
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(cfg.bend * 0.45, 1.2, cfg.bend * 0.2),
        new THREE.Vector3(cfg.bend * 0.25, 2.5, -cfg.bend * 0.15),
        new THREE.Vector3(0, 3.6, 0),
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.14, 10, false);
      const stem = new THREE.Mesh(stemGeo, this.mushroomStemMat);

      const cap = new THREE.Mesh(capGeo, this.mushroomCapMat);
      cap.position.set(0, 3.52, 0);
      cap.rotation.z = cfg.tilt;

      shroom.add(stem, cap);
      shroom.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      shroom.scale.setScalar(cfg.scale);
      shroom.userData = { ...cfg, basePos: new THREE.Vector3(...cfg.pos) };
      this.mushroomGroup.add(shroom);
      this.mushrooms.push(shroom);
    });

    this.mushroomGroup.visible = false;
    this.scene.add(this.mushroomGroup);
  }

  // 3D WORLD 7: Swaying Weeping Willow Veil & Unfurling Fractal Fern Fronds
  _initWillowVeil() {
    this.willowGroup = new THREE.Group();
    this.willowStrands = [];
    this.fernFronds = [];

    // 1. 12 Cascading translucent weeping willow curtains hanging from above
    const curtainGeo = new THREE.PlaneGeometry(0.95, 12.5, 4, 22);
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: FLOW_RIBBON_VERTEX_SHADER,
        fragmentShader: FLOW_RIBBON_FRAGMENT_SHADER,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: i * 0.92 },
          uSwayAmp: { value: 0.78 + (i % 3) * 0.22 },
          uSpeed: { value: 0.36 + (i % 4) * 0.05 },
          uAnchorTop: { value: 1.0 },
          uVeinsFreq: { value: 22.0 },
          uColorA: { value: new THREE.Color('#34d399') },
          uColorB: { value: new THREE.Color('#fde68a') },
          uOpacity: { value: 0.0 },
        },
      });
      const strand = new THREE.Mesh(curtainGeo, mat);
      const xPos = -11.5 + i * 1.95 + (Math.random() - 0.5) * 0.65;
      const yPos = 3.2 + (i % 3) * 0.8;
      const zPos = -4.5 - (i % 4) * 2.8;
      strand.position.set(xPos, yPos, zPos);
      strand.rotation.y = (Math.random() - 0.5) * 0.5;
      strand.scale.set(0.65 + (i % 3) * 0.25, 0.85 + (i % 4) * 0.18, 1);
      this.willowGroup.add(strand);
      this.willowStrands.push({ mesh: strand, mat });
    }

    // 2. 4 Unfurling 3D Fibonacci Spiral Fern Fronds framing the lower-left foreground
    this.fernMat = new THREE.ShaderMaterial({
      vertexShader: ETHEREAL_POLY_VERTEX_SHADER,
      fragmentShader: ETHEREAL_POLY_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: new THREE.Color('#86efac') },
        uColorB: { value: new THREE.Color('#38bdf8') },
        uOpacity: { value: 0.0 },
      },
    });

    const frondConfigs = [
      { pos: [-6.8, -5.2, -3.0], rotZ: -0.35, scale: 1.15, phase: 0.0 },
      { pos: [-4.0, -5.8, -5.5], rotZ: -0.15, scale: 1.35, phase: 1.5 },
      { pos: [-8.5, -4.4, -7.0], rotZ: -0.55, scale: 1.0, phase: 3.1 },
      { pos: [0.5, -6.0, -7.8], rotZ: 0.22, scale: 1.1, phase: 4.4 },
    ];

    frondConfigs.forEach((cfg) => {
      const frondGroup = new THREE.Group();
      // Main curving fiddlehead fern spiral spine
      const pts = [];
      for (let k = 0; k <= 24; k++) {
        const u = k / 24;
        const spiralAngle = u * Math.PI * 2.65;
        const curlAmt = Math.pow(u, 2.2) * 1.45;
        const x = Math.sin(u * 1.4) * 1.6 + Math.cos(spiralAngle) * curlAmt * 0.45;
        const y = u * 5.6 + Math.sin(spiralAngle) * curlAmt * 0.42;
        const z = Math.sin(u * Math.PI) * 0.45;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const spineCurve = new THREE.CatmullRomCurve3(pts);
      const spineMesh = new THREE.Mesh(new THREE.TubeGeometry(spineCurve, 32, 0.045, 6, false), this.fernMat);
      frondGroup.add(spineMesh);

      // Pair of delicate branching fern pinnae along the spine
      for (let k = 3; k < 20; k += 2) {
        const u = k / 24;
        const pt = spineCurve.getPoint(u);
        const leafLen = (1.0 - u * 0.72) * 1.15;
        for (const side of [-1, 1]) {
          const pinnaCurve = new THREE.CatmullRomCurve3([
            pt,
            new THREE.Vector3(pt.x + side * leafLen * 0.55, pt.y + 0.22, pt.z + 0.1),
            new THREE.Vector3(pt.x + side * leafLen, pt.y + 0.38, pt.z - 0.08),
          ]);
          const pinnaMesh = new THREE.Mesh(new THREE.TubeGeometry(pinnaCurve, 8, 0.024, 5, false), this.fernMat);
          frondGroup.add(pinnaMesh);
        }
      }

      frondGroup.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      frondGroup.rotation.z = cfg.rotZ;
      frondGroup.scale.setScalar(cfg.scale);
      frondGroup.userData = { ...cfg };
      this.willowGroup.add(frondGroup);
      this.fernFronds.push(frondGroup);
    });

    this.willowGroup.visible = false;
    this.scene.add(this.willowGroup);
  }

  // 3D WORLD 8: Crystalline Icicle Sanctuary (hanging glass icicles + floating ice prism shards)
  _initIcicleSanctuary() {
    this.icicleGroup = new THREE.Group();
    this.icicles = [];
    this.icePrisms = [];

    this.iceCrystalMat = new THREE.ShaderMaterial({
      vertexShader: ICE_CRYSTAL_VERTEX_SHADER,
      fragmentShader: ICE_CRYSTAL_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color('#bae6fd') },
        uColorB: { value: new THREE.Color('#c4b5fd') },
        uOpacity: { value: 0.0 },
      },
    });

    // 1. 18 Hanging faceted icicle stalactites along the upper frozen canopy
    const icicleGeo = new THREE.ConeGeometry(0.28, 3.6, 6, 1, false);
    for (let i = 0; i < 18; i++) {
      const icicle = new THREE.Mesh(icicleGeo, this.iceCrystalMat);
      icicle.rotation.x = Math.PI; // Point downward
      const lenScale = 0.55 + Math.random() * 1.25;
      const radScale = 0.45 + Math.random() * 0.75;
      icicle.scale.set(radScale, lenScale, radScale);
      const x = -11.5 + i * 1.32 + (Math.random() - 0.5) * 0.5;
      const y = 6.2 - lenScale * 0.9 + (Math.random() - 0.5) * 0.8;
      const z = -2.5 - (i % 4) * 2.6;
      icicle.position.set(x, y, z);
      icicle.userData = { baseY: y, phase: i * 0.85 };
      this.icicleGroup.add(icicle);
      this.icicles.push(icicle);
    }

    // 2. 14 Slowly rotating floating faceted crystal ice prisms drifting in & out of depth
    const prismGeo = new THREE.CylinderGeometry(0.02, 0.36, 1.45, 6);
    for (let i = 0; i < 14; i++) {
      const prism = new THREE.Group();
      const top = new THREE.Mesh(prismGeo, this.iceCrystalMat);
      top.position.y = 0.72;
      const bot = new THREE.Mesh(prismGeo, this.iceCrystalMat);
      bot.rotation.x = Math.PI;
      bot.position.y = -0.72;
      prism.add(top, bot);

      const basePos = new THREE.Vector3(
        -8.5 + (i % 7) * 2.3 + (Math.random() - 0.5) * 1.2,
        -2.8 + Math.random() * 5.2,
        -3.5 - Math.random() * 11
      );
      prism.position.copy(basePos);
      prism.scale.setScalar(0.45 + Math.random() * 0.65);
      prism.userData = {
        basePos,
        spinX: (Math.random() - 0.5) * 0.18,
        spinY: (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2,
      };
      this.icicleGroup.add(prism);
      this.icePrisms.push(prism);
    }

    this.icicleGroup.visible = false;
    this.scene.add(this.icicleGroup);
  }

  _emitTitle(force = false) {
    if (!this.onTitleChange) return;
    const pal = PALETTES[this.paletteIdxA];
    const activeStep = this.morphProgress > 0.55 ? this.stepB : this.stepA;
    const shaderMeta = SHADER_WORLDS[activeStep.shader];
    const world3dMeta = THREE_WORLDS[activeStep.world3d];
    const modeName = MODE_NAMES[this.modeNameIdx % MODE_NAMES.length];

    const noun = (this.stepCounter + this.modeNameIdx) % 2 === 0 ? shaderMeta.noun : world3dMeta.noun;
    const subtitle = `${pal.mood} ${noun}`;
    const key = `${modeName}|${subtitle}`;

    if (force || key !== this.lastTitleKey) {
      this.lastTitleKey = key;
      this.onTitleChange({ modeName, subtitle, paletteName: pal.name });
    }
  }

  getCurrentTitle() {
    const pal = PALETTES[this.paletteIdxA];
    const modeName = MODE_NAMES[this.modeNameIdx % MODE_NAMES.length];
    const noun = (this.stepCounter + this.modeNameIdx) % 2 === 0
      ? SHADER_WORLDS[this.stepA.shader].noun
      : THREE_WORLDS[this.stepA.world3d].noun;
    return { modeName, subtitle: `${pal.mood} ${noun}` };
  }

  nudgeNext() {
    this.nudgeBoost = 1.0;
  }

  start() {
    if (this.isRunning || this.isDisposed) return;
    this.isRunning = true;
    this.perfWarmupSec = 0;
    this.perfWindowSec = 0;
    this.perfWindowFrames = 0;
    this.clock.start();
    this._handleResize();
    this._tick();
  }

  pause() {
    this.isRunning = false;
    this.clock.stop();
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
      this.frameId = 0;
    }
  }

  _handleResize() {
    if (this.isDisposed) return;
    const w = window.innerWidth;
    const h = Math.max(window.innerHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.currentScale);
    this.renderer.setSize(w, h, false);
    this.backdropMat.uniforms.uResolution.value.set(w, h);
  }

  _afterDraw(cb) {
    const gl = this.renderer.getContext();
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (!this.isRunning || this.isDisposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  _update(rawDt) {
    // Silent automatic dynamic resolution & shader quality monitor
    this._monitorPerformance(rawDt);

    const safeDt = Math.min(rawDt, 0.12);
    this.elapsed += safeDt;
    this.warpClock += safeDt;
    this.shaderQuality = THREE.MathUtils.damp(this.shaderQuality, this.targetShaderQuality, 1.2, safeDt);

    let morphSpeed = 1.0 / MORPH_CYCLE_SEC;
    let palSpeed = 1.0 / PALETTE_CYCLE_SEC;
    if (this.nudgeBoost > 0.001) {
      morphSpeed = THREE.MathUtils.lerp(morphSpeed, 0.26, this.nudgeBoost);
      palSpeed = THREE.MathUtils.lerp(palSpeed, 0.18, this.nudgeBoost);
      this.nudgeBoost = THREE.MathUtils.damp(this.nudgeBoost, 0, 1.4, safeDt);
    }

    this.morphProgress += safeDt * morphSpeed;
    if (this.morphProgress >= 1.0) {
      this.morphProgress -= 1.0;
      this.stepCounter += 1;
      this.stepA = this.stepB;
      this.stepB = this._pickNextStep(this.stepA);
      this.modeNameIdx = (this.modeNameIdx + 1) % MODE_NAMES.length;
      this.nudgeBoost = 0;
      this._emitTitle(false);
    }

    this.paletteProgress += safeDt * palSpeed;
    if (this.paletteProgress >= 1.0) {
      this.paletteProgress -= 1.0;
      this.paletteIdxA = this.paletteIdxB;
      this.paletteIdxB = this._pickNextPalette(this.paletteIdxA);
      this._emitTitle(false);
    }

    const smoothMorph = THREE.MathUtils.smootherstep(this.morphProgress, 0.0, 1.0);
    const smoothPal = THREE.MathUtils.smootherstep(this.paletteProgress, 0.0, 1.0);

    // 1. Interpolate Cosine Color Palette vectors & 3D scene lights
    const pA = PALETTES[this.paletteIdxA];
    const pB = PALETTES[this.paletteIdxB];
    this._curPalA.lerpVectors(pA.a, pB.a, smoothPal);
    this._curPalB.lerpVectors(pA.b, pB.b, smoothPal);
    this._curPalC.lerpVectors(pA.c, pB.c, smoothPal);
    this._curPalD.lerpVectors(pA.d, pB.d, smoothPal);

    this._curKey.copy(pA.key).lerp(pB.key, smoothPal);
    this._curRim.copy(pA.rim).lerp(pB.rim, smoothPal);
    this._curAccent.copy(pA.accent).lerp(pB.accent, smoothPal);
    this._curFog.copy(pA.fog).lerp(pB.fog, smoothPal);

    this.scene.fog.color.copy(this._curFog);
    this.keyLight.color.copy(this._curKey);
    this.rimLight.color.copy(this._curRim);
    this.hemiLight.color.copy(this._curRim);

    // Compute smoothly damped weights across all 6 Atmospheric FX layers
    for (let i = 0; i < ATMOS_TYPES.length; i++) {
      const key = ATMOS_TYPES[i];
      let target = 0;
      if (this.stepA.atmos === key) target += 1.0 - smoothMorph;
      if (this.stepB.atmos === key) target += smoothMorph;
      this.atmosWeights[key] = THREE.MathUtils.damp(this.atmosWeights[key], target, 0.9, safeDt);
    }

    const wStars = this.atmosWeights.stars;
    const wUnderwater = this.atmosWeights.underwater;
    const wForest = this.atmosWeights.forest;
    const wSnow = this.atmosWeights.snow;
    const wRain = this.atmosWeights.rain;
    const wEmbers = this.atmosWeights.embers;

    // 2. Update Layer 1 GLSL Backdrop Uniforms
    const u = this.backdropMat.uniforms;
    u.uTime.value = this.elapsed;
    u.uSceneA.value = this.stepA.shader;
    u.uSceneB.value = this.stepB.shader;
    u.uMorph.value = smoothMorph;
    u.uTwist.value = THREE.MathUtils.lerp(this.stepA.twist, this.stepB.twist, smoothMorph);
    u.uKaleido.value = THREE.MathUtils.lerp(this.stepA.kaleido, this.stepB.kaleido, smoothMorph);
    u.uQuality.value = this.shaderQuality;
    u.uUnderwater.value = wUnderwater;
    u.uPalA.value.copy(this._curPalA);
    u.uPalB.value.copy(this._curPalB);
    u.uPalC.value.copy(this._curPalC);
    u.uPalD.value.copy(this._curPalD);

    // 3. Gentle meditative camera float
    const t = this.elapsed;
    this.camera.position.x = Math.sin(t * 0.052) * 0.95;
    this.camera.position.y = Math.cos(t * 0.041) * 0.65;
    this.camera.position.z = 11.8 + Math.sin(t * 0.029) * 0.9;
    this.camera.lookAt(-1.1, 0, -4.0);

    // 4A. ATMOS: Slow Time-Warp Starfield
    this.starGroup.visible = wStars > 0.015;
    if (this.starGroup.visible) {
      const warpCycle = (this.warpClock % 185.0) / 185.0;
      const surgeWindow = warpCycle > 0.62 && warpCycle < 0.86
        ? Math.sin(((warpCycle - 0.62) / 0.24) * Math.PI)
        : 0.0;
      const warpIntensity = Math.pow(surgeWindow, 1.35) * wStars;

      const forwardVel = THREE.MathUtils.lerp(1.35, 15.5, warpIntensity);
      const streakTailLen = THREE.MathUtils.lerp(0.08, 4.6, warpIntensity);
      const bankX = Math.sin(t * 0.08) * 0.65 * warpIntensity;
      const bankY = Math.cos(t * 0.065) * 0.45 * warpIntensity;

      const headArr = this.starHeadPosAttr.array;
      const streakArr = this.starStreakPosAttr.array;

      for (let i = 0; i < this.starCount; i++) {
        const s = this.starData[i];
        s.z += safeDt * forwardVel * s.speed;
        if (s.z > 13.5) {
          s.z -= 78.0;
          s.x = (Math.random() - 0.5) * 62;
          s.y = (Math.random() - 0.5) * 40;
          if (Math.hypot(s.x, s.y) < 2.2) s.x += (s.x >= 0 ? 2.5 : -2.5);
        }

        const px = s.x + bankX * (13.5 - s.z) * 0.03;
        const py = s.y + bankY * (13.5 - s.z) * 0.03;

        headArr[i * 3] = px;
        headArr[i * 3 + 1] = py;
        headArr[i * 3 + 2] = s.z;

        if (warpIntensity > 0.02) {
          const s6 = i * 6;
          streakArr[s6] = px;
          streakArr[s6 + 1] = py;
          streakArr[s6 + 2] = s.z;
          streakArr[s6 + 3] = px - bankX * 0.14;
          streakArr[s6 + 4] = py - bankY * 0.14;
          streakArr[s6 + 5] = s.z - streakTailLen * s.speed;
        }
      }

      this.starHeadPosAttr.needsUpdate = true;
      this.starMat.opacity = wStars * (0.58 + 0.22 * warpIntensity);
      this.starMat.color.copy(this._curKey).lerp(this._curRim, 0.5).lerp(this._whiteColor, 0.55);

      this.starStreaks.visible = warpIntensity > 0.02;
      if (this.starStreaks.visible) {
        this.starStreakPosAttr.needsUpdate = true;
        this.starStreakMat.opacity = warpIntensity * 0.62;
      }
      this.starGroup.rotation.z = t * 0.006 + Math.sin(t * 0.03) * 0.05 * warpIntensity;
    }

    // 4B. ATMOS: Underwater Bubbles & Swaying Ribbons
    this.underwaterGroup.visible = wUnderwater > 0.015;
    if (this.underwaterGroup.visible) {
      this.bubbleMat.uniforms.uOpacity.value = wUnderwater * 0.72;
      this.bubbleMat.uniforms.uColorA.value.copy(this._curRim);
      this.bubbleMat.uniforms.uColorB.value.copy(this._curKey);

      for (let i = 0; i < this.bubbleData.length; i++) {
        const b = this.bubbleData[i];
        const vent = this.bubbleVents[b.ventIdx];
        b.y += safeDt * b.riseSpeed;
        if (b.y > 11.5) {
          b.y = -11.5 - Math.random() * 2.5;
          b.offsetX = (Math.random() - 0.5) * 3.8;
          b.phase = Math.random() * Math.PI * 2;
        }
        const ventDrift = Math.sin(t * 0.08 + vent.phase) * 1.4;
        const swayX = Math.sin(t * b.wobbleFreq + b.phase + b.y * 0.35) * b.wobbleAmp;
        const swayZ = Math.cos(t * b.wobbleFreq * 0.8 + b.phase) * b.wobbleAmp * 0.5;
        const squish = b.isHero ? Math.sin(t * 2.2 + b.phase) * 0.14 : Math.sin(t * 1.5 + b.phase) * 0.05;

        this._dummy.position.set(vent.baseX + ventDrift + b.offsetX + swayX, b.y, vent.z + b.offsetZ + swayZ);
        this._dummy.rotation.set(0, 0, swayX * 0.25);
        this._dummy.scale.set(
          b.scale * (1.0 + squish),
          b.scale * (1.0 - squish * 0.85),
          b.scale * (1.0 + squish * 0.5)
        );
        this._dummy.updateMatrix();
        this.bubbleMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.bubbleMesh.instanceMatrix.needsUpdate = true;

      for (let i = 0; i < this.abyssRibbons.length; i++) {
        const r = this.abyssRibbons[i];
        r.mat.uniforms.uTime.value = t;
        r.mat.uniforms.uOpacity.value = wUnderwater * 0.16;
        r.mat.uniforms.uColorA.value.copy(this._curAccent);
        r.mat.uniforms.uColorB.value.copy(this._curRim);
      }
    }

    // 4C. ATMOS: Living Forest (Drifting Spores, Pulsing Fireflies & Floating Translucent Leaves/Petals)
    this.forestGroup.visible = wForest > 0.015;
    if (this.forestGroup.visible) {
      this.sporeMat.opacity = wForest * 0.82;
      this.sporeMat.color.copy(this._curKey).lerp(this._whiteColor, 0.35);

      for (let i = 0; i < this.sporeData.length; i++) {
        const sp = this.sporeData[i];
        sp.y += safeDt * sp.riseSpeed;
        sp.x += safeDt * sp.driftX;
        if (sp.y > 10.5) sp.y = -10.5;
        if (sp.x > 15.0) sp.x = -15.0;
        if (sp.x < -15.0) sp.x = 15.0;

        const curlX = Math.sin(t * 0.42 + sp.phase) * (sp.isFirefly ? 1.15 : 0.65);
        const curlY = Math.cos(t * 0.36 + sp.phase) * (sp.isFirefly ? 0.65 : 0.25);
        // Organic firefly glow-pulse vs gentle spore shimmer
        const blink = sp.isFirefly
          ? Math.pow(0.5 + 0.5 * Math.sin(t * sp.blinkRate + sp.phase), 2.5)
          : (0.65 + 0.35 * Math.sin(t * sp.blinkRate + sp.phase));

        this._dummy.position.set(sp.x + curlX, sp.y + curlY, sp.z);
        this._dummy.rotation.set(t * 0.3 + sp.phase, t * 0.2, 0);
        this._dummy.scale.setScalar(sp.scale * (0.25 + 0.95 * blink));
        this._dummy.updateMatrix();
        this.sporeMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.sporeMesh.instanceMatrix.needsUpdate = true;

      this.leafMat.uniforms.uOpacity.value = wForest * 0.68;
      this.leafMat.uniforms.uColorA.value.copy(this._curAccent);
      this.leafMat.uniforms.uColorB.value.copy(this._curKey);

      for (let i = 0; i < this.leafData.length; i++) {
        const lf = this.leafData[i];
        lf.y -= safeDt * lf.fallSpeed;
        lf.x += safeDt * lf.glideX;
        if (lf.y < -11.5) {
          lf.y = 11.5 + Math.random() * 2.0;
          lf.x = -16 + Math.random() * 26;
        }
        if (lf.x > 16.5) lf.x = -16.5;

        const flutterX = Math.sin(t * 0.85 + lf.phase) * 0.85;
        const flutterZ = Math.cos(t * 0.65 + lf.phase) * 0.65;
        this._dummy.position.set(lf.x + flutterX, lf.y, lf.z + flutterZ);
        this._dummy.rotation.set(
          t * lf.tumbleSpeedX + lf.phase,
          t * lf.tumbleSpeedY + lf.phase * 0.7,
          t * lf.tumbleSpeedZ + Math.sin(t * 0.9 + lf.phase) * 0.6
        );
        this._dummy.scale.set(lf.scaleX, lf.scaleY, 1.0);
        this._dummy.updateMatrix();
        this.leafMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.leafMesh.instanceMatrix.needsUpdate = true;
    }

    // 4D. ATMOS: Drifting Snowfall & Frost Motes
    this.snowGroup.visible = wSnow > 0.015;
    if (this.snowGroup.visible) {
      this.snowMat.opacity = wSnow * 0.74;
      this.snowMat.color.copy(this._iceTint).lerp(this._curRim, 0.25);

      const windGust = Math.sin(t * 0.14) * 0.55;
      for (let i = 0; i < this.snowData.length; i++) {
        const fl = this.snowData[i];
        fl.y -= safeDt * fl.fallSpeed;
        fl.x += safeDt * windGust;
        if (fl.y < -11.5) {
          fl.y = 11.5;
          fl.x = (Math.random() - 0.5) * 30;
        }
        if (fl.x > 16.5) fl.x = -16.5;
        if (fl.x < -16.5) fl.x = 16.5;

        const swayX = Math.sin(t * fl.swayFreq + fl.phase) * fl.swayAmp;
        const swayZ = Math.cos(t * fl.swayFreq * 0.75 + fl.phase) * 0.45;
        this._dummy.position.set(fl.x + swayX, fl.y, fl.z + swayZ);
        this._dummy.rotation.set(t * 0.5 + fl.phase, t * 0.35, t * 0.2);
        this._dummy.scale.setScalar(fl.scale * (0.75 + 0.25 * Math.sin(t * 1.4 + fl.phase)));
        this._dummy.updateMatrix();
        this.snowMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.snowMesh.instanceMatrix.needsUpdate = true;
    }

    // 4E. ATMOS: Luminous Diagonal Rain Shower
    this.rainGroup.visible = wRain > 0.015;
    if (this.rainGroup.visible) {
      this.rainMat.opacity = wRain * 0.40;
      this.rainMat.color.copy(this._curRim).lerp(this._whiteColor, 0.55);

      const rainArr = this.rainPosAttr.array;
      const slant = 0.20 + Math.sin(t * 0.12) * 0.06;
      for (let i = 0; i < this.rainCount; i++) {
        const r = this.rainData[i];
        r.y -= safeDt * r.speed;
        r.x -= safeDt * r.speed * slant;
        if (r.y < -12.0) {
          r.y = 12.0 + Math.random() * 3.0;
          r.x = (Math.random() - 0.5) * 34 + 2.0;
        }
        const s6 = i * 6;
        rainArr[s6] = r.x;
        rainArr[s6 + 1] = r.y;
        rainArr[s6 + 2] = r.z;
        rainArr[s6 + 3] = r.x + r.len * slant;
        rainArr[s6 + 4] = r.y + r.len;
        rainArr[s6 + 5] = r.z;
      }
      this.rainPosAttr.needsUpdate = true;
    }

    // 4F. ATMOS: Rising Fire Wisps & Embers
    this.emberGroup.visible = wEmbers > 0.015;
    if (this.emberGroup.visible) {
      this.emberMat.opacity = wEmbers * 0.85;
      this.emberMat.color.copy(this._curKey).lerp(this._warmEmberA, 0.45);

      for (let i = 0; i < this.emberData.length; i++) {
        const em = this.emberData[i];
        em.y += safeDt * em.riseSpeed;
        if (em.y > 11.5) {
          em.y = -11.5 - Math.random() * 2.0;
          em.x = (Math.random() - 0.5) * 28 - 1.0;
        }
        const swirlX = Math.sin(t * em.swirlFreq + em.phase + em.y * 0.25) * em.swirlRadius;
        const swirlZ = Math.cos(t * em.swirlFreq * 0.85 + em.phase) * em.swirlRadius * 0.6;
        const flicker = 0.55 + 0.45 * Math.sin(t * 3.2 + em.phase);

        this._dummy.position.set(em.x + swirlX, em.y, em.z + swirlZ);
        this._dummy.rotation.set(t * 0.8 + em.phase, t * 0.6, 0);
        this._dummy.scale.setScalar(em.scale * flicker);
        this._dummy.updateMatrix();
        this.emberMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.emberMesh.instanceMatrix.needsUpdate = true;

      for (let i = 0; i < this.fireWisps.length; i++) {
        const w = this.fireWisps[i];
        w.mat.uniforms.uTime.value = t;
        w.mat.uniforms.uOpacity.value = wEmbers * 0.15;
        w.mat.uniforms.uColorA.value.copy(this._curAccent).lerp(this._warmEmberB, 0.35);
        w.mat.uniforms.uColorB.value.copy(this._curKey).lerp(this._warmEmberA, 0.35);
      }
    }

    // 5. Compute smooth 3D Layer weights (0..8; world 5 = Open Vista)
    for (let i = 0; i < THREE_WORLDS.length; i++) {
      let target = 0;
      if (this.stepA.world3d === i) target += 1.0 - smoothMorph;
      if (this.stepB.world3d === i) target += smoothMorph;
      this.worldWeights[i] = THREE.MathUtils.clamp(target, 0, 1);
    }

    const sideBias = THREE.MathUtils.lerp(this.stepA.sideBias, this.stepB.sideBias, smoothMorph);

    // World 0: Sacred Geometry Tunnel
    const wTunnel = this.worldWeights[0];
    this.tunnelGroup.visible = wTunnel > 0.008;
    if (this.tunnelGroup.visible) {
      this.tunnelOuterMat.uniforms.uOpacity.value = wTunnel * 0.26;
      this.tunnelOuterMat.uniforms.uColorA.value.copy(this._curKey);
      this.tunnelOuterMat.uniforms.uColorB.value.copy(this._curRim);

      this.tunnelInnerMat.uniforms.uOpacity.value = wTunnel * 0.20;
      this.tunnelInnerMat.uniforms.uColorA.value.copy(this._curAccent);
      this.tunnelInnerMat.uniforms.uColorB.value.copy(this._curKey);

      this.tunnelLineMat.uniforms.uOpacity.value = wTunnel * 0.13;
      this.tunnelLineMat.uniforms.uColor.value.copy(this._curRim);

      const farCenterX = -1.8 + Math.sin(t * 0.037) * 4.8 + Math.cos(t * 0.017) * 1.9;
      const farCenterY = Math.cos(t * 0.031) * 3.2 + Math.sin(t * 0.019) * 1.3;
      const nearCenterX = -1.4 + Math.sin(t * 0.029 + 1.4) * 2.4;
      const nearCenterY = Math.cos(t * 0.023 + 0.9) * 1.7;

      const flowSpeed = 1.45;
      const archCount = this.tunnelArchetypes.length;
      const rollingFamily = Math.floor(t * 0.032) % archCount;

      for (let i = 0; i < this.tunnelRings.length; i++) {
        const ring = this.tunnelRings[i];
        const ud = ring.userData;
        ring.position.z += safeDt * flowSpeed;

        if (ring.position.z > 10.5) {
          ring.position.z -= this.tunnelSpan;
          const nextArchIdx = (rollingFamily + (i % 3)) % archCount;
          const arch = this.tunnelArchetypes[nextArchIdx];
          ud.outerMesh.geometry = arch.outer;
          ud.innerMesh.geometry = arch.inner;
          ud.innerMesh.rotation.z = arch.innerRot;
          ud.latticeMesh.geometry = arch.filigree;
          ud.eccentricPhase += 0.73;
        }

        const zFactor = THREE.MathUtils.clamp((ring.position.z + 55.5) / this.tunnelSpan, 0, 1);
        const curveT = THREE.MathUtils.smoothstep(zFactor, 0.0, 1.0);

        const spineX = THREE.MathUtils.lerp(farCenterX, nearCenterX, curveT) +
          Math.sin(ring.position.z * 0.065 + t * 0.095) * 1.55;
        const spineY = THREE.MathUtils.lerp(farCenterY, nearCenterY, curveT) +
          Math.cos(ring.position.z * 0.058 + t * 0.082) * 1.15;

        const orbX = Math.cos(t * 0.05 + ud.eccentricPhase) * ud.eccentricRadius;
        const orbY = Math.sin(t * 0.044 + ud.eccentricPhase) * ud.eccentricRadius * 0.75;

        ring.position.x = spineX + orbX;
        ring.position.y = spineY + orbY;

        ring.rotation.z = ud.baseRot + t * ud.spinSpeed * ud.spinDir;
        ring.rotation.x = Math.sin(t * 0.07 + ud.eccentricPhase) * ud.tiltAmp;
        ring.rotation.y = Math.cos(t * 0.06 + ud.eccentricPhase) * ud.tiltAmp;

        const breathScale = 0.78 + 0.42 * Math.sin(zFactor * Math.PI);
        ring.scale.setScalar(breathScale);
      }
    }

    // World 1: Procedural Ringed Exoplanet (grand fly-by depth arc)
    const wPlanet = this.worldWeights[1];
    this.planetGroup.visible = wPlanet > 0.008;
    if (this.planetGroup.visible) {
      const flyWave = 0.5 - 0.5 * Math.cos(t * 0.058);
      const planetZ = THREE.MathUtils.lerp(-16.5, 2.4, flyWave * wPlanet);
      const planetX = sideBias + Math.sin(t * 0.041) * 2.2 - flyWave * 0.7;
      const planetY = Math.cos(t * 0.036) * 1.35;

      this.planetCoreMat.uniforms.uTime.value = t;
      this.planetCoreMat.uniforms.uOpacity.value = wPlanet * 0.92;
      this.planetCoreMat.uniforms.uKeyColor.value.copy(this._curKey);
      this.planetCoreMat.uniforms.uRimColor.value.copy(this._curRim);
      this.planetCoreMat.uniforms.uAccentColor.value.copy(this._curAccent);

      this.planetAtmoMat.uniforms.uOpacity.value = wPlanet * 0.72;
      this.planetAtmoMat.uniforms.uColorA.value.copy(this._curRim);
      this.planetAtmoMat.uniforms.uColorB.value.copy(this._curKey);

      this.planetRingMat.uniforms.uTime.value = t;
      this.planetRingMat.uniforms.uOpacity.value = wPlanet * 0.9;
      this.planetRingMat.uniforms.uKeyColor.value.copy(this._curKey);
      this.planetRingMat.uniforms.uRimColor.value.copy(this._curRim);

      this.moonMatA.opacity = wPlanet * 0.9;
      this.moonMatA.emissive.copy(this._curRim);
      this.moonMatB.opacity = wPlanet * 0.9;
      this.moonMatB.emissive.copy(this._curKey);

      this.planetSphere.rotation.y = t * 0.055;
      this.planetRing.rotation.z = t * 0.03;
      this.planetGroup.position.set(planetX, planetY, planetZ);
      this.planetGroup.scale.setScalar(0.68 + 0.34 * wPlanet);

      this.moonA.position.set(Math.cos(t * 0.16) * 4.9, Math.sin(t * 0.16) * 1.25, Math.sin(t * 0.16) * 3.8);
      this.moonB.position.set(Math.cos(-t * 0.24 + 2.0) * 3.8, Math.sin(-t * 0.24 + 2.0) * 1.6, Math.sin(-t * 0.24 + 2.0) * 3.1);
    }

    // World 2: Underwater Bioluminescence Reef
    const wBio = this.worldWeights[2];
    this.biolumGroup.visible = wBio > 0.008;
    if (this.biolumGroup.visible) {
      this.jellyBellMat.uniforms.uTime.value = t;
      this.jellyBellMat.uniforms.uOpacity.value = wBio * 0.85;
      this.jellyBellMat.uniforms.uColorA.value.copy(this._curRim);
      this.jellyBellMat.uniforms.uColorB.value.copy(this._curKey);

      this.jellyCoreMat.opacity = wBio * 0.72;
      this.jellyCoreMat.emissive.copy(this._curKey);
      this.tentacleMat.opacity = wBio * 0.42;
      this.tentacleMat.color.copy(this._curRim).lerp(this._curKey, 0.35);

      for (let i = 0; i < this.jellies.length; i++) {
        const j = this.jellies[i];
        const ud = j.userData;
        const driftY = Math.sin(t * ud.speed + ud.phase) * 1.85;
        const driftX = Math.cos(t * ud.speed * 0.7 + ud.phase) * 1.35;
        const driftZ = Math.sin(t * 0.068 + ud.phase) * 4.6;
        j.position.set(ud.basePos.x + driftX, ud.basePos.y + driftY, ud.basePos.z + driftZ);
        j.rotation.z = Math.sin(t * 0.25 + ud.phase) * 0.20;
        j.rotation.y = t * 0.08 + ud.phase;
      }

      this.planktonMat.opacity = wBio * 0.78;
      this.planktonMat.emissive.copy(this._curRim).lerp(this._curKey, 0.4);
      for (let i = 0; i < this.planktonData.length; i++) {
        const p = this.planktonData[i];
        p.y += safeDt * p.speed;
        if (p.y > 8.5) p.y = -8.5;
        const swayX = Math.sin(t * 0.35 + p.phase) * 0.45;
        const swayZ = Math.cos(t * 0.28 + p.phase) * 0.35;
        const pulseScale = p.scale * (0.75 + 0.35 * Math.sin(t * 1.1 + p.phase));
        this._dummy.position.set(p.x + swayX, p.y, p.z + swayZ);
        this._dummy.rotation.set(t * 0.2 + p.phase, t * 0.15, 0);
        this._dummy.scale.setScalar(pulseScale);
        this._dummy.updateMatrix();
        this.planktonMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.planktonMesh.instanceMatrix.needsUpdate = true;
    }

    // World 3: Supernova & Relativistic Accretion Vortex
    const wVortex = this.worldWeights[3];
    this.vortexGroup.visible = wVortex > 0.008;
    if (this.vortexGroup.visible) {
      const vortexDepthWave = 0.5 - 0.5 * Math.cos(t * 0.052 + 1.1);
      const vortexZ = THREE.MathUtils.lerp(-15.0, 1.6, vortexDepthWave * wVortex);
      const vortexX = sideBias + Math.sin(t * 0.038 + 0.7) * 2.0;
      const vortexY = Math.cos(t * 0.032) * 1.25;

      this.vortexPointsMat.opacity = wVortex * 0.85;
      this.vortexPoints.rotation.y = t * 0.065;

      this.vortexCoreMat.uniforms.uOpacity.value = wVortex * 0.88;
      this.vortexCoreMat.uniforms.uColorA.value.copy(this._curKey);
      this.vortexCoreMat.uniforms.uColorB.value.copy(this._curAccent);

      this.vortexRingMat.opacity = wVortex * 0.65;
      this.vortexRingMat.color.copy(this._curKey);
      this.vortexRingMat.emissive.copy(this._curRim);

      this.vortexRingA.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.14) * 0.32;
      this.vortexRingA.rotation.y = t * 0.11;
      this.vortexRingB.rotation.y = -t * 0.085;
      this.vortexRingB.rotation.z = Math.cos(t * 0.12) * 0.28;
      this.vortexGroup.position.set(vortexX, vortexY, vortexZ);
      this.vortexGroup.rotation.z = Math.sin(t * 0.04) * 0.24;
      this.vortexGroup.scale.setScalar(0.76 + 0.28 * wVortex);
    }

    // World 4: Celestial Crystal Orrery
    const wOrrery = this.worldWeights[4];
    this.orreryGroup.visible = wOrrery > 0.008;
    if (this.orreryGroup.visible) {
      const orreryDepthWave = 0.5 - 0.5 * Math.cos(t * 0.055 + 2.3);
      const orreryZ = THREE.MathUtils.lerp(-16.0, 2.2, orreryDepthWave * wOrrery);
      const orreryX = sideBias + Math.cos(t * 0.039) * 2.1;
      const orreryY = Math.sin(t * 0.034) * 1.3;

      this.orreryRingMat.uniforms.uOpacity.value = wOrrery * 0.42;
      this.orreryRingMat.uniforms.uColorA.value.copy(this._curKey);
      this.orreryRingMat.uniforms.uColorB.value.copy(this._curRim);

      this.orreryStarMatA.uniforms.uOpacity.value = wOrrery * 0.88;
      this.orreryStarMatA.uniforms.uColorA.value.copy(this._curKey);
      this.orreryStarMatA.uniforms.uColorB.value.copy(this._curAccent);

      this.orreryStarMatB.uniforms.uOpacity.value = wOrrery * 0.84;
      this.orreryStarMatB.uniforms.uColorA.value.copy(this._curRim);
      this.orreryStarMatB.uniforms.uColorB.value.copy(this._curKey);

      this.orreryShardMat.uniforms.uOpacity.value = wOrrery * 0.58;
      this.orreryShardMat.uniforms.uColorA.value.copy(this._curRim);
      this.orreryShardMat.uniforms.uColorB.value.copy(this._curAccent);

      for (let i = 0; i < this.orreryRings.length; i++) {
        const ring = this.orreryRings[i];
        const dir = i % 2 === 0 ? 1 : -1;
        ring.rotation.x += safeDt * (0.04 + i * 0.014) * dir;
        ring.rotation.y += safeDt * (0.055 - i * 0.008) * -dir;
      }

      this.orreryStarA.position.set(Math.cos(t * 0.28) * 0.85, Math.sin(t * 0.22) * 0.35, Math.sin(t * 0.28) * 0.85);
      this.orreryStarB.position.set(-Math.cos(t * 0.28) * 1.15, -Math.sin(t * 0.22) * 0.45, -Math.sin(t * 0.28) * 1.15);

      for (let i = 0; i < this.orreryShards.length; i++) {
        const sh = this.orreryShards[i];
        const ud = sh.userData;
        const ang = t * ud.orbitSpeed + ud.phase;
        const r = ud.orbitRadius;
        sh.position.set(
          Math.cos(ang) * r,
          Math.sin(ang) * r * Math.sin(ud.inclination),
          Math.sin(ang) * r * Math.cos(ud.inclination)
        );
        sh.rotation.y = -ang;
        sh.rotation.z = Math.sin(t * 0.3 + ud.phase) * 0.45;
      }

      this.orreryGroup.position.set(orreryX, orreryY, orreryZ);
      this.orreryGroup.scale.setScalar(0.75 + 0.28 * wOrrery);
    }

    // World 6: Psychedelic Bioluminescent Mushroom Grove
    const wMush = this.worldWeights[6];
    this.mushroomGroup.visible = wMush > 0.008;
    if (this.mushroomGroup.visible) {
      this.mushroomCapMat.uniforms.uTime.value = t;
      this.mushroomCapMat.uniforms.uOpacity.value = wMush * 0.82;
      this.mushroomCapMat.uniforms.uColorA.value.copy(this._curRim);
      this.mushroomCapMat.uniforms.uColorB.value.copy(this._curKey);
      this.mushroomCapMat.uniforms.uColorC.value.copy(this._curAccent);

      this.mushroomStemMat.uniforms.uOpacity.value = wMush * 0.56;
      this.mushroomStemMat.uniforms.uColorA.value.copy(this._curAccent);
      this.mushroomStemMat.uniforms.uColorB.value.copy(this._curRim);

      // Gentle forest floor breathing & depth glide
      const groveZ = Math.sin(t * 0.048) * 3.8;
      for (let i = 0; i < this.mushrooms.length; i++) {
        const sh = this.mushrooms[i];
        const ud = sh.userData;
        sh.position.set(
          ud.basePos.x + Math.sin(t * 0.09 + ud.phase) * 0.35,
          ud.basePos.y + Math.sin(t * 0.18 + ud.phase) * 0.25,
          ud.basePos.z + groveZ + Math.cos(t * 0.06 + ud.phase) * 1.4
        );
        sh.rotation.z = Math.sin(t * 0.22 + ud.phase) * 0.07;
        sh.rotation.y = Math.sin(t * 0.12 + ud.phase) * 0.22;
      }
    }

    // World 7: Swaying Weeping Willow Veil & Unfurling Fractal Fern Fronds
    const wWillow = this.worldWeights[7];
    this.willowGroup.visible = wWillow > 0.008;
    if (this.willowGroup.visible) {
      for (let i = 0; i < this.willowStrands.length; i++) {
        const st = this.willowStrands[i];
        st.mat.uniforms.uTime.value = t;
        st.mat.uniforms.uOpacity.value = wWillow * 0.26;
        st.mat.uniforms.uColorA.value.copy(this._curAccent);
        st.mat.uniforms.uColorB.value.copy(this._curKey);
      }

      this.fernMat.uniforms.uOpacity.value = wWillow * 0.42;
      this.fernMat.uniforms.uColorA.value.copy(this._curAccent);
      this.fernMat.uniforms.uColorB.value.copy(this._curKey);

      for (let i = 0; i < this.fernFronds.length; i++) {
        const fr = this.fernFronds[i];
        const ud = fr.userData;
        fr.rotation.z = ud.rotZ + Math.sin(t * 0.28 + ud.phase) * 0.11;
        fr.rotation.y = Math.cos(t * 0.18 + ud.phase) * 0.18;
        const unfurl = ud.scale * (0.90 + 0.12 * Math.sin(t * 0.16 + ud.phase));
        fr.scale.setScalar(unfurl);
      }
    }

    // World 8: Crystalline Icicle Sanctuary
    const wIce = this.worldWeights[8];
    this.icicleGroup.visible = wIce > 0.008;
    if (this.icicleGroup.visible) {
      this.iceCrystalMat.uniforms.uTime.value = t;
      this.iceCrystalMat.uniforms.uOpacity.value = wIce * 0.62;
      this.iceCrystalMat.uniforms.uColorA.value.copy(this._iceTint).lerp(this._curRim, 0.35);
      this.iceCrystalMat.uniforms.uColorB.value.copy(this._curKey).lerp(this._curRim, 0.55);

      for (let i = 0; i < this.icicles.length; i++) {
        const ic = this.icicles[i];
        ic.position.y = ic.userData.baseY + Math.sin(t * 0.22 + ic.userData.phase) * 0.16;
        ic.rotation.y = t * 0.05 + ic.userData.phase;
      }

      for (let i = 0; i < this.icePrisms.length; i++) {
        const pr = this.icePrisms[i];
        const ud = pr.userData;
        const depthSweep = Math.sin(t * 0.055 + ud.phase) * 3.6;
        pr.position.set(
          ud.basePos.x + Math.sin(t * 0.14 + ud.phase) * 0.75,
          ud.basePos.y + Math.cos(t * 0.18 + ud.phase) * 0.65,
          ud.basePos.z + depthSweep
        );
        pr.rotation.x += safeDt * ud.spinX;
        pr.rotation.y += safeDt * ud.spinY;
      }
    }
  }

  _tick = () => {
    if (!this.isRunning || this.isDisposed) return;
    const dt = this.clock.getDelta();
    this._update(dt);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this._afterDraw(this._tick);
    } else {
      this.frameId = requestAnimationFrame(this._tick);
    }
  };

  dispose() {
    this.pause();
    this.isDisposed = true;
    window.removeEventListener('resize', this._onResize);

    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    if (Array.isArray(this.tunnelArchetypes)) {
      for (let i = 0; i < this.tunnelArchetypes.length; i++) {
        const arch = this.tunnelArchetypes[i];
        if (arch.outer) arch.outer.dispose();
        if (arch.inner) arch.inner.dispose();
        if (arch.filigree) arch.filigree.dispose();
      }
      this.tunnelArchetypes.length = 0;
    }

    if (this.glowTex) this.glowTex.dispose();
    if (this.envRT) this.envRT.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
