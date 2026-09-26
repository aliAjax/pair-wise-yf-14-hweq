// 规则层：灯具相关规则——筛选、通道唯一性、Cue 引用关系、移除保护。
import type { Cue, Fixture, LightPosition } from "../data/types";
import { clampChannel } from "./limits";

export interface ChannelIssue {
  valid: boolean;
  /** 与现有通道冲突的灯具（不含被编辑者自身） */
  conflict?: Fixture;
}

/** 按光位筛选灯具；"全部" 返回全集。 */
export function filterFixtures(
  fixtures: readonly Fixture[],
  filter: LightPosition | "全部",
): Fixture[] {
  if (filter === "全部") return [...fixtures];
  return fixtures.filter((f) => f.position === filter);
}

/** 校验通道号：范围 1–512 且全台唯一。 */
export function checkChannel(
  fixtures: readonly Fixture[],
  channel: number,
  selfId?: string,
): ChannelIssue {
  const value = clampChannel(channel);
  const conflict = fixtures.find(
    (f) => f.channel === value && f.id !== selfId,
  );
  return { valid: conflict === undefined, conflict };
}

/** 找出引用某灯具的全部 Cue（levels 中含该 fixtureId）。 */
export function cuesReferencingFixture(
  cues: readonly Cue[],
  fixtureId: string,
): Cue[] {
  return cues.filter((c) =>
    Object.prototype.hasOwnProperty.call(c.levels, fixtureId),
  );
}

/**
 * 尝试移除灯具。
 * 若有 Cue 引用：拒绝移除，返回原列表与相关 Cue（界面需列出并挡住操作）。
 * 若无人引用：移除后返回新列表。
 */
export function removeFixture(
  fixtures: readonly Fixture[],
  cues: readonly Cue[],
  fixtureId: string,
): { ok: boolean; fixtures: Fixture[]; blockingCues: Cue[] } {
  const blockingCues = cuesReferencingFixture(cues, fixtureId);
  if (blockingCues.length > 0) {
    // 原灯具与 Cue 顺序全部保留：直接返回原引用。
    return { ok: false, fixtures: [...fixtures], blockingCues };
  }
  return {
    ok: true,
    fixtures: fixtures.filter((f) => f.id !== fixtureId),
    blockingCues: [],
  };
}

/** 生成不与现有灯具冲突的新编号，如 FOH-04。 */
export function nextFixtureCode(
  fixtures: readonly Fixture[],
  position: LightPosition,
): string {
  const prefixByPosition: Record<LightPosition, string> = {
    面光: "FOH",
    侧光: "SL",
    逆光: "BL",
    效果光: "FX",
  };
  const prefix = prefixByPosition[position];
  let max = 0;
  for (const f of fixtures) {
    const match = f.code.match(/^[A-Z]+-?(\d+)$/);
    if (f.code.startsWith(prefix) && match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `${prefix}-${String(max + 1).padStart(2, "0")}`;
}

/** 分配一个未占用通道，优先从给定值开始顺延。 */
export function nextFreeChannel(
  fixtures: readonly Fixture[],
  preferred = 1,
): number {
  const used = new Set(fixtures.map((f) => f.channel));
  let ch = clampChannel(preferred);
  while (used.has(ch)) ch = ch >= 512 ? 1 : ch + 1;
  return ch;
}
