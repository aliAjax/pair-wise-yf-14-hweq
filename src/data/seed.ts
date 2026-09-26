import type { Cue, DraftState, Fixture, Gel } from "./types";

// 色片表：色片编码与名称、颜色的唯一数据来源，灯具只保存 gelCode。
export const GELS: readonly Gel[] = [
  { code: "无", name: "白光（无色片）", color: "#fff7e6" },
  { code: "L201", name: "全CTB 冷蓝", color: "#4f8cff" },
  { code: "L202", name: "半CTB 浅蓝", color: "#9cc4ff" },
  { code: "L158", name: "深橙", color: "#ff7a1a" },
  { code: "L164", name: "烛光暖橙", color: "#ffb347" },
  { code: "L117", name: "特蓝", color: "#2748c9" },
  { code: "L139", name: "艳红", color: "#e11d48" },
  { code: "L343", name: "翡翠绿", color: "#10b981" },
  { code: "L736", name: "薰衣草紫", color: "#a78bfa" },
];

export const gelByCode = (code: string): Gel =>
  GELS.find((g) => g.code === code) ?? GELS[0];

// 舞台平面灯位种子：灯具安装点分布在观众厅（面光）、两侧（侧光/逆光）、台顶（效果光），
// 焦点落在舞台表演区内。坐标用于 SVG 灯位图（viewBox 1000×640）。
const SEED_FIXTURES: Fixture[] = [
  // 面光（FOH，观众厅顶部，向舞台打正面光）
  { id: "fx-foh-01", code: "FOH-01", position: "面光", channel: 1, gelCode: "无", location: { x: 200, y: 540 }, focus: { x: 250, y: 350 }, preset: 80, focusPending: false },
  { id: "fx-foh-02", code: "FOH-02", position: "面光", channel: 2, gelCode: "无", location: { x: 500, y: 560 }, focus: { x: 500, y: 360 }, preset: 80, focusPending: false },
  { id: "fx-foh-03", code: "FOH-03", position: "面光", channel: 3, gelCode: "L164", location: { x: 800, y: 540 }, focus: { x: 760, y: 400 }, preset: 60, focusPending: true },

  // 侧光（舞台两侧灯架）
  { id: "fx-sl-01", code: "SL-L1", position: "侧光", channel: 21, gelCode: "L201", location: { x: 60, y: 300 }, focus: { x: 360, y: 300 }, preset: 65, focusPending: false },
  { id: "fx-sl-02", code: "SL-L2", position: "侧光", channel: 22, gelCode: "L202", location: { x: 60, y: 180 }, focus: { x: 400, y: 200 }, preset: 55, focusPending: false },
  { id: "fx-sl-03", code: "SL-R1", position: "侧光", channel: 23, gelCode: "L201", location: { x: 940, y: 300 }, focus: { x: 640, y: 300 }, preset: 65, focusPending: true },
  { id: "fx-sl-04", code: "SL-R2", position: "侧光", channel: 24, gelCode: "L139", location: { x: 940, y: 180 }, focus: { x: 600, y: 200 }, preset: 40, focusPending: false },

  // 逆光（台口内后区灯杆）
  { id: "fx-bl-01", code: "BL-01", position: "逆光", channel: 41, gelCode: "L736", location: { x: 300, y: 70 }, focus: { x: 330, y: 260 }, preset: 70, focusPending: false },
  { id: "fx-bl-02", code: "BL-02", position: "逆光", channel: 42, gelCode: "L736", location: { x: 500, y: 60 }, focus: { x: 500, y: 250 }, preset: 70, focusPending: false },
  { id: "fx-bl-03", code: "BL-03", position: "逆光", channel: 43, gelCode: "L117", location: { x: 700, y: 70 }, focus: { x: 670, y: 260 }, preset: 50, focusPending: false },

  // 效果光（追光、定点、染色）
  { id: "fx-ef-01", code: "FX-SPOT", position: "效果光", channel: 61, gelCode: "无", location: { x: 500, y: 600 }, focus: { x: 500, y: 330 }, preset: 90, focusPending: true },
  { id: "fx-ef-02", code: "FX-WASH", position: "效果光", channel: 62, gelCode: "L343", location: { x: 150, y: 100 }, focus: { x: 240, y: 330 }, preset: 35, focusPending: false },
];

const SEED_CUES: Cue[] = [
  {
    id: "cue-seed-1",
    no: 1,
    name: "开场冷蓝侧光",
    note: "二幕开场，演员未上场前建立",
    levels: {
      "fx-sl-01": 65,
      "fx-sl-02": 40,
      "fx-sl-03": 65,
      "fx-bl-03": 25,
      "fx-ef-02": 20,
    },
  },
  {
    id: "cue-seed-2",
    no: 2,
    name: "追光入场",
    note: "FOH-03 焦点门口，需演员走位确认",
    levels: {
      "fx-foh-03": 60,
      "fx-ef-01": 90,
      "fx-bl-02": 20,
      "fx-sl-01": 30,
    },
  },
  {
    id: "cue-seed-3",
    no: 3,
    name: "暖色谢幕",
    note: "版本B：全台面光收在 80%",
    levels: {
      "fx-foh-01": 80,
      "fx-foh-02": 80,
      "fx-foh-03": 75,
      "fx-sl-02": 30,
      "fx-bl-01": 45,
      "fx-bl-02": 45,
      "fx-ef-01": 60,
    },
  },
];

export const STORAGE_KEY = "rehearsal-draft:hxyfront-62002:v1";

export function createInitialDraft(): DraftState {
  return {
    showTitle: "《未命名剧目》排演稿",
    versionNote: "首版排演 · 待导演确认追光焦点",
    fixtures: SEED_FIXTURES,
    cues: SEED_CUES,
    selectedCueId: SEED_CUES[0].id,
    selectedFixtureId: "fx-sl-01",
    filter: "全部",
    updatedAt: new Date().toISOString(),
  };
}
