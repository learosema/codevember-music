export const AC = new AudioContext();
export const master = AC.createGain();
export const analyser = AC.createAnalyser();

master.gain.value = 1.0;
master.connect(analyser);
analyser.connect(AC.destination);

/**
 * Create an oscillator node
 * 
 * @param {string} type Oscillator type. sine, square, triangle
 * @param {value} freq frequency
 * @returns {OscillatorNode} OscillatorNode
 */
export function oscillator(type = 'sine', freq) {
  const osc = AC.createOscillator();
  osc.type = type;
  if (freq) {
    osc.frequency.value = freq;
  }
  return osc;
}

/**
 * Create a gain node
 * 
 * @param value 
 * @returns {GainNode}
 */
export function gain(value = 1.0) {
  const gain = AC.createGain();
  gain.gain.value = value;
  return gain;
}

export const tones = [
  'C',  'C#', 'D',  'D#',
  'E',  'F',  'F#', 'G',
  'G#', 'A',  'A#', 'B'
];

/**
 * Get frequency of a tone
 * @param {string} tone C,D,F,G,H,A,B plus # for black keys
 * @param {number} octave octave 1...9
 * @returns {number} frequency  
 */
export function toneFrequency(tone, octave) {
  const n = (typeof tone === "string") ? tones.indexOf(tone.replace(/_/,'')) : n;
  const f = (110 * 2 ** octave) * 2 ** ((n+3)/12);
  return f;
}

/**
 * FM Synth configuration parameters
 * 
 * @typedef {Object} FMSynthConfiguration
 * @property {string} carType carrier type: sine, square, triangle or sawtooth
 * @property {number} carFreq carrier frequency
 * @property {number} carGain carrier gain
 * @property {string} modType modulator type: sine, square, triangle or sawtooth
 * @property {number} modFreq modulator frequency
 * @property {number} modGain modulator gain
 */

/**
 * Oscillator and Gain node in one object
 * 
 * @typedef {Object} OscGainObject
 * @property {OscillatorNode} osc oscillator node
 * @property {GainNode} gain gain node
 */

/**
 * FM Synth object
 * 
 * @typedef {object} FMSynthObject
 * @property {OscGainObject} modulator
 * @property {OscGainObject} carrier
 * @property {GainNode} output 
 * @property {function} connectTo connect synth
 * @property {function} start start oscillator
 */

/** 
 * Create FM synth
 * @param {FMSynthConfiguration}
 * @return {fmSynthObject}
 */
export function fmSynth({
  carType = 'sine', carFreq = 440, carGain = 1.0, 
  modType = 'sine', modFreq = 420, modGain = 20,
  outGain = 1.0}) {
  const carrier = {
    osc: oscillator(carType, carFreq),
    gain: gain(carGain)
  };
    
  const modulator = {
    osc: oscillator(modType, modFreq),
    gain: gain(modGain)
  };

  const output = gain(outGain);

  carrier.osc.connect(carrier.gain);
  modulator.osc.connect(modulator.gain);
  modulator.gain.connect(carrier.osc.frequency);
  carrier.gain.connect(output);
  const synth = {
    carrier,
    modulator,
    output,
    start() {
      modulator.osc.start();
      carrier.osc.start();
      return synth;
    },
    destroy() {
      modulator.osc.stop();
      carrier.osc.stop();
      carrier.osc.disconnect();
      carrier.gain.disconnect();
      modulator.osc.disconnect();
      modulator.gain.disconnect();
      output.disconnect();
      return synth;
    },
    connectTo(node) {
      output.connect(node);
      return synth;
    }
  }
  return synth;
}