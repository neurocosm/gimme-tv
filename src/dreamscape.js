/**
 * Gimme TV — Three.js Multi-Layer Generative Dreamscape Engine
 * Combines full-screen morphing GLSL shader worlds (Julia Fractals, Sacred Kaleidoscopes,
 * Luminous Stained Glass, Cosmic Nebulae/Supernovas, Underwater Caustics) with true 3D
 * translucent Three.js worlds (Sacred Geometry Tunnels, Procedural Ringed Exoplanets,
 * Underwater Bioluminescence, Supernova Accretion Vortex) driven by rotating Cosine Palettes.
 *
 * Meditative lava-lamp pacing (~2.5 minutes per full morph, ~4.5 minutes per palette rotation).
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Rotating poetic mode names requested by user
const MODE_NAMES = ['AETHER', 'LUCID', 'PRISM', 'REVERIE', 'DRIFT'];

// 6 Curated Rotating Cosine Color Palettes: color(t) = a + b * cos(2π(c * t + d))
const PALETTES = [
  {
    name: 'James Webb',
    mood: 'Astral',
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
    name: 'Bioluminescent Abyss',
    mood: 'Abyssal',
    a: new THREE.Vector3(0.06, 0.22, 0.32),
    b: new THREE.Vector3(0.24, 0.44, 0.48),
    c: new THREE.Vector3(0.9, 1.0, 0.95),
    d: new THREE.Vector3(0.48, 0.14, 0.24),
    key: new THREE.Color('#4fffe0'),
    rim: new THREE.Color('#7c6cff'),
    accent: new THREE.Color('#14b8a6'),
    fog: new THREE.Color('#030d18'),
  },
  {
    name: 'Cathedral Amethyst',
    mood: 'Velvet',
    a: new THREE.Vector3(0.24, 0.12, 0.28),
    b: new THREE.Vector3(0.44, 0.32, 0.42),
    c: new THREE.Vector3(1.0, 0.85, 1.0),
    d: new THREE.Vector3(0.86, 0.18, 0.42),
    key: new THREE.Color('#f7b2d9'),
    rim: new THREE.Color('#c084fc'),
    accent: new THREE.Color('#f59e0b'),
    fog: new THREE.Color('#0f0618'),
  },
  {
    name: 'Molten Corona',
    mood: 'Solar',
    a: new THREE.Vector3(0.28, 0.12, 0.10),
    b: new THREE.Vector3(0.50, 0.34, 0.24),
    c: new THREE.Vector3(1.0, 0.9, 0.75),
    d: new THREE.Vector3(0.02, 0.16, 0.36),
    key: new THREE.Color('#ffbe76'),
    rim: new THREE.Color('#ff5e57'),
    accent: new THREE.Color('#f9ca24'),
    fog: new THREE.Color('#120608'),
  },
  {
    name: 'Boreal Aurora',
    mood: 'Boreal',
    a: new THREE.Vector3(0.09, 0.24, 0.28),
    b: new THREE.Vector3(0.28, 0.46, 0.45),
    c: new THREE.Vector3(0.95, 1.0, 1.1),
    d: new THREE.Vector3(0.32, 0.08, 0.52),
    key: new THREE.Color('#6ee7b7'),
    rim: new THREE.Color('#818cf8'),
    accent: new THREE.Color('#38bdf8'),
    fog: new THREE.Color('#05101a'),
  },
  {
    name: 'Opaline Glass',
    mood: 'Opaline',
    a: new THREE.Vector3(0.22, 0.22, 0.30),
    b: new THREE.Vector3(0.38, 0.36, 0.42),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.33, 0.67),
    key: new THREE.Color('#fbcfe8'),
    rim: new THREE.Color('#7dd3fc'),
    accent: new THREE.Color('#c4b5fd'),
    fog: new THREE.Color('#090b16'),
  },
];

// Shader Layer 1 Worlds (0..4)
const SHADER_WORLDS = [
  { id: 0, key: 'julia', noun: 'Filament' },
  { id: 1, key: 'kaleidoscope', noun: 'Mandala' },
  { id: 2, key: 'stainedGlass', noun: 'Cathedral' },
  { id: 3, key: 'nebula', noun: 'Supernova' },
  { id: 4, key: 'caustics', noun: 'Caustics' },
];

// 3D Layer 2 Worlds (0..3)
const THREE_WORLDS = [
  { id: 0, key: 'tunnel', noun: 'Sanctuary' },
  { id: 1, key: 'planet', noun: 'Horizon' },
  { id: 2, key: 'biolum', noun: 'Reef' },
  { id: 3, key: 'supernova', noun: 'Singularity' },
];

// Curated morph pairings so shader backdrop & 3D foreground harmonize cinematically
const WORLD_JOURNEY = [
  { shader: 3, world3d: 1, twist: 0.10, kaleido: 0.0 }, // Nebula + Ringed Exoplanet
  { shader: 1, world3d: 0, twist: 0.28, kaleido: 1.0 }, // Kaleidoscope + Sacred Geometry Tunnel
  { shader: 4, world3d: 2, twist: 0.14, kaleido: 0.0 }, // Underwater Caustics + Bioluminescence
  { shader: 2, world3d: 0, twist: 0.20, kaleido: 0.35 }, // Stained Glass + Sacred Geometry Tunnel
  { shader: 0, world3d: 3, twist: 0.32, kaleido: 0.15 }, // Silk Julia Fractal + Supernova Vortex
  { shader: 3, world3d: 2, twist: 0.16, kaleido: 0.0 }, // Nebula + Bioluminescent Drift
  { shader: 2, world3d: 1, twist: 0.12, kaleido: 0.25 }, // Stained Glass + Ringed Exoplanet
  { shader: 0, world3d: 0, twist: 0.30, kaleido: 0.65 }, // Julia Fractal + Sacred Geometry Tunnel
  { shader: 1, world3d: 3, twist: 0.36, kaleido: 0.85 }, // Kaleidoscope + Supernova Vortex
];

// Meditative lava-lamp timings
const MORPH_CYCLE_SEC = 150.0; // 2.5 minutes per full morph evolution
const PALETTE_CYCLE_SEC = 270.0; // 4.5 minutes per palette evolution

// Detect software WebGL once via GPU renderer string (never user agent)
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

// ============================================================
// LAYER 1: FULL-SCREEN MORPHING GLSL BACKDROP SHADER
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
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = m * p * 2.02 + vec2(0.13, -0.17);
      a *= 0.5;
    }
    return v;
  }

  // World 0: Silk Julia Fractal (orbit-trap glowing tendrils)
  vec3 renderJulia(vec2 p, float t) {
    vec2 z = p * (1.22 + 0.18 * sin(t * 0.09));
    z *= rot(t * 0.035);
    // Smooth orbit along rich Julia detail boundary
    vec2 c = vec2(-0.745, 0.186) + 0.045 * vec2(cos(t * 0.07), sin(t * 0.061));
    float trapMin = 10.0;
    float trapLine = 10.0;
    float iterSmooth = 0.0;

    for (int i = 0; i < 42; i++) {
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

    float n = iterSmooth / 42.0;
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

  // World 2: Luminous Stained Glass Cathedral (Voronoi refraction + lead filigree)
  vec3 renderStainedGlass(vec2 p, float t) {
    vec2 q = p * rot(t * 0.018);
    float r = length(q);
    // Gentle rose-window radial symmetry blend
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
    // Internal prismatic shimmer
    float shimmer = fbm(uv * 1.8 + vec2(t * 0.06, -t * 0.04));
    glassCol *= (0.55 + 0.72 * glassLight * (0.7 + 0.5 * shimmer));
    glassCol += palette(cellId + 0.5) * bevelGlow;
    // Dark molten-lead stained glass divider
    vec3 col = mix(vec3(0.02, 0.02, 0.04), glassCol, leadLine);
    // Subtle cathedral backlight bloom
    col *= (0.7 + 0.55 * exp(-r * 0.95));
    return col * 0.88;
  }

  // World 3: Cosmic Nebula & Supernova Shockwave
  vec3 renderNebula(vec2 p, float t) {
    vec2 q = p * rot(t * 0.015);
    float r = length(q);

    // Multi-pass domain warping for lush volumetric clouds
    vec2 warp1 = vec2(
      fbm(q * 1.45 + vec2(t * 0.024, -t * 0.018)),
      fbm(q * 1.45 + vec2(-t * 0.02, t * 0.026) + 5.2)
    );
    vec2 warp2 = vec2(
      fbm(q * 2.1 + warp1 * 1.7 + vec2(1.7, 9.2) + t * 0.015),
      fbm(q * 2.1 + warp1 * 1.7 + vec2(8.3, 2.8) - t * 0.014)
    );
    float cloud = fbm(q * 1.8 + warp2 * 1.65);

    // Expanding luminous supernova shockwave ring
    float wavePhase = fract(t * 0.018);
    float waveR = wavePhase * 1.75;
    float shock = exp(-pow((r - waveR) * 8.5, 2.0)) * (1.0 - wavePhase) * (0.5 + 0.8 * cloud);
    float core = exp(-r * 2.6) * (0.65 + 0.5 * warp1.x);

    vec3 col = palette(cloud * 1.4 + warp2.x * 0.45 + t * 0.018);
    col *= smoothstep(0.18, 0.88, cloud) * 0.95;
    col += palette(warp1.y + 0.35) * shock * 0.9;
    col += palette(0.15 + t * 0.02) * core * 0.72;

    // Subtle deep-field pinprick stars inside nebula
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

  // World 4: Underwater Bioluminescent Caustics
  vec3 renderCaustics(vec2 p, float t) {
    vec2 q = p * 1.35;
    q.y -= t * 0.022;
    vec2 drift = vec2(sin(t * 0.05) * 0.3, cos(t * 0.04) * 0.2);

    // Two interfering liquid caustic layers
    vec2 c1 = q * 2.4 + drift;
    vec2 c2 = (q * rot(0.52)) * 2.9 - drift * 1.2;

    float w1 = fbm(c1 + vec2(fbm(c1 + t * 0.06), fbm(c1 - t * 0.05)));
    float w2 = fbm(c2 + vec2(fbm(c2 - t * 0.055), fbm(c2 + t * 0.048)));
    float caustic = pow(1.0 - abs(w1 - w2) * 1.9, 5.0);
    float deepWater = fbm(q * 1.2 + vec2(0.0, t * 0.03));

    // Soft descending sun/bioluminescent god-rays
    float rays = pow(0.5 + 0.5 * sin(p.x * 5.0 + p.y * 1.4 + fbm(p * 1.5 + t * 0.04) * 3.5), 4.0);
    rays *= smoothstep(-0.9, 0.95, p.y);

    vec3 abyss = palette(0.68 + deepWater * 0.35 + t * 0.012) * (0.28 + 0.38 * deepWater);
    vec3 web = palette(0.22 + caustic * 0.45 + t * 0.018) * caustic * 0.95;
    vec3 rayCol = palette(0.4 + t * 0.015) * rays * 0.32;
    return abyss + web + rayCol;
  }

  vec3 sampleWorld(float id, vec2 p, float t) {
    if (id < 0.5) return renderJulia(p, t);
    if (id < 1.5) return renderKaleidoscope(p, t);
    if (id < 2.5) return renderStainedGlass(p, t);
    if (id < 3.5) return renderNebula(p, t);
    return renderCaustics(p, t);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (vUv - 0.5) * 2.0 * aspect;

    // Gentle global lava-lamp swirl + optional radial kaleidoscope warp
    float dist = length(p);
    float twistAngle = uTwist * sin(dist * 1.35 - uTime * 0.065) * 0.45;
    vec2 wp = p * rot(twistAngle);

    if (uKaleido > 0.01) {
      float a = atan(wp.y, wp.x);
      float seg = TAU / 8.0;
      float fa = abs(mod(a + PI, seg) - seg * 0.5);
      vec2 kp = vec2(cos(fa), sin(fa)) * length(wp);
      wp = mix(wp, kp, uKaleido * 0.38);
    }

    vec3 colA = sampleWorld(uSceneA, wp, uTime);
    vec3 colB = sampleWorld(uSceneB, wp, uTime);

    // Organic noise-driven luminance dissolve (cunning semi-transparent bleed, never flat crossfade)
    float maskNoise = fbm(p * 1.45 + vec2(uTime * 0.025, -uTime * 0.02));
    float lumB = dot(colB, vec3(0.299, 0.587, 0.114));
    float dissolve = smoothstep(
      uMorph * 1.45 - 0.45,
      uMorph * 1.45 + 0.10,
      maskNoise * 0.72 + lumB * 0.28
    );
    float blendW = 1.0 - dissolve;

    // Combine with subtle semi-transparent screen overlap during mid-morph
    vec3 baseMix = mix(colA, colB, blendW);
    float overlapAmt = sin(clamp(uMorph, 0.0, 1.0) * PI);
    vec3 screenBlend = 1.0 - (1.0 - colA * 0.85) * (1.0 - colB * 0.85);
    vec3 color = mix(baseMix, screenBlend, overlapAmt * 0.42);

    // Subtle breathing cinema vignette
    float vig = smoothstep(2.05, 0.35, dist);
    color *= (0.48 + 0.58 * vig);

    // Gentle HUD legibility guardrail under top-right clock/weather column
    float hudMask = smoothstep(0.70, 0.96, vUv.x) * smoothstep(0.22, 0.82, vUv.y);
    color *= mix(1.0, 0.62, hudMask);

    gl_FragColor = vec4(max(color, 0.0), 1.0);
  }
`;

// ============================================================
// PROCEDURAL GAS GIANT PLANET SHADER (for 3D Exoplanet World)
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

    // Swirling atmospheric zonal bands
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

// Planetary Ring Shader (multi-band Cassini divisions)
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
    float cassiniGap = 1.0 - smoothstep(0.0, 0.045, abs(t - 0.62)) * 0.0 + smoothstep(0.02, 0.06, abs(t - 0.62));
    float edgeFade = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.82, t);
    float angle = atan(centered.y, centered.x);
    float shimmer = 0.8 + 0.2 * sin(angle * 3.0 + uTime * 0.15);

    vec3 col = mix(uRimColor, uKeyColor, 0.35 + 0.65 * fineBands);
    float alpha = edgeFade * cassiniGap * (0.28 + 0.55 * fineBands) * shimmer * uOpacity * 0.78;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Fresnel Translucent Glow Shader (for planet atmosphere halo & jellyfish bells)
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

// Ethereal Depth-Faded Gossamer Polygon Shader (for Sacred Geometry Rings)
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
    // Smoothly materialize in the far mist and dissolve gently before reaching the camera
    float farFade = smoothstep(64.0, 24.0, vViewDist);
    float nearFade = smoothstep(2.4, 11.8, vViewDist);
    float depthFade = farFade * nearFade;
    vec3 col = mix(uColorA, uColorB, 0.25 + 0.75 * fres);
    float alpha = (0.32 + 0.68 * fres) * depthFade * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Depth-Faded Ethereal Wireframe Line Shader (for Crystal Polyhedral Filigree)
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
    this._curPalA = new THREE.Vector3();
    this._curPalB = new THREE.Vector3();
    this._curPalC = new THREE.Vector3();
    this._curPalD = new THREE.Vector3();
    this._curKey = new THREE.Color();
    this._curRim = new THREE.Color();
    this._curAccent = new THREE.Color();
    this._curFog = new THREE.Color();

    // Choreography timers
    this.clock = new THREE.Clock(false);
    this.elapsed = Math.random() * 120; // Start at a fresh phase each boot
    this.journeyIdxA = Math.floor(Math.random() * WORLD_JOURNEY.length);
    this.journeyIdxB = (this.journeyIdxA + 1) % WORLD_JOURNEY.length;
    this.morphProgress = 0.0;
    this.nudgeBoost = 0.0;

    this.paletteIdxA = Math.floor(Math.random() * PALETTES.length);
    this.paletteIdxB = (this.paletteIdxA + 1) % PALETTES.length;
    this.paletteProgress = 0.0;

    this.modeNameIdx = Math.floor(Math.random() * MODE_NAMES.length);
    this.lastTitleKey = '';

    // 3D world opacity weights (0..1)
    this.worldWeights = [0, 0, 0, 0];

    this._initRenderer();
    this._initScene();
    this._initBackdrop();
    this._initStarfield();
    this._initSacredTunnel();
    this._initExoplanet();
    this._initBioluminescence();
    this._initSupernovaVortex();

    this._onResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._onResize);

    // Pre-compile shaders on hardware GPUs
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Emit initial title
    this._emitTitle(true);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    const maxDpr = this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(maxDpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
      140
    );
    this.camera.position.set(0, 0, 12);

    // Procedural RoomEnvironment for luminous PBR reflections on crystalline rings & moons
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    pmrem.dispose();

    // Warm/cool dynamic lighting rig synchronized to active Cosine palette
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
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uSceneA: { value: 3 },
        uSceneB: { value: 1 },
        uMorph: { value: 0 },
        uTwist: { value: 0.15 },
        uKaleido: { value: 0.0 },
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

  _initStarfield() {
    const count = 650;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 2] = -Math.random() * 68 + 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starMat = new THREE.PointsMaterial({
      map: this.glowTex,
      color: 0xe2e8f0,
      size: 0.34,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.starField = new THREE.Points(geo, this.starMat);
    this.scene.add(this.starField);
  }

  // 3D WORLD 0: Sacred Geometry Tunnel (7 varied gossamer polygon archetypes with shifting centers)
  _initSacredTunnel() {
    this.tunnelGroup = new THREE.Group();
    this.tunnelRings = [];
    this.tunnelMaterials = [];

    // Shared library of 7 distinct polygon & polyhedral archetypes (pre-allocated once — zero GC)
    const tetraEdges = new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(3.25, 0));
    const octaEdges = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(3.35, 0));
    const dodecaEdges = new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(3.4, 0));
    const icosaEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.45, 0));

    this.tunnelArchetypes = [
      {
        // 0: Triangle / Merkaba Star
        outer: new THREE.TorusGeometry(4.1, 0.028, 6, 3),
        inner: new THREE.TorusGeometry(3.35, 0.019, 6, 3),
        innerRot: Math.PI,
        filigree: tetraEdges,
      },
      {
        // 1: Diamond / Rhombus Portal
        outer: new THREE.TorusGeometry(4.2, 0.028, 6, 4),
        inner: new THREE.TorusGeometry(2.9, 0.019, 6, 4),
        innerRot: Math.PI / 4,
        filigree: octaEdges,
      },
      {
        // 2: Pentagon / Golden Sanctuary
        outer: new THREE.TorusGeometry(4.25, 0.027, 6, 5),
        inner: new THREE.TorusGeometry(2.8, 0.018, 6, 5),
        innerRot: Math.PI / 5,
        filigree: dodecaEdges,
      },
      {
        // 3: Hexagon / Flower Frame
        outer: new THREE.TorusGeometry(4.3, 0.026, 6, 6),
        inner: new THREE.TorusGeometry(2.75, 0.018, 6, 6),
        innerRot: Math.PI / 6,
        filigree: icosaEdges,
      },
      {
        // 4: Heptagon / Mystic Star
        outer: new THREE.TorusGeometry(4.25, 0.025, 6, 7),
        inner: new THREE.TorusGeometry(2.85, 0.017, 6, 7),
        innerRot: Math.PI / 7,
        filigree: dodecaEdges,
      },
      {
        // 5: Octagon / Cathedral Rose
        outer: new THREE.TorusGeometry(4.35, 0.025, 6, 8),
        inner: new THREE.TorusGeometry(2.95, 0.017, 6, 8),
        innerRot: Math.PI / 8,
        filigree: octaEdges,
      },
      {
        // 6: Decagon & Sacred Torus-Knot Halo
        outer: new THREE.TorusGeometry(4.4, 0.022, 6, 10),
        inner: new THREE.TorusKnotGeometry(2.55, 0.016, 64, 5, 2, 3),
        innerRot: 0,
        filigree: icosaEdges,
      },
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

    this.tunnelMaterials.push(this.tunnelOuterMat, this.tunnelInnerMat, this.tunnelLineMat);

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

  // 3D WORLD 1: Composite Procedural Ringed Exoplanet & Orbiting Moons
  _initExoplanet() {
    this.planetGroup = new THREE.Group();

    // 1. Banded gas giant core
    const planetGeo = new THREE.SphereGeometry(2.55, 48, 36);
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

    // 2. Outer translucent Fresnel Rayleigh Atmosphere Halo
    const atmoGeo = new THREE.SphereGeometry(2.86, 40, 32);
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

    // 3. Tilted multi-band translucent planetary rings
    const ringGeo = new THREE.PlaneGeometry(11.6, 11.6, 1, 1);
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

    // 4. Two composite orbiting moons (varied roughness/metalness)
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

    // Frame gracefully left-of-center so right-hand HUD stays unobstructed
    this.planetGroup.position.set(-2.2, 0.2, -2.5);
    this.planetGroup.visible = false;
    this.scene.add(this.planetGroup);
  }

  // 3D WORLD 2: Underwater Bioluminescence (composite jellyfish + 260 instanced plankton motes)
  _initBioluminescence() {
    this.biolumGroup = new THREE.Group();
    this.jellies = [];

    // Lathe bell profile for graceful jellyfish silhouette
    const bellPts = [
      new THREE.Vector2(0.01, 1.05),
      new THREE.Vector2(0.42, 0.96),
      new THREE.Vector2(0.84, 0.68),
      new THREE.Vector2(1.06, 0.22),
      new THREE.Vector2(1.02, -0.18),
      new THREE.Vector2(0.82, -0.12),
    ];
    const bellGeo = new THREE.LatheGeometry(bellPts, 28);
    const coreGeo = new THREE.SphereGeometry(0.42, 20, 16);

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
      { pos: [-3.4, -0.6, -1.8], scale: 1.25, phase: 0.0, speed: 0.22 },
      { pos: [0.8, 1.5, -5.2], scale: 0.95, phase: 2.1, speed: 0.18 },
      { pos: [-5.4, 2.2, -6.8], scale: 0.8, phase: 4.3, speed: 0.15 },
    ];

    jellyConfigs.forEach((cfg) => {
      const jelly = new THREE.Group();
      const bell = new THREE.Mesh(bellGeo, this.jellyBellMat);
      const core = new THREE.Mesh(coreGeo, this.jellyCoreMat);
      core.position.y = 0.25;
      core.scale.set(0.85, 1.15, 0.85);
      jelly.add(bell, core);

      // 6 sinuous trailing TubeGeometry tentacles per jellyfish
      const tentacles = [];
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
        const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.022, 5, false);
        const tube = new THREE.Mesh(tubeGeo, this.tentacleMat);
        jelly.add(tube);
        tentacles.push(tube);
      }

      jelly.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      jelly.scale.setScalar(cfg.scale);
      jelly.userData = { ...cfg, basePos: new THREE.Vector3(...cfg.pos), tentacles };
      this.biolumGroup.add(jelly);
      this.jellies.push(jelly);
    });

    // InstancedMesh of 260 bioluminescent plankton motes rising in 3D currents
    const planktonCount = 260;
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
      const data = {
        x: (Math.random() - 0.5) * 24 - 1.0,
        y: (Math.random() - 0.5) * 16,
        z: -Math.random() * 18 + 2,
        scale: 0.55 + Math.random() * 0.95,
        speed: 0.18 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
      };
      this.planktonData.push(data);
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

    // 1. 2,200-particle spiral accretion galaxy
    const count = 2200;
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

    // 2. Luminous core + dual precessing relativistic plasma torus rings
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
    this.vortexCore = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 24), this.vortexCoreMat);

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
    this.vortexRingA = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.055, 12, 80), this.vortexRingMat);
    this.vortexRingB = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.04, 12, 96), this.vortexRingMat);
    this.vortexRingB.rotation.x = Math.PI * 0.46;

    this.vortexGroup.add(this.vortexCore, this.vortexRingA, this.vortexRingB);
    this.vortexGroup.position.set(-1.6, 0.1, -3.5);
    this.vortexGroup.rotation.x = 0.55;
    this.vortexGroup.visible = false;
    this.scene.add(this.vortexGroup);
  }

  _emitTitle(force = false) {
    if (!this.onTitleChange) return;
    const pal = PALETTES[this.paletteIdxA];
    const stepA = WORLD_JOURNEY[this.journeyIdxA];
    const stepB = WORLD_JOURNEY[this.journeyIdxB];

    // Pick poetic pair reflecting the currently dominant stage
    const activeStep = this.morphProgress > 0.55 ? stepB : stepA;
    const shaderMeta = SHADER_WORLDS[activeStep.shader];
    const world3dMeta = THREE_WORLDS[activeStep.world3d];
    const modeName = MODE_NAMES[this.modeNameIdx % MODE_NAMES.length];

    // Alternate smoothly between shader noun and 3D world noun for poetic variety
    const noun = (this.journeyIdxA + this.modeNameIdx) % 2 === 0 ? shaderMeta.noun : world3dMeta.noun;
    const subtitle = `${pal.mood} ${noun}`;
    const key = `${modeName}|${subtitle}`;

    if (force || key !== this.lastTitleKey) {
      this.lastTitleKey = key;
      this.onTitleChange({ modeName, subtitle, paletteName: pal.name });
    }
  }

  getCurrentTitle() {
    const pal = PALETTES[this.paletteIdxA];
    const step = WORLD_JOURNEY[this.journeyIdxA];
    const modeName = MODE_NAMES[this.modeNameIdx % MODE_NAMES.length];
    const noun = (this.journeyIdxA + this.modeNameIdx) % 2 === 0
      ? SHADER_WORLDS[step.shader].noun
      : THREE_WORLDS[step.world3d].noun;
    return { modeName, subtitle: `${pal.mood} ${noun}` };
  }

  /**
   * Gently accelerate into the next morph & color mood on user tap / remote arrow
   */
  nudgeNext() {
    this.nudgeBoost = 1.0;
  }

  start() {
    if (this.isRunning || this.isDisposed) return;
    this.isRunning = true;
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
    this.renderer.setSize(w, h);
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

  _update(dt) {
    const safeDt = Math.min(dt, 0.12);
    this.elapsed += safeDt;

    // Gentle manual nudge accelerates morph cleanly (~3.5s glide) then decays back to lava-lamp speed
    let morphSpeed = 1.0 / MORPH_CYCLE_SEC;
    let palSpeed = 1.0 / PALETTE_CYCLE_SEC;
    if (this.nudgeBoost > 0.001) {
      morphSpeed = THREE.MathUtils.lerp(morphSpeed, 0.26, this.nudgeBoost);
      palSpeed = THREE.MathUtils.lerp(palSpeed, 0.14, this.nudgeBoost);
      this.nudgeBoost = THREE.MathUtils.damp(this.nudgeBoost, 0, 1.4, safeDt);
    }

    this.morphProgress += safeDt * morphSpeed;
    if (this.morphProgress >= 1.0) {
      this.morphProgress -= 1.0;
      this.journeyIdxA = this.journeyIdxB;
      // Pick a fresh next journey step (never identical)
      let nextIdx = (this.journeyIdxB + 1 + Math.floor(Math.random() * 2)) % WORLD_JOURNEY.length;
      if (nextIdx === this.journeyIdxA) nextIdx = (this.journeyIdxA + 1) % WORLD_JOURNEY.length;
      this.journeyIdxB = nextIdx;
      this.modeNameIdx = (this.modeNameIdx + 1) % MODE_NAMES.length;
      this.nudgeBoost = 0;
      this._emitTitle(false);
    }

    this.paletteProgress += safeDt * palSpeed;
    if (this.paletteProgress >= 1.0) {
      this.paletteProgress -= 1.0;
      this.paletteIdxA = this.paletteIdxB;
      this.paletteIdxB = (this.paletteIdxB + 1 + Math.floor(Math.random() * (PALETTES.length - 2))) % PALETTES.length;
      this._emitTitle(false);
    }

    // Smooth S-curves for meditative lava-lamp blends
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

    // 2. Update Layer 1 GLSL Backdrop Uniforms
    const stepA = WORLD_JOURNEY[this.journeyIdxA];
    const stepB = WORLD_JOURNEY[this.journeyIdxB];

    const u = this.backdropMat.uniforms;
    u.uTime.value = this.elapsed;
    u.uSceneA.value = stepA.shader;
    u.uSceneB.value = stepB.shader;
    u.uMorph.value = smoothMorph;
    u.uTwist.value = THREE.MathUtils.lerp(stepA.twist, stepB.twist, smoothMorph);
    u.uKaleido.value = THREE.MathUtils.lerp(stepA.kaleido, stepB.kaleido, smoothMorph);
    u.uPalA.value.copy(this._curPalA);
    u.uPalB.value.copy(this._curPalB);
    u.uPalC.value.copy(this._curPalC);
    u.uPalD.value.copy(this._curPalD);

    // 3. Gentle meditative camera float
    const t = this.elapsed;
    this.camera.position.x = Math.sin(t * 0.055) * 0.95;
    this.camera.position.y = Math.cos(t * 0.043) * 0.65;
    this.camera.position.z = 11.8 + Math.sin(t * 0.031) * 0.9;
    this.camera.lookAt(-1.1, 0, -4.0);

    // 4. Slow parallax stardust drift
    this.starField.rotation.z = t * 0.009;
    this.starField.rotation.y = Math.sin(t * 0.014) * 0.12;
    this.starMat.color.copy(this._curKey).lerp(this._curRim, 0.5);

    // 5. Compute smooth 3D Layer weights (allows 2 3D worlds to gracefully overlap during morphs)
    for (let i = 0; i < 4; i++) {
      let target = 0;
      if (stepA.world3d === i) target += 1.0 - smoothMorph;
      if (stepB.world3d === i) target += smoothMorph;
      this.worldWeights[i] = THREE.MathUtils.clamp(target, 0, 1);
    }

    // Update World 0: Sacred Geometry Tunnel (varied gossamer polygons blooming from shifting centers)
    const wTunnel = this.worldWeights[0];
    this.tunnelGroup.visible = wTunnel > 0.008;
    if (this.tunnelGroup.visible) {
      // Airy, see-through translucency so the moving backdrop world shines straight through
      this.tunnelOuterMat.uniforms.uOpacity.value = wTunnel * 0.26;
      this.tunnelOuterMat.uniforms.uColorA.value.copy(this._curKey);
      this.tunnelOuterMat.uniforms.uColorB.value.copy(this._curRim);

      this.tunnelInnerMat.uniforms.uOpacity.value = wTunnel * 0.20;
      this.tunnelInnerMat.uniforms.uColorA.value.copy(this._curAccent);
      this.tunnelInnerMat.uniforms.uColorB.value.copy(this._curKey);

      this.tunnelLineMat.uniforms.uOpacity.value = wTunnel * 0.13;
      this.tunnelLineMat.uniforms.uColor.value.copy(this._curRim);

      // Slowly wandering distant vanishing center & foreground focal center (multi-harmonic Lissajous drift)
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

        // When a portal recycles to the far horizon, evolve its polygon shape from the rolling family
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

        // Curved drifting spine + gentle per-ring eccentric offset so centers shift organically across the frame
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

    // Update World 1: Procedural Ringed Exoplanet
    const wPlanet = this.worldWeights[1];
    this.planetGroup.visible = wPlanet > 0.008;
    if (this.planetGroup.visible) {
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
      this.planetGroup.position.x = -2.1 + Math.sin(t * 0.045) * 1.1;
      this.planetGroup.position.y = 0.25 + Math.cos(t * 0.038) * 0.65;
      this.planetGroup.scale.setScalar(0.75 + 0.25 * wPlanet);

      this.moonA.position.set(Math.cos(t * 0.16) * 4.9, Math.sin(t * 0.16) * 1.25, Math.sin(t * 0.16) * 3.8);
      this.moonB.position.set(Math.cos(-t * 0.24 + 2.0) * 3.8, Math.sin(-t * 0.24 + 2.0) * 1.6, Math.sin(-t * 0.24 + 2.0) * 3.1);
    }

    // Update World 2: Underwater Bioluminescence
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
        const driftY = Math.sin(t * ud.speed + ud.phase) * 1.6;
        const driftX = Math.cos(t * ud.speed * 0.7 + ud.phase) * 0.9;
        j.position.set(ud.basePos.x + driftX, ud.basePos.y + driftY, ud.basePos.z);
        j.rotation.z = Math.sin(t * 0.25 + ud.phase) * 0.18;
        j.rotation.y = t * 0.08 + ud.phase;
      }

      // Update instanced bioluminescent plankton
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

    // Update World 3: Supernova & Relativistic Accretion Vortex
    const wVortex = this.worldWeights[3];
    this.vortexGroup.visible = wVortex > 0.008;
    if (this.vortexGroup.visible) {
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
      this.vortexGroup.rotation.z = Math.sin(t * 0.04) * 0.22;
      this.vortexGroup.scale.setScalar(0.82 + 0.18 * wVortex);
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
