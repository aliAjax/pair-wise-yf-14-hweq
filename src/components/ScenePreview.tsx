import type { Cue, Fixture } from "../types";
import { cueLabel } from "../rules/cueRules";
import {
  averageIntensity,
  beamOpacity,
  beamPoints,
  fixtureColor,
  sceneFixtures,
} from "../rules/lighting";

interface ScenePreviewProps {
  cue: Cue | null;
  cueIndex: number;
  fixtures: Fixture[];
}

// 当前场景预览：跟随选中 Cue 与灯具调整实时更新
export default function ScenePreview({ cue, cueIndex, fixtures }: ScenePreviewProps) {
  const lit = sceneFixtures(cue, fixtures);
  const avg = averageIntensity(lit);

  return (
    <section className="panel scene-panel">
      <div className="heading">
        <div>
          <p>当前场景</p>
          <h2>{cue ? `${cueLabel(cueIndex)} · ${cue.name}` : "未选择 Cue"}</h2>
        </div>
        <span className="scene-avg">平均亮度 {avg}%</span>
      </div>

      <svg className="scene-svg" viewBox="-8 -8 116 116">
        <rect x={0} y={0} width={100} height={100} rx={1.5} className="stage-floor" />
        {lit.map((f) => (
          <polygon
            key={`sbeam-${f.id}`}
            points={beamPoints(f)}
            fill={fixtureColor(f)}
            opacity={beamOpacity(f)}
          />
        ))}
        {lit.map((f) => (
          <circle
            key={`sdot-${f.id}`}
            cx={f.focus.x}
            cy={f.focus.y}
            r={2.4}
            fill={fixtureColor(f)}
            stroke="#fde68a"
            strokeWidth={0.5}
          />
        ))}
      </svg>

      <ul className="scene-readout">
        {lit.map((f) => (
          <li key={f.id}>
            <i style={{ background: fixtureColor(f) }} />
            <span>{f.no}</span>
            <em>CH{f.channel}</em>
            <b>{f.intensity}%</b>
          </li>
        ))}
        {lit.length === 0 && <li className="empty-hint">该 Cue 暂无灯具。</li>}
      </ul>
    </section>
  );
}
