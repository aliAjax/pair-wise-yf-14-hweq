import type { Draft } from "../types";
import { INITIAL_DRAFT } from "../data/initialDraft";

// 排演调整以本地草稿形式持久化在浏览器中
const STORAGE_KEY = "lighting-rehearsal-draft-v1";

export function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    // 结构兜底：字段缺失时回退到内置数据，避免脏数据导致页面崩溃
    return {
      show: { ...INITIAL_DRAFT.show, ...(parsed.show ?? {}) },
      fixtures: Array.isArray(parsed.fixtures) ? parsed.fixtures : INITIAL_DRAFT.fixtures,
      cues: Array.isArray(parsed.cues) ? parsed.cues : INITIAL_DRAFT.cues,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    };
  } catch {
    return INITIAL_DRAFT;
  }
}

export function saveDraft(draft: Draft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 隐私模式 / 配额受限时静默失败，不影响当前排演
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
