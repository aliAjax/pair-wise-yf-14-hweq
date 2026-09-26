// 数据层：本地草稿持久化。只负责序列化/读取与结构兜底，不做业务规则。
import { createInitialDraft, STORAGE_KEY } from "./seed";
import type { DraftState } from "./types";

/** 读取本地草稿；缺失或损坏时回落到种子数据。 */
export function loadDraft(): DraftState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialDraft();
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    // 最起码要有灯具与 Cue 数组，否则视为损坏草稿。
    if (!Array.isArray(parsed.fixtures) || !Array.isArray(parsed.cues)) {
      return createInitialDraft();
    }
    return { ...createInitialDraft(), ...parsed } as DraftState;
  } catch {
    return createInitialDraft();
  }
}

export function saveDraft(draft: DraftState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 隐私模式或存储写满时静默失败，不影响当前页面操作。
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
