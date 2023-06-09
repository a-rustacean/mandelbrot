#version 300 es
precision highp float;

in vec2 vPosition;
uniform vec2 uSize;
uniform float uZoom;

out vec4 fragColor;

void main() {
  vec2 z = vPosition * uSize * uZoom;
  vec2 c = z;
  int n = 0;
  int mi = 200;
  float br = 0.0;
  while (n < mi) {
    vec2 sqr = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = sqr + c;

    if (length(z) > 2.0) {
      break;
    }

    br += 1.0 / float(mi);
    n++;
  }
  fragColor = vec4(br, br, br, 1.0);
}
