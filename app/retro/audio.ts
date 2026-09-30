// Shrit TV sound: everything is synthesized with Web Audio (no files to download).
// Must be created from a user gesture (the power button) so browsers allow sound.

export type TvAudio = ReturnType<typeof createTvAudio>;

export function createTvAudio() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);

  // One second of white noise, reused by everything noisy.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noiseSource = () => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    return src;
  };

  // Low room hiss while a non-video channel is on.
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0;
  const hissFilter = ctx.createBiquadFilter();
  hissFilter.type = "highpass";
  hissFilter.frequency.value = 3000;
  const hiss = noiseSource();
  hiss.connect(hissFilter).connect(hissGain).connect(master);
  hiss.start();

  // Lo-fi pad for the DREAMS channel: slow jazzy chords, warm lowpass, gentle wow.
  const padGain = ctx.createGain();
  padGain.gain.value = 0;
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  padFilter.connect(padGain).connect(master);
  const CHORDS = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0], // Am7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0, 246.94, 293.66, 349.23], // G7
  ];
  const voices = CHORDS[0].map(() => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    const g = ctx.createGain();
    g.gain.value = 0.05;
    osc.connect(g).connect(padFilter);
    osc.start();
    return osc;
  });
  const wow = ctx.createOscillator();
  const wowDepth = ctx.createGain();
  wow.frequency.value = 0.4;
  wowDepth.gain.value = 3;
  wow.connect(wowDepth);
  voices.forEach((v) => wowDepth.connect(v.detune));
  wow.start();
  let chord = 0;
  let padTimer = 0;
  const nextChord = () => {
    const t = ctx.currentTime;
    CHORDS[chord].forEach((f, i) => voices[i].frequency.setTargetAtTime(f, t, 0.25));
    chord = (chord + 1) % CHORDS.length;
  };

  return {
    setPad(on: boolean) {
      window.clearInterval(padTimer);
      padGain.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, on ? 0.8 : 0.2);
      if (on) {
        nextChord();
        padTimer = window.setInterval(nextChord, 2600);
      }
    },
    /** Channel-change static: a filtered noise burst with a quick attack and tail. */
    static(ms = 360, volume = 0.32) {
      const t = ctx.currentTime;
      const src = noiseSource();
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1200 + Math.random() * 1600;
      band.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume, t + 0.02);
      g.gain.setValueAtTime(volume, t + ms / 1000 - 0.08);
      g.gain.linearRampToValueAtTime(0, t + ms / 1000);
      src.connect(band).connect(g).connect(master);
      src.start(t);
      src.stop(t + ms / 1000 + 0.05);
    },
    /** The 1kHz colour-bars tone. */
    tone(ms = 1800, freq = 1000, volume = 0.05) {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume, t + 0.02);
      g.gain.setValueAtTime(volume, t + ms / 1000 - 0.05);
      g.gain.linearRampToValueAtTime(0, t + ms / 1000);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + ms / 1000 + 0.05);
    },
    /** Tiny mechanical click for buttons. */
    click() {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 0.06);
    },
    /** CRT power-on "thunk" + high whine that fades. */
    powerOn() {
      const t = ctx.currentTime;
      const thunk = ctx.createOscillator();
      thunk.frequency.setValueAtTime(90, t);
      thunk.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.25, t);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      thunk.connect(tg).connect(master);
      thunk.start(t);
      thunk.stop(t + 0.32);
      const whine = ctx.createOscillator();
      whine.frequency.value = 15_700;
      const wg = ctx.createGain();
      wg.gain.setValueAtTime(0.012, t);
      wg.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      whine.connect(wg).connect(master);
      whine.start(t);
      whine.stop(t + 2.6);
    },
    setHiss(on: boolean) {
      hissGain.gain.setTargetAtTime(on ? 0.012 : 0, ctx.currentTime, 0.2);
    },
    setMuted(muted: boolean) {
      master.gain.setTargetAtTime(muted ? 0 : 0.6, ctx.currentTime, 0.05);
    },
    close() {
      window.clearInterval(padTimer);
      void ctx.close();
    },
  };
}

/** Announcer voice via the browser's speech engine (free, instant, no downloads). */
export function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const pick =
    voices.find((v) => /Daniel|Fred|Alex|Google UK English Male/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en"));
  if (pick) u.voice = pick;
  u.rate = opts.rate ?? 1.02;
  u.pitch = opts.pitch ?? 0.8;
  u.volume = 0.9;
  speechSynthesis.speak(u);
}

export function hush() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
