import type { Cue } from "../types";

// 查找引用了某盏灯具的全部 Cue（保持列表顺序）
export function findCuesReferencing(cues: Cue[], fixtureId: string): Cue[] {
  return cues.filter((cue) => cue.fixtureIds.includes(fixtureId));
}

export interface RemoveCheck {
  blocked: boolean;
  relatedCues: Cue[];
}

// 移除前置校验：只要存在引用就挡住移除
export function checkRemoveFixture(
  cues: Cue[],
  fixtureId: string,
): RemoveCheck {
  const relatedCues = findCuesReferencing(cues, fixtureId);
  return { blocked: relatedCues.length > 0, relatedCues };
}

export function canRemoveFixture(cues: Cue[], fixtureId: string): boolean {
  return findCuesReferencing(cues, fixtureId).length === 0;
}

// 新增 Cue：追加到队尾，序号天然连续
export function createCue(cues: Cue[], seq: number): Cue {
  return {
    id: `c-${seq}-${Date.now().toString(36)}`,
    name: `新 Cue ${cues.length + 1}`,
    note: "",
    fixtureIds: [],
  };
}

// 上下移动：越界时返回原数组；移动后顺序仍连续
export function moveCue(cues: Cue[], index: number, direction: -1 | 1): Cue[] {
  const target = index + direction;
  if (target < 0 || target >= cues.length) return cues;
  const next = cues.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function renameCue(cues: Cue[], index: number, name: string): Cue[] {
  const trimmed = name.trim();
  if (!trimmed) return cues;
  return cues.map((cue, i) => (i === index ? { ...cue, name: trimmed } : cue));
}

// Cue 序号始终等于“当前下标 + 1”，新增/删除/排序后自动保持连续
export function cueLabel(index: number): string {
  return `Cue ${index + 1}`;
}
