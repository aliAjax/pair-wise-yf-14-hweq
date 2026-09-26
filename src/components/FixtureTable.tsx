import type { Fixture } from "../types";
import { gelById } from "../data/gels";
import { positionName } from "../data/positions";
import { canRemoveFixture } from "../rules/cueRules";
import type { Cue } from "../types";

interface FixtureTableProps {
  fixtures: Fixture[]; // 已筛选
  cues: Cue[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function FixtureTable({
  fixtures,
  cues,
  selectedId,
  onSelect,
  onRemove,
}: FixtureTableProps) {
  return (
    <div className="fixture-table-wrap">
      <table className="fixture-table">
        <thead>
          <tr>
            <th>灯具编号</th>
            <th>光位</th>
            <th>通道</th>
            <th>色片</th>
            <th>焦点</th>
            <th>亮度</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((f) => {
            const gel = gelById(f.gelId);
            const removable = canRemoveFixture(cues, f.id);
            return (
              <tr
                key={f.id}
                className={f.id === selectedId ? "is-selected" : ""}
                onClick={() => onSelect(f.id)}
              >
                <td><b>{f.no}</b></td>
                <td>{positionName(f.position)}</td>
                <td>CH{f.channel}</td>
                <td>
                  <i className="gel-dot" style={{ background: gel.color }} />
                  {gel.name}
                </td>
                <td>({Math.round(f.focus.x)}, {Math.round(f.focus.y)})</td>
                <td>{f.intensity}%</td>
                <td>
                  <button
                    className="link-danger"
                    title={removable ? "移除该灯具" : "被 Cue 引用，点击查看详情"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(f.id);
                    }}
                  >
                    移除
                  </button>
                </td>
              </tr>
            );
          })}
          {fixtures.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-hint">该光位下暂无灯具。</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
