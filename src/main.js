/** @type {WebGLProgram} */
let program;
/** @type {WebGL2RenderingContext} */
let gl;
/** @type {HTMLCanvasElement} */
let canvas;

let zoom = 0.002;
const width = innerWidth * 4;
const height = innerHeight * 4;

/**
 * 
 * @param {string} path
 * @returns {Promise<string>}
 */
async function readFile(path) { return await (await fetch(path)).text() };

/**
 * 
 * @param {number} deg
 * @return {number}
 */
function degToRad(deg) { return deg * (Math.PI / 180) };


/**
 * 
 * @param {string} path
 * @returns {Promise<Image>}
 */
function readImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = path;
  })
}

/**
 * 
 * @param {number} _deltatime
 * @returns {void}
 */
async function update(_deltatime) {
  gl.clearColor(18 / 255, 18 / 255, 18 / 255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  const bufferData = [
    1, -1,
    1, 1,
    -1, -1,
    -1, 1,
    -1, -1,
    1, 1
  ];

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);

  gl.uniform2fv(gl.getUniformLocation(program, "uSize"), [innerWidth, innerHeight]);
  gl.uniform1f(gl.getUniformLocation(program, "uZoom"), zoom);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  gl.drawArrays(gl.TRIANGLES, 0, bufferData.length / 2);
};

async function start() {
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = height;
  gl = canvas.getContext("webgl2");
  gl.viewport(0, 0, width, height);
  if (!gl) return console.warn("webgl not supported!");

  program = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const vertexShaderSource = await readFile("./sdr/vertex.glsl");
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  const vertexShaderLog = gl.getShaderInfoLog(vertexShader);
  if (vertexShaderLog) return console.warn(vertexShaderLog, "\nsource:\n", vertexShaderSource);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  const fragmentShaderSource = await readFile("./sdr/fragment.glsl");
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);
  const fragmentShaderLog = gl.getShaderInfoLog(fragmentShader);
  if (fragmentShaderLog) return console.warn(fragmentShaderLog, "\nsource:\n", fragmentShaderSource);

  gl.linkProgram(program);
  gl.useProgram(program);
}

start().then(() => {
  let prev = performance.now();
  const loop = () => {
    const current = performance.now();
    update((current - prev) / 1000);
    prev = current;
    // requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
