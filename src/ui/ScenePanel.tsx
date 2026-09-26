import { gelByCode } from "../data/seed";
import type { RehearsalModel } from "../model/useRehearsal";

interface ScenePanelProps {
  model: RehearsalModel;
}

/** 当前场景预览：随选中 Cue 与灯具调整实时更新（舞台图光束也由此驱动）。 */
export function ScenePanel({ model }: ScenePanelProps) {
  const { selectedCue, draft, selectedFixture } = model;

  if (!selectedCue) {
    return (
      <section className="panel scene-panel">
        <p className="empty-hint">还没有 Cue，先在右侧新增一条。</p>
      </section>
    );
  }

  const activeIds = new Set(Object.keys(selectedCue.levels));
  const inactive = draft.fixtures.filter((f) => !activeIds.has(f.id));
  const selectedInScene =
    selectedFixture && activeIds.has(selectedFixture.id);

  return (
    <section className="panel scene-panel">
      <div className="heading">
        <div>
          <p>当前场景预览</p>
          <h2>
            Cue {String(selectedCue.no).padStart(2, "0")} · {selectedCue.name}
          </h2>
        </div>
        <strong className="scene-count">
          {model.active.length} 盏亮灯
        </strong>
      </div>

      {selectedFixture && (
        <div className="scene-selected">
          <div className="scene-selected-head">
            <span
              className="gel-dot"
              style={{ background: gelByCode(selectedFixture.gelCode).color }}
            />
            <b>{selectedFixture.code}</b>
            <small>
              {selectedFixture.position} · CH{" "}
              {String(selectedFixture.channel).padStart(3, "0")}
            </small>
            {selectedInScene ? (
              <button
                className="ghost small"
                onClick={() => model.detachFromCurrentCue(selectedFixture.id)}
              >
                移出本场景
              </button>
            ) : (
              <button
                className="ghost small"
                onClick={model.attachSelectedFixture}
              >
                按预设 {selectedFixture.preset}% 加入
              </button>
            )}
          </div>
          {selectedInScene && (
            <label className="field">
              <span>
                本场景电平：{model.levelOf(selectedFixture.id)}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={model.levelOf(selectedFixture.id) ?? 0}
                onChange={(e) =>
                  model.setLevel(selectedFixture.id, Number(e.target.value))
                }
              />
            </label>
          )}
        </div>
      )}

      <ul className="scene-levels">
        {model.active.map(({ fixture, level }) => (
          <li key={fixture.id} className="scene-level-row">
            <button
              className="scene-level-name"
              onClick={() => model.selectFixture(fixture.id)}
            >
              <span
                className="gel-dot"
                style={{ background: gelByCode(fixture.gelCode).color }}
              />
              <b>{fixture.code}</b>
              <small>CH {String(fixture.channel).padStart(3, "0")}</small>
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={level}
              aria-label={`${fixture.code} 电平`}
              onChange={(e) =>
                model.setLevel(fixture.id, Number(e.target.value))
              }
            />
            <span className="level-num">{level}%</span>
          </li>
        ))}
        {model.active.length === 0 && (
          <li className="empty-hint">
            本场景还没挂灯：在左侧选灯后点「按预设加入」。
          </li>
        )}
      </ul>

      {inactive.length > 0 && (
        <details className="scene-inactive">
          <summary>本场景未用灯具（{inactive.length}）</summary>
          <div className="chips">
            {inactive.map((f) => (
              <button
                key={f.id}
                className="chip"
                onClick={() => {
                  model.selectFixture(f.id);
                  model.setLevel(f.id, f.preset);
                }}
              >
                {f.code} · 加{f.preset}%
              </button>
            ))}
          </div>
        </details>
      )}

      <label className="field">
        <span>本 Cue 备注（演出版本说明）</span>
        <textarea
          rows={2}
          value={selectedCue.note}
          placeholder="如：版本B，追光需演员走位确认"
          onChange={(e) => model.setCueNote(e.target.value)}
        />
      </label>
    </section>
  );
}
