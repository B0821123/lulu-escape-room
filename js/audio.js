/* 以 Web Audio 合成音效，免外部檔案。手機需首次點擊才能啟動。 */
import { state } from "./state.js";

let ctx = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, dur, when = 0, type = "sine", gain = 0.18) {
  const c = ac();
  if (!c || state.muted) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  tap()    { tone(520, 0.08, 0, "triangle", 0.08); },
  good()   { [660, 880, 1175].forEach((f, i) => tone(f, 0.22, i * 0.09, "sine", 0.14)); },
  bad()    { tone(180, 0.18, 0, "sawtooth", 0.12); tone(140, 0.22, 0.08, "sawtooth", 0.1); },
  unlock() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, i * 0.11, "sine", 0.13)); },
  // 摩斯：點/劃
  beep(long) { tone(700, long ? 0.34 : 0.12, 0, "sine", 0.2); },
};

export function ensureAudio() { ac(); }
