// 规则层：灯位图几何规则——焦点必须落在舞台台面内。
import { STAGE_MAP } from "../data/layout";
import type { Point } from "../data/types";

/** 把焦点限制在舞台台面内。 */
export function clampFocusToStage(point: Point): Point {
  const { stage } = STAGE_MAP;
  return {
    x: Math.min(stage.x + stage.width, Math.max(stage.x, Math.round(point.x))),
    y: Math.min(stage.y + stage.height, Math.max(stage.y, Math.round(point.y))),
  };
}
