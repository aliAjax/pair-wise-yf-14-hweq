// 规则层：Cue 规则——新增、改名、排序（序号始终连续）、场景电平。
import type { Cue, Fixture } from "../data/types";
import { clampLevel } from "./limits";

let idCounter = 0;
export function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** 按当前数组顺序重排序号，保证从 1 开始连续。 */
export function renumber(cues: readonly Cue[]): Cue[] {
  return cues.map((cue, index) =>
    cue.no === index + 1 ? cue : { ...cue, no: index + 1 },
  );
}

/** 新增 Cue，追加到列表末尾并续号。新场景不带任何灯具电平。 */
export function addCue(cues: readonly Cue[], name?: string): Cue[] {
  const cue: Cue = {
    id: createId("cue"),
    no: cues.length + 1,
    name: name?.trim() || `Cue ${cues.length + 1} 新场景`,
    note: "",
    levels: {},
  };
  return [...cues, cue];
}

/** 改名（空名回退为序号占位，避免列表出现空白）。 */
export function renameCue(
  cues: readonly Cue[],
  cueId: string,
  name: string,
): Cue[] {
  return cues.map((c) =>
    c.id === cueId
      ? { ...c, name: name.trim() || `Cue ${c.no}` }
      : c,
  );
}

export function updateCueNote(
  cues: readonly Cue[],
  cueId: string,
  note: string,
): Cue[] {
  return cues.map((c) => (c.id === cueId ? { ...c, note } : c));
}

function move(cues: readonly Cue[], from: number, to: number): Cue[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= cues.length ||
    to >= cues.length
  ) {
    return [...cues];
  }
  const copy = [...cues];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return renumber(copy);
}

export function moveCueUp(cues: readonly Cue[], cueId: string): Cue[] {
  const from = cues.findIndex((c) => c.id === cueId);
  return move(cues, from, from - 1);
}

export function moveCueDown(cues: readonly Cue[], cueId: string): Cue[] {
  const from = cues.findIndex((c) => c.id === cueId);
  return move(cues, from, from + 1);
}

/** 在某条 Cue 中写入灯具电平（0 仍保留引用，删除引用由移除灯具时统一拦截）。 */
export function setCueLevel(
  cues: readonly Cue[],
  cueId: string,
  fixtureId: string,
  level: number,
): Cue[] {
  return cues.map((c) =>
    c.id === cueId
      ? { ...c, levels: { ...c.levels, [fixtureId]: clampLevel(level) } }
      : c,
  );
}

/** 从 Cue 中摘掉某灯具引用（仅在灯具确认移除时使用，正常排演不暴露）。 */
export function detachFixtureFromCues(
  cues: readonly Cue[],
  fixtureId: string,
): Cue[] {
  return cues.map((c) => {
    if (!Object.prototype.hasOwnProperty.call(c.levels, fixtureId)) return c;
    const levels = { ...c.levels };
    delete levels[fixtureId];
    return { ...c, levels };
  });
}

/** 从某条 Cue 中摘除某灯具引用（场景面板内使用；删灯具仍受引用保护拦截）。 */
export function detachCueLevel(
  cues: readonly Cue[],
  cueId: string,
  fixtureId: string,
): Cue[] {
  return cues.map((c) => {
    if (c.id !== cueId) return c;
    if (!Object.prototype.hasOwnProperty.call(c.levels, fixtureId)) return c;
    const levels = { ...c.levels };
    delete levels[fixtureId];
    return { ...c, levels };
  });
}

/** 当前场景中某灯具的有效电平；未被该 Cue 引用时为 null（熄灭）。 */
export function activeLevel(cue: Cue | undefined, fixtureId: string): number | null {
  if (!cue) return null;
  const raw = cue.levels[fixtureId];
  return typeof raw === "number" ? clampLevel(raw) : null;
}

/** 当前场景点亮的灯具，按通道排序。 */
export function activeFixtures(
  cue: Cue | undefined,
  fixtures: readonly Fixture[],
): Array<{ fixture: Fixture; level: number }> {
  if (!cue) return [];
  return fixtures
    .map((fixture) => {
      const level = activeLevel(cue, fixture.id);
      return level === null ? null : { fixture, level };
    })
    .filter((item): item is { fixture: Fixture; level: number } => item !== null)
    .sort((a, b) => a.fixture.channel - b.fixture.channel);
}
