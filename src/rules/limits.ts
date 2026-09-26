// 规则层：与界面无关的纯函数与常量。组件和状态 Hook 只能通过这里改数据。

export const CHANNEL_MIN = 1;
export const CHANNEL_MAX = 512;
export const LEVEL_MIN = 0;
export const LEVEL_MAX = 100;

export function clampInt(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampChannel(channel: number): number {
  return clampInt(channel, CHANNEL_MIN, CHANNEL_MAX);
}

export function clampLevel(level: number): number {
  return clampInt(level, LEVEL_MIN, LEVEL_MAX);
}
