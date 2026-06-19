/* 以 Web Audio 合成音效，免外部檔案。手機需首次點擊才能啟動。 */
import { state } from "./state.js";
import { config } from "./config.js";

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

/* ============================================================
   背景音樂：程式合成的循環環境音（緩慢和弦 pad ＋ 鈴聲琶音）
   音樂走專屬母線 musicBus；音效的 tone() 仍直接接 destination，
   故音樂壓低不影響音效音量。靜音由 musicBus.gain 控制（無縫）。
   ============================================================ */
const MUSIC_BASE = () => (config.music?.volume ?? 0.07);
const BAR = 6;                              // 每個和弦約 6 秒
/* 暖而帶懷舊感的 Am – F – C – G（C 大調 vi–IV–I–V）；每組三個和弦音的頻率 */
const PROG = [
  [220.00, 261.63, 329.63],  // Am : A3 C4 E4
  [174.61, 220.00, 261.63],  // F  : F3 A3 C4
  [261.63, 329.63, 392.00],  // C  : C4 E4 G4
  [196.00, 246.94, 293.66],  // G  : G3 B3 D4
];

let musicBusNode = null;
let musicRunning = false;
let musicTimer = null;
let chordIdx = 0;

function musicBus() {
  const c = ac();
  if (!c) return null;
  if (!musicBusNode) {
    musicBusNode = c.createGain();
    musicBusNode.gain.value = state.muted ? 0 : MUSIC_BASE();
    musicBusNode.connect(c.destination);
  }
  return musicBusNode;
}

/* 柔和 pad：長 attack／長 release */
function padNote(freq, t0, dur) {
  const c = ac(), bus = musicBus();
  if (!c || !bus) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.5, t0 + 1.6);       // 緩慢淡入
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);    // 緩慢淡出
  osc.connect(g).connect(bus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/* 高一個八度的短鈴聲，更輕 */
function bellNote(freq, t0) {
  const c = ac(), bus = musicBus();
  if (!c || !bus) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq * 2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
  osc.connect(g).connect(bus);
  osc.start(t0);
  osc.stop(t0 + 1.7);
}

function step() {
  const c = ac();
  if (!c || !musicBus()) return;
  const t0 = c.currentTime + 0.05;
  const chord = PROG[chordIdx++ % PROG.length];
  chord.forEach(f => padNote(f, t0, BAR));
  // 2–3 顆隨機分布在這小節裡的鈴聲（取和弦音）
  const bells = 2 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < bells; i++) {
    const f = chord[Math.floor(Math.random() * chord.length)];
    bellNote(f, t0 + 0.4 + Math.random() * (BAR - 1.2));
  }
  musicTimer = setTimeout(step, BAR * 1000);
}

export function startMusic() {
  if (musicRunning || config.music?.enabled === false) return;
  if (!musicBus()) return;               // AudioContext 尚未可用（無使用者互動）
  musicRunning = true;
  if (typeof window !== "undefined") window.__musicRunning = true;
  chordIdx = 0;
  step();
}

export function stopMusic() {
  musicRunning = false;
  if (typeof window !== "undefined") window.__musicRunning = false;
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
}

export function setMusicMuted(muted) {
  const c = ac(), bus = musicBus();
  if (!c || !bus) return;
  const target = muted ? 0 : MUSIC_BASE();
  bus.gain.cancelScheduledValues(c.currentTime);
  bus.gain.setValueAtTime(bus.gain.value, c.currentTime);
  bus.gain.linearRampToValueAtTime(target, c.currentTime + 0.2);
}
