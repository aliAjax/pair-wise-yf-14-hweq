import type { Cue, Fixture, Point } from "../types";
import { gelById } from "../data/gels";

// 把色片色转成带透明度的 rgba，用于光束与亮度叠加
export function hexWithAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 灯具在舞台平面上的出光位置（灯架/灯杆锚点），由光位推断
export function sourceAnchor(fixture: Fixture): Point {
  const { focus, position, no, channel } = fixture;
  switch (position) {
    case "front":
      return { x: focus.x, y: 105 };
    case "back":
      return { x: focus.x, y: -5 };
    case "side": {
      const fromLeft = no.includes("L") || (!no.includes("R") && channel % 2 === 0);
      return { x: fromLeft ? -5 : 105, y: focus.y };
    }
    case "fx":
    default:
      return { x: 50, y: -5 };
  }
}

// 光束：从光源（窄）向焦点（宽）展开的四边形，坐标为舞台百分比
export function beamPoints(fixture: Fixture, spread = 8): string {
  const s = sourceAnchor(fixture);
  const t = fixture.focus;
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  // 垂直于光轴的单位向量
  const px = -dy / len;
  const py = dx / len;
  const head = 1.4;
  const tail = spread;
  const pts: Point[] = [
    { x: s.x + px * head, y: s.y + py * head },
    { x: s.x - px * head, y: s.y - py * head },
    { x: t.x - px * tail, y: t.y - py * tail },
    { x: t.x + px * tail, y: t.y + py * tail },
  ];
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

// 亮度映射到光束不透明度
export function beamOpacity(fixture: Fixture): number {
  return 0.08 + (fixture.intensity / 100) * 0.5;
}

// 当前场景：取 Cue 中仍然存在的灯具（草稿里灯可能已删，做防御过滤）
export function sceneFixtures(cue: Cue | null, fixtures: Fixture[]): Fixture[] {
  if (!cue) return [];
  const map = new Map(fixtures.map((f) => [f.id, f]));
  return cue.fixtureIds
    .map((id) => map.get(id))
    .filter((f): f is Fixture => Boolean(f));
}

// 场景平均亮度，用于预览区读数
export function averageIntensity(list: Fixture[]): number {
  if (list.length === 0) return 0;
  return Math.round(list.reduce((sum, f) => sum + f.intensity, 0) / list.length);
}

export function fixtureColor(fixture: Fixture): string {
  return gelById(fixture.gelId).color;
}
