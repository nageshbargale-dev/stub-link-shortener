// Tiny synthesized sound effects — no audio files, just Web Audio.
let ctx;
let enabled = true;
let noise;

function audio() {
  if (!enabled) return null;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noiseBuffer(c) {
  if (noise) return noise;
  noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}

function burst(c, t, { dur, freq, gain, q = 1, type = 'bandpass' }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

function tone(c, t, { from, to, dur, gain, type = 'sine' }) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  setEnabled(value) {
    enabled = value;
  },
  // Thermal-printer chatter, timed to the 14-step print animation.
  print() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    for (let i = 0; i < 14; i++) {
      burst(c, t + i * 0.07, { dur: 0.05, freq: 2200 + Math.random() * 1400, gain: 0.1, q: 4 });
      tone(c, t + i * 0.07, { from: 190, to: 160, dur: 0.045, gain: 0.02, type: 'square' });
    }
  },
  stamp() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, { from: 150, to: 45, dur: 0.25, gain: 0.45 });
    burst(c, t, { dur: 0.08, freq: 900, gain: 0.25, type: 'lowpass' });
  },
  tear() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    for (let i = 0; i < 7; i++) {
      burst(c, t + i * 0.028, { dur: 0.035, freq: 2800 + i * 350, gain: 0.07, q: 1.2, type: 'highpass' });
    }
  },
  thud() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, { from: 95, to: 38, dur: 0.4, gain: 0.4 });
    burst(c, t, { dur: 0.2, freq: 350, gain: 0.2, type: 'lowpass' });
  },
  // Counter bell, for a click that just landed.
  ding() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, { from: 1318, to: 1312, dur: 0.9, gain: 0.09 });
    tone(c, t, { from: 1976, to: 1970, dur: 0.5, gain: 0.04 });
    tone(c, t, { from: 2637, to: 2630, dur: 0.2, gain: 0.02 });
  },
  zap() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, { from: 180, to: 1400, dur: 0.28, gain: 0.05, type: 'sawtooth' });
    tone(c, t + 0.12, { from: 600, to: 1800, dur: 0.2, gain: 0.04, type: 'triangle' });
  },
};
