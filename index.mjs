import GLea from './lib/glea.mjs';
import { frag, vert } from './shaders.mjs';
import HonkyTonkPiano from './components/honky-tonk-piano.mjs';

HonkyTonkPiano.register();

const glea = new GLea({
  shaders: [
    GLea.fragmentShader(frag),
    GLea.vertexShader(vert)
  ],
  buffers: {
    'position': GLea.buffer(2, [1, 1,  -1, 1,  1,-1,  -1,-1])
  }
}).create();

window.addEventListener('resize', () => {
  glea.resize();
});

function loop(time) {
  const { gl } = glea;
  glea.clear();
  glea.uni('width', glea.width);
  glea.uni('height', glea.height);
  glea.uni('time', time * .005);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(loop);
}

loop(0);

window.addEventListener('note_on', (e) => { console.log(e); });
window.addEventListener('note_off', (e) => { console.log(e); });