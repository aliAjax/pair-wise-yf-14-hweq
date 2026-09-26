import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { STAGE_MAP } from "../data/layout";
import { gelByCode } from "../data/seed";
import type { Fixture } from "../data/types";
import { clampFocusToStage } from "../rules/stage";

interface StageMapProps {
  fixtures: Fixture[];
  /** 按光位筛选后可见的灯具 id 集合 */
  visibleIds: ReadonlySet<string>;
  selectedId: string | null;
  /** 当前场景电平：fixtureId → level */
  levels: Readonly<Record<string, number>>;
  onSelect: (id: string) => void;
  onFocusChange: (id: string, point: { x: number; y: number }) => void;
}

const POSITION_LABEL: Record<Fixture["position"], string> = {
  面光: "面光桥（观众厅）",
  侧光: "侧光灯架",
  逆光: "逆光吊杆",
  效果光: "效果光位",
};

/**
 * 舞台平面灯位图：灯具位置、色片、光束（亮度=当前场景电平）、可拖拽焦点。
 */
export function StageMap({
  fixtures,
  visibleIds,
  selectedId,
  levels,
  onSelect,
  onFocusChange,
}: StageMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragId = useRef<string | null>(null);

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x =
      ((clientX - rect.left) / rect.width) * STAGE_MAP.width;
    const y =
      ((clientY - rect.top) / rect.height) * STAGE_MAP.height;
    return clampFocusToStage({ x, y });
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!dragId.current) return;
      event.preventDefault();
      onFocusChange(dragId.current, toSvgPoint(event.clientX, event.clientY));
    },
    [onFocusChange, toSvgPoint],
  );

  const stopDragging = useCallback(() => {
    dragId.current = null;
  }, []);

  const { stage, focusArea } = STAGE_MAP;

  return (
    <svg
      ref={svgRef}
      className="stage-map"
      viewBox={`0 0 ${STAGE_MAP.width} ${STAGE_MAP.height}`}
      role="img"
      aria-label="舞台平面灯位图"
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
    >
      <defs>
        <marker
          id="focus-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
        </marker>
        <radialGradient id="stage-floor" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#0b1220" />
        </radialGradient>
      </defs>

      {/* 剧场底 */}
      <rect x="0" y="0" width={STAGE_MAP.width} height={STAGE_MAP.height} fill="#060a14" />

      {/* 观众厅 */}
      <g>
        <rect x="60" y="520" width="880" height="100" rx="10" fill="#0f172a" stroke="#1e293b" />
        <text x="500" y="600" textAnchor="middle" className="map-note">观众厅</text>
        {[180, 340, 500, 660, 820].map((x) => (
          <ellipse key={x} cx={x} cy="556" rx="26" ry="12" fill="#1e293b" />
        ))}
      </g>

      {/* 舞台台面 */}
      <rect
        x={stage.x}
        y={stage.y}
        width={stage.width}
        height={stage.height}
        rx="8"
        fill="url(#stage-floor)"
        stroke="#334155"
      />
      <rect
        x={focusArea.x}
        y={focusArea.y}
        width={focusArea.width}
        height={focusArea.height}
        rx="6"
        fill="none"
        stroke="#1f3a5f"
        strokeDasharray="8 8"
      />
      <text x={stage.x + 14} y={stage.y + 26} className="map-note">舞台</text>
      <text x={focusArea.x + focusArea.width - 8} y={focusArea.y + focusArea.height - 10} textAnchor="end" className="map-note">
        表演区（焦点可拖入）
      </text>

      {/* 光束：当前场景点亮的灯具 */}
      <g>
        {fixtures.map((f) => {
          const level = levels[f.id];
          if (typeof level !== "number" || level <= 0) return null;
          const color = gelByCode(f.gelCode).color;
          const opacity = 0.05 + (level / 100) * 0.4;
          return (
            <polygon
              key={`beam-${f.id}`}
              points={beamPoints(f, level)}
              fill={color}
              opacity={opacity}
            />
          );
        })}
      </g>

      {/* 灯具 → 焦点连线 */}
      <g>
        {fixtures.map((f) => {
          const dim = visibleIds.has(f.id) ? 1 : 0.25;
          const active = typeof levels[f.id] === "number" && levels[f.id] > 0;
          return (
            <line
              key={`aim-${f.id}`}
              x1={f.location.x}
              y1={f.location.y}
              x2={f.focus.x}
              y2={f.focus.y}
              stroke={active ? "#fbbf24" : "#475569"}
              strokeWidth={f.id === selectedId ? 2.4 : 1.2}
              strokeDasharray={active ? "none" : "5 5"}
              markerEnd="url(#focus-arrow)"
              opacity={dim}
            />
          );
        })}
      </g>

      {/* 焦点标记（可拖拽） */}
      <g>
        {fixtures.map((f) => (
          <circle
            key={`focus-${f.id}`}
            className="focus-handle"
            cx={f.focus.x}
            cy={f.focus.y}
            r={f.id === selectedId ? 11 : 8}
            fill="#0b1220"
            stroke={f.focusPending ? "#f97316" : "#fbbf24"}
            strokeWidth={f.focusPending ? 3 : 2}
            strokeDasharray={f.focusPending ? "4 3" : undefined}
            opacity={visibleIds.has(f.id) ? 1 : 0.2}
            onPointerDown={(event) => {
              if (!visibleIds.has(f.id)) return;
              event.preventDefault();
              dragId.current = f.id;
              onSelect(f.id);
            }}
          >
            <title>{`${f.code} 焦点${f.focusPending ? "（待走位确认）" : ""}`}</title>
          </circle>
        ))}
      </g>

      {/* 灯具本体 */}
      <g>
        {fixtures.map((f) => {
          const selected = f.id === selectedId;
          const dim = visibleIds.has(f.id) ? 1 : 0.2;
          const level = levels[f.id];
          const gel = gelByCode(f.gelCode);
          return (
            <g
              key={f.id}
              className="fixture-marker"
              opacity={dim}
              onClick={() => visibleIds.has(f.id) && onSelect(f.id)}
            >
              <circle
                cx={f.location.x}
                cy={f.location.y}
                r={selected ? 15 : 12}
                fill={gel.color}
                stroke={selected ? "#ffffff" : "#94a3b8"}
                strokeWidth={selected ? 3 : 1.5}
              />
              {typeof level === "number" && level > 0 && (
                <circle cx={f.location.x} cy={f.location.y} r="4" fill="#0b1220" />
              )}
              <text
                x={f.location.x}
                y={f.location.y - 18}
                textAnchor="middle"
                className="fixture-tag"
              >
                {f.code}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** 按电平算光束三角：亮度越高，舞台落点光斑越大。 */
function beamPoints(f: Fixture, level: number): string {
  const spread = 18 + (level / 100) * 60;
  const dx = f.focus.x - f.location.x;
  const dy = f.focus.y - f.location.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * spread;
  const py = (dx / len) * spread;
  return [
    `${f.location.x},${f.location.y}`,
    `${f.focus.x + px},${f.focus.y + py}`,
    `${f.focus.x - px},${f.focus.y - py}`,
  ].join(" ");
}

export { POSITION_LABEL };
