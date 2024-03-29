import GLea from './lib/glea.mjs';
import { frag, vert } from './shaders.mjs';
import HonkyTonkPiano from './components/honky-tonk-piano.mjs';
import { AC, master, toneFrequency, fmSynth, measureVolume } from './audio.mjs';

const activeNotes = {};
let volume = 0;

master.gain.value = .6;
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
  volume = Math.min(255, 5 * Object.keys(activeNotes).length + measureVolume());
  glea.clear();
  glea.uni('width', glea.width);
  glea.uni('height', glea.height);
  glea.uni('time', time * .005);
  glea.uni('volume', volume);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(loop);
}

loop(0);


window.addEventListener('note_on', (e) => { 
  if (! e.detail) {
    return;
  }
  const tone = e.detail.slice(0, -1);
  const octave = parseInt(e.detail.slice(-1), 10)
  const freq = toneFrequency(tone, octave);
  if (AC.state === "suspended") {
    AC.resume();
  }
  const synth = fmSynth({
    carFreq: freq, 
    carType: 'sawtooth',
    carGain: .5,
    modType: 'triangle',
    modFreq: 300, 
    modGain: 30
  });
  synth.connectTo(master).start();
  if (e.detail in activeNotes) {
    const oldSynth = activeNotes[e.detail];
    oldSynth.fadeOut().then(() => {
      oldSynth.destroy();
    });
  }
  activeNotes[e.detail] = synth;
});

window.addEventListener('note_off', (e) => { 
  const synth = activeNotes[e.detail];
  if (synth) {
    activeNotes[e.detail] = null;
    delete activeNotes[e.detail];
    synth.fadeOut(2.0).then(() => {
      synth.destroy();
    });
  }
});
