export interface Gel {
  id: string;
  name: string;
  color: string;
}

// 常用色片（Lee/Rosco 风格编号 + 中文俗称）
export const GELS: Gel[] = [
  { id: "none", name: "白光", color: "#f8fafc" },
  { id: "L201", name: "L201 全蓝", color: "#1d4ed8" },
  { id: "L117", name: "L117 特蓝", color: "#2563eb" },
  { id: "L161", name: "L161 蓝紫", color: "#6d28d9" },
  { id: "L126", name: "L126 淡紫", color: "#c4b5fd" },
  { id: "L106", name: "L106 正红", color: "#dc2626" },
  { id: "L778", name: "L778 橙红", color: "#f97316" },
  { id: "L205", name: "L205 半橙", color: "#fb923c" },
  { id: "L159", name: "L159 麦秆黄", color: "#facc15" },
  { id: "L101", name: "L101 黄", color: "#fde047" },
  { id: "L242", name: "L242 淡鲑红", color: "#fda4af" },
  { id: "R90", name: "R90 深黄绿", color: "#65a30d" },
  { id: "L735", name: "L735 维吉尼亚紫", color: "#7e22ce" },
];

export const gelById = (id: string): Gel =>
  GELS.find((g) => g.id === id) ?? GELS[0];
