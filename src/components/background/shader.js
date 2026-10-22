// Fondo en dos pasadas:
//  1. FIELD_FRAG: el fluido (ruido con deformación de dominio, lo costoso) a resolución reducida,
//     guardado en una textura RGBA8 con 16 bits de precisión (alto + bajo).
//  2. COLOR_FRAG: a resolución nativa de pantalla lee ese campo con interpolación bilineal y
//     resuelve colores, bordes de mármol, luz y grano. Es barato, y los bordes quedan nítidos.

export const VERT = `#version 300 es
void main() {
  // Triángulo que cubre toda la pantalla, sin buffers
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

export const FIELD_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  u_res;   // tamaño de la textura del campo
uniform float u_aspect; // proporción de la pantalla (no de la textura)
uniform float u_t;      // fase del tiempo (acumulada: cambiar la velocidad no da saltos)

// Ruido simplex 2D (Ashima Arts / Ian McEwan, MIT)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p = p * 2.02 + vec2(7.1, 3.7);
    a *= 0.42;
  }
  return s;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (uv - 0.5) * vec2(u_aspect, 1.0) * 0.38;
  float t = u_t;

  // Deformación de dominio: el fluido se pliega sobre sí mismo
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.12)), fbm(p + vec2(5.2, 1.3) - t * 0.10));
  vec2 r = vec2(fbm(p + 1.25 * q + vec2(1.7, 9.2) + t * 0.07),
                fbm(p + 1.25 * q + vec2(8.3, 2.8) - t * 0.06));
  float f = fbm(p + 1.4 * r);

  float x = clamp(0.5 + 0.95 * f + 0.22 * r.x, 0.0, 1.0);

  // 16 bits en dos canales de 8: alto y bajo
  float v = x * 255.0;
  outColor = vec4(floor(v) / 255.0, fract(v), 0.0, 1.0);
}`

export const COLOR_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D u_field;
uniform vec2  u_fieldRes;
uniform vec2  u_res;     // tamaño del lienzo en píxeles de dispositivo
uniform float u_dpr;     // píxeles de dispositivo por píxel CSS (el grano va por píxel CSS)
uniform float u_energy;  // pulso suavizado 0..1
uniform float u_sharp;   // 0 suave .. 1 mármol
uniform vec2  u_center;  // centro de la luz (pantalla 0..1)
uniform vec3  u_glow;
uniform vec3  u_col[6];
uniform float u_edge[5];
uniform float u_grain;   // cantidad de grano 0..1
uniform float u_seed;    // cambia a saltos: el grano "vibra"

float fieldAt(ivec2 c) {
  vec4 s = texelFetch(u_field, clamp(c, ivec2(0), ivec2(u_fieldRes) - 1), 0);
  return s.r + s.g / 255.0;
}

// Interpolación bilineal manual (los datos van empaquetados, no se pueden filtrar directo)
float field(vec2 uv) {
  vec2 tc = uv * u_fieldRes - 0.5;
  vec2 i0 = floor(tc);
  vec2 f = tc - i0;
  ivec2 c = ivec2(i0);
  float a = fieldAt(c);
  float b = fieldAt(c + ivec2(1, 0));
  float d = fieldAt(c + ivec2(0, 1));
  float e = fieldAt(c + ivec2(1, 1));
  return mix(mix(a, b, f.x), mix(d, e, f.x), f.y);
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Mezcla "soft-light" (misma fórmula que mix-blend-mode: soft-light de CSS)
vec3 softLight(vec3 cb, float s) {
  vec3 dk = mix(((16.0 * cb - 12.0) * cb + 4.0) * cb, sqrt(cb), step(0.25, cb));
  return s <= 0.5 ? cb - (1.0 - 2.0 * s) * cb * (1.0 - cb) : cb + (2.0 * s - 1.0) * (dk - cb);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float x = field(uv);

  // Ancho de transición entre colores: amplio = degradado, mínimo = borde de mármol.
  // Se interpola en escala exponencial para que los valores intermedios de u_sharp se noten parejo.
  float wSoft = 0.15;
  float wHard = max(fwidth(x) * 1.2, 0.0008);
  float w = wSoft * pow(wHard / wSoft, u_sharp);
  vec3 c = u_col[0];
  for (int i = 0; i < 5; i++) {
    c = mix(c, u_col[i + 1], smoothstep(u_edge[i] - w, u_edge[i] + w, x));
  }

  // Luz ambiental que late con la música, centrada donde está el parlante
  vec2 d = (uv - u_center) * vec2(aspect, 1.0);
  float glow = exp(-dot(d, d) * 2.6) * u_energy;
  c += u_glow * glow * 0.32;
  c *= 1.0 + u_energy * 0.08;

  // Viñeta muy suave
  c *= 1.0 - 0.16 * dot(uv - 0.5, uv - 0.5) * 2.0;
  c = clamp(c, 0.0, 1.0);

  // Grano de película a resolución nativa (por píxel CSS), mezclado en soft-light
  vec2 cell = floor(gl_FragCoord.xy / u_dpr);
  float n = 0.5 + (hash(cell + u_seed * 17.13) - 0.5) * 0.7;
  c = mix(c, softLight(c, n), u_grain);

  outColor = vec4(c, 1.0);
}`
