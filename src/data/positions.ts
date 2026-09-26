import type { Position, PositionId } from "../types";

// 光位（筛选项），顺序即筛选条展示顺序
export const POSITIONS: Position[] = [
  { id: "front", name: "面光" },
  { id: "side", name: "侧光" },
  { id: "back", name: "逆光" },
  { id: "fx", name: "效果光" },
];

export const positionName = (id: PositionId): string =>
  POSITIONS.find((p) => p.id === id)?.name ?? id;
