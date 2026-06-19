/* 遊戲狀態 + localStorage 持久化（鎖屏/重整不丟進度） */

const SAVE_KEY = "lulu_lib_save_v3";

const fresh = () => ({
  started: false,
  solved: {},        // sceneId -> true
  rewards: {},       // chapterKey -> 數字符文（主線 M1..M4）
  fragments: { main: false, A: false, B: false },
  hints: {},         // sceneId -> 已揭露提示數
  muted: false,
  finished: false,
});

export const state = load();

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Object.assign(fresh(), JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return fresh();
}

export function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
}

export function reset() {
  Object.assign(state, fresh());
  save();
}

export function isSolved(id) { return !!state.solved[id]; }

export function markSolved(id) {
  state.solved[id] = true;
  save();
}

export function grantReward(chapterKey, value) {
  state.rewards[chapterKey] = value;
  save();
}

export function earnFragment(which) {
  state.fragments[which] = true;
  save();
}

export function fragmentCount() {
  return Object.values(state.fragments).filter(Boolean).length;
}

export function allFragments() {
  return state.fragments.main && state.fragments.A && state.fragments.B;
}
