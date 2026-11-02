const NOTES = [523.25, 659.25, 783.99, 1046.5];

// A short ascending four-note chime, created lazily on first use.
export function createChime() {
  let audio;
  return function play() {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    NOTES.forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + i * .13;
      o.frequency.value = f;
      g.gain.setValueAtTime(.001, t);
      g.gain.linearRampToValueAtTime(.04, t + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + .65);
      o.connect(g);
      g.connect(audio.destination);
      o.start(t);
      o.stop(t + .7);
    });
  };
}
