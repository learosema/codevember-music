import GLea from './lib/glea.mjs';
import { frag, vert } from './shaders.mjs';
import HonkyTonkPiano from './components/honky-tonk-piano.mjs';
import { AC, master, toneFrequency, fmSynth } from './audio.mjs';


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

const activeNotes = {

}


window.addEventListener('note_on', (e) => { 
  if (! e.detail) {
    return;
  }
  const tone = e.detail.slice(0, -1);
  const octave = parseInt(e.detail.slice(-1), 10)
  const freq = toneFrequency(tone, octave);
  console.log(tone, octave, freq);
  if (AC.state === "suspended") {
    AC.resume();
  }
  const synth = fmSynth({
    carFreq: freq, 
    carType: 'triangle',
    modFreq: freq / 2, 
    modGain: 400
  });
  synth.connectTo(master).start();
  activeNotes[e.detail] = synth;
});

window.addEventListener('note_off', (e) => { 
  const synth = activeNotes[e.detail];
  if (synth) {
    activeNotes[e.detail] = null;
    delete activeNotes[e.detail];
    synth.output.gain.exponentialRampToValueAtTime(0.01, AC.currentTime + 1)
    setTimeout(() => {
      synth.output.gain.value = 0;
      synth.destroy();
    }, 1000);
  }
});