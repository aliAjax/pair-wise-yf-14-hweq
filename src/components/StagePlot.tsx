import { useRef, useState } from "react";
import type { Fixture, Point } from "../types";
import { positionName } from "../data/positions";
import {
  beamOpacity,
  beamPoints,
  fixtureColor,
  sourceAnchor,
} from "../rules/lighting";

interface StagePlotProps {
  fixtures: Fixture[]; // 已按光位筛选
  activeIds: Set<string>; // 当前场景中点亮的灯具
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragFocus: (id: string, point: Point) => void;
}

const VIEW = 116; // viewBox 边长（-8 ~ 108），给灯架留边
const clamp = (v: number) => Math.max(2, Math.min(98, v));

export default function StagePlot({
  fixtures,
  activeIds,
  selectedId,
  onSelect,
  onDragFocus,
}: StagePlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const toStagePoint = (clientX: number, clientY: number): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: clamp(-8 + (VIEW * (clientX - rect.left)) / rect.width),
      y: clamp(-8 + (VIEW * (clientY - rect.top)) / rect.height),
    };
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragId) return;
    onDragFocus(dragId, toStagePoint(e.clientX, e.clientY));
  };

  return (
    <div className="stage-wrap">
      <svg
        ref={svgRef}
        className="stage-svg"
        viewBox="-8 -8 116 116"
        onPointerMove={handleMove}
        onPointerUp={() => setDragId(null)}
        onPointerLeave={() => setDragId(null)}
      >
        {/* 舞台地面与分区 */}
        <rect x={0} y={0} width={100} height={100} rx={1.5} className="stage-floor" />
        <rect x={2} y={62} width={96} height={36} className="stage-zone zone-front" />
        <rect x={2} y={30} width={96} height={32} className="stage-zone zone-mid" />
        <rect x={2} y={2} width={96} height={28} className="stage-zone zone-back" />
        <line x1={0} y1={50} x2={100} y2={50} className="stage-axis" />
        <line x1={50} y1={0} x2={50} y2={100} className="stage-axis" />
        <text x={50} y={96.5} textAnchor="middle" className="stage-label">
          台前（观众席）
        </text>
        <text x={50} y={5.2} textAnchor="middle" className="stage-label">
          天幕
        </text>
        <text x={2.5} y={50} textAnchor="start" className="stage-label" transform="rotate(-90 2.5 50)">
          上场门
        </text>
        <text x={97.5} y={50} textAnchor="end" className="stage-label" transform="rotate(90 97.5 50)">
          下场门
        </text>

        {/* 灯架 / 灯杆 */}
        <line x1={-4} y1={104} x2={104} y2={104} className="rig-bar" />
        <line x1={-4} y1={-4} x2={104} y2={-4} className="rig-bar" />
        <line x1={-4} y1={4} x2={-4} y2={96} className="rig-bar" />
        <line x1={104} y1={4} x2={104} y2={96} className="rig-bar" />

        {/* 当前场景光束（仅画筛选后可见的灯） */}
        {fixtures
          .filter((f) => activeIds.has(f.id))
          .map((f) => (
            <polygon
              key={`beam-${f.id}`}
              points={beamPoints(f)}
              fill={fixtureColor(f)}
              opacity={beamOpacity(f)}
              className="beam"
            />
          ))}

        {/* 灯具：灯位锚点 + 焦点圆点 */}
        {fixtures.map((f) => {
          const anchor = sourceAnchor(f);
          const active = activeIds.has(f.id);
          const selected = f.id === selectedId;
          const color = fixtureColor(f);
          return (
            <g key={f.id} className={active ? "fixture is-active" : "fixture"}>
              <rect
                x={anchor.x - 1.7}
                y={anchor.y - 1.7}
                width={3.4}
                height={3.4}
                className="fixture-anchor"
              />
              {selected && (
                <line
                  x1={anchor.x}
                  y1={anchor.y}
                  x2={f.focus.x}
                  y2={f.focus.y}
                  className="fixture-axis"
                />
              )}
              <circle
                cx={f.focus.x}
                cy={f.focus.y}
                r={selected ? 3.4 : active ? 2.8 : 2.2}
                fill={color}
                stroke={selected ? "#ffffff" : active ? "#fde68a" : "#94a3b8"}
                strokeWidth={selected ? 0.9 : 0.5}
                className="fixture-focus"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelect(f.id);
                  setDragId(f.id);
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                }}
              >
                <title>{`${f.no} · ${positionName(f.position)} · CH${f.channel} · ${f.intensity}%`}</title>
              </circle>
              {selected && (
                <text x={f.focus.x} y={f.focus.y - 4.4} textAnchor="middle" className="fixture-tag">
                  {f.no}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="stage-hint">点圆点选中灯具，可直接拖动调整焦点；光晕为当前 Cue 点亮效果</p>
    </div>
  );
}
