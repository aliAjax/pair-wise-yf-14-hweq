// 领域类型：灯光工作台的基础数据结构
export type PositionId = "front" | "side" | "back" | "fx";

export interface Position {
  id: PositionId;
  name: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Fixture {
  id: string;
  no: string; // 灯具编号
  position: PositionId; // 光位
  channel: number; // 通道号
  gelId: string; // 色片
  focus: Point; // 焦点（舞台平面坐标 0~100）
  intensity: number; // 亮度 0~100
}

export interface Cue {
  id: string;
  name: string;
  note: string;
  fixtureIds: string[];
}

export interface ShowProfile {
  title: string;
  versionNote: string;
}

export interface Draft {
  show: ShowProfile;
  fixtures: Fixture[];
  cues: Cue[];
  savedAt: number;
}

// Cue 在列表中的连续序号从 1 开始
export const cueNumber = (index: number): string =>
  `Cue ${index + 1}`;
