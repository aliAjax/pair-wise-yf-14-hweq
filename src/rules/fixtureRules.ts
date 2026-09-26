import type { Fixture, PositionId } from "../types";

export const CHANNEL_MIN = 1;
export const CHANNEL_MAX = 512;
export const INTENSITY_MIN = 0;
export const INTENSITY_MAX = 100;

// 通道号合法性
export function isValidChannel(channel: number): boolean {
  return Number.isInteger(channel) && channel >= CHANNEL_MIN && channel <= CHANNEL_MAX;
}

// 同一通道号只能被一盏灯占用（排除自身）
export function findChannelConflict(
  fixtures: Fixture[],
  channel: number,
  selfId: string,
): Fixture | undefined {
  return fixtures.find((f) => f.id !== selfId && f.channel === channel);
}

// 按光位筛选；位置为 null 表示全部
export function filterFixtures(
  fixtures: Fixture[],
  position: PositionId | null,
): Fixture[] {
  return position === null ? fixtures : fixtures.filter((f) => f.position === position);
}
