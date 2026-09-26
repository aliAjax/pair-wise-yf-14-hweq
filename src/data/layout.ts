// 数据层：灯位图舞台几何常量。舞台图与焦点拖拽共用同一组边界。
export const STAGE_MAP = {
  /** SVG 视图尺寸 */
  width: 1000,
  height: 640,
  /** 舞台台面矩形（含台唇） */
  stage: { x: 110, y: 90, width: 780, height: 420 },
  /** 后表演区（焦点默认落点范围） */
  focusArea: { x: 180, y: 170, width: 640, height: 280 },
} as const;
