// 数据层：领域类型定义。规则层与界面层共同引用，不在此写任何业务逻辑。

/** 光位（灯具分组依据，也是筛选项） */
export type LightPosition = "面光" | "侧光" | "逆光" | "效果光";

export const LIGHT_POSITIONS: readonly LightPosition[] = [
  "面光",
  "侧光",
  "逆光",
  "效果光",
];

/** 灯位图坐标（SVG 用户坐标系，viewBox 为 1000 × 640） */
export interface Point {
  x: number;
  y: number;
}

/** 色片条目 */
export interface Gel {
  code: string;
  name: string;
  color: string;
}

/** 灯具 */
export interface Fixture {
  id: string;
  /** 灯具编号，如 FOH-03 */
  code: string;
  position: LightPosition;
  /** DMX 通道号 1–512，全台唯一 */
  channel: number;
  /** 当前色片编码，对应 Gel.code */
  gelCode: string;
  /** 灯具在灯位图上的安装位置 */
  location: Point;
  /** 焦点位置（舞台面上） */
  focus: Point;
  /** 亮度预设 0–100，加入新 Cue 时作为初始亮度 */
  preset: number;
  /** 焦点是否待演员走位确认 */
  focusPending: boolean;
}

/** 一条 Cue：灯具在该场景中的触发电平 */
export interface Cue {
  id: string;
  /** 序号，随排序始终连续（由规则层 renumber 维护） */
  no: number;
  name: string;
  note: string;
  /** fixtureId → 电平 0–100；键存在即代表该 Cue 引用此灯具 */
  levels: Record<string, number>;
}

/** 排演模式本地草稿（整体持久化到 localStorage） */
export interface DraftState {
  showTitle: string;
  versionNote: string;
  fixtures: Fixture[];
  cues: Cue[];
  selectedCueId: string | null;
  selectedFixtureId: string | null;
  /** 当前光位筛选，"全部" 不过滤 */
  filter: LightPosition | "全部";
  /** 最近一次实质编辑时间（ISO），选择操作不刷新 */
  updatedAt: string;
}
