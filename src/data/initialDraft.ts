import type { Fixture, Cue, Draft } from "../types";

// 初始灯具：编号即“光位简写-序号”，坐标为舞台平面百分比（x：左→右，y：后→前）
export const INITIAL_FIXTURES: Fixture[] = [
  // 面光 FOH（观众厅顶部，舞台图下方）
  { id: "f-foh-01", no: "FOH-01", position: "front", channel: 11, gelId: "none", focus: { x: 22, y: 58 }, intensity: 70 },
  { id: "f-foh-02", no: "FOH-02", position: "front", channel: 12, gelId: "none", focus: { x: 40, y: 62 }, intensity: 70 },
  { id: "f-foh-03", no: "FOH-03", position: "front", channel: 13, gelId: "L205", focus: { x: 58, y: 62 }, intensity: 55 },
  { id: "f-foh-04", no: "FOH-04", position: "front", channel: 14, gelId: "none", focus: { x: 76, y: 58 }, intensity: 70 },

  // 侧光（舞台两侧灯架）
  { id: "f-s-01", no: "S-L1", position: "side", channel: 21, gelId: "L117", focus: { x: 42, y: 46 }, intensity: 65 },
  { id: "f-s-02", no: "S-L2", position: "side", channel: 22, gelId: "L201", focus: { x: 52, y: 40 }, intensity: 45 },
  { id: "f-s-03", no: "S-R1", position: "side", channel: 23, gelId: "L117", focus: { x: 58, y: 46 }, intensity: 65 },
  { id: "f-s-04", no: "S-R2", position: "side", channel: 24, gelId: "L201", focus: { x: 48, y: 40 }, intensity: 45 },

  // 逆光（舞台后沿灯杆）
  { id: "f-b-01", no: "B-01", position: "back", channel: 31, gelId: "L161", focus: { x: 26, y: 30 }, intensity: 60 },
  { id: "f-b-02", no: "B-02", position: "back", channel: 32, gelId: "L126", focus: { x: 50, y: 28 }, intensity: 60 },
  { id: "f-b-03", no: "B-03", position: "back", channel: 33, gelId: "L161", focus: { x: 74, y: 30 }, intensity: 60 },

  // 效果光
  { id: "f-x-01", no: "FX-01", position: "fx", channel: 41, gelId: "L106", focus: { x: 50, y: 50 }, intensity: 30 },
  { id: "f-x-02", no: "FX-02", position: "fx", channel: 42, gelId: "L159", focus: { x: 34, y: 72 }, intensity: 25 },
];

// 初始 Cue：序号即列表顺序，保持连续
export const INITIAL_CUES: Cue[] = [
  {
    id: "c-1",
    name: "开场静场",
    note: "二幕开场，冷蓝侧光打底",
    fixtureIds: ["f-s-01", "f-s-02", "f-s-03", "f-s-04"],
  },
  {
    id: "c-2",
    name: "主角登场",
    note: "追光入场，焦点跟门口走位",
    fixtureIds: ["f-foh-03", "f-x-01"],
  },
  {
    id: "c-3",
    name: "群戏暖色",
    note: "面光铺开，逆光托轮廓",
    fixtureIds: ["f-foh-01", "f-foh-02", "f-foh-03", "f-foh-04", "f-b-01", "f-b-02", "f-b-03"],
  },
  {
    id: "c-4",
    name: "暖色谢幕",
    note: "全台面光 80%，版本 B",
    fixtureIds: ["f-foh-01", "f-foh-02", "f-foh-03", "f-foh-04", "f-x-02"],
  },
];

export const INITIAL_DRAFT: Draft = {
  show: {
    title: "《夜航·二幕》灯光合成",
    versionNote: "联排 V3 · 重点确认二幕追光走位",
  },
  fixtures: INITIAL_FIXTURES,
  cues: INITIAL_CUES,
  savedAt: 0,
};
