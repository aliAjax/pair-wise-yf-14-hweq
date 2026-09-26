import { useEffect, useState } from "react";
import type { RehearsalModel } from "../model/useRehearsal";

interface CueListProps {
  model: RehearsalModel;
}

/** Cue 列表：序号始终连续，可新增、改名、上移/下移排序。 */
export function CueList({ model }: CueListProps) {
  const { cues, selectedCueId } = model.draft;
  const selectedIndex = cues.findIndex((c) => c.id === selectedCueId);

  return (
    <section className="panel cue-panel">
      <div className="heading">
        <div>
          <p>触发顺序</p>
          <h2>Cue 列表</h2>
        </div>
        <button className="primary" onClick={model.appendCue}>
          ＋ 新增 Cue
        </button>
      </div>

      <ol className="cue-list">
        {cues.map((cue, index) => {
          const active = cue.id === selectedCueId;
          return (
            <li
              key={cue.id}
              className={active ? "cue-row active" : "cue-row"}
              onClick={() => model.selectCue(cue.id)}
            >
              <span className="cue-no">
                {String(cue.no).padStart(2, "0")}
              </span>
              <CueName
                name={cue.name}
                active={active}
                onCommit={(name) => model.renameSelectedOr(cue.id, name)}
                onSelect={() => model.selectCue(cue.id)}
              />
              <span className="cue-count">{Object.keys(cue.levels).length} 灯</span>
              <span className="cue-order">
                <button
                  aria-label={`将 ${cue.name} 上移`}
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    model.selectCue(cue.id);
                    model.moveSelectedCue(-1);
                  }}
                >
                  ↑
                </button>
                <button
                  aria-label={`将 ${cue.name} 下移`}
                  disabled={index === cues.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    model.selectCue(cue.id);
                    model.moveSelectedCue(1);
                  }}
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="list-hint">
        共 {cues.length} 条 · 当前第{" "}
        {selectedIndex >= 0 ? String(selectedIndex + 1).padStart(2, "0") : "--"} 条，
        上下移动后序号自动连续。
      </p>
    </section>
  );
}

/** 行内改名：失焦或回车提交，Esc 还原。 */
function CueName({
  name,
  active,
  onCommit,
  onSelect,
}: {
  name: string;
  active: boolean;
  onCommit: (name: string) => void;
  onSelect: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

  useEffect(() => {
    if (!editing) setDraftName(name);
  }, [name, editing]);

  if (!editing || !active) {
    return (
      <button
        className="cue-name"
        title={active ? "点击改名" : name}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
          if (active) {
            setDraftName(name);
            setEditing(true);
          }
        }}
      >
        {name}
      </button>
    );
  }

  const finish = () => {
    onCommit(draftName);
    setEditing(false);
  };

  return (
    <input
      className="cue-name-input"
      autoFocus
      value={draftName}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraftName(e.target.value)}
      onBlur={finish}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") finish();
        if (e.key === "Escape") {
          setDraftName(name);
          setEditing(false);
        }
      }}
    />
  );
}
