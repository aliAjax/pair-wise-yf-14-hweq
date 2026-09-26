import { useEffect, useState } from "react";
import type { Cue } from "../types";
import { cueLabel } from "../rules/cueRules";

interface CueListProps {
  cues: Cue[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRename: (index: number, name: string) => void;
  onAdd: () => void;
}

export default function CueList({
  cues,
  activeIndex,
  onSelect,
  onMove,
  onRename,
  onAdd,
}: CueListProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    // 列表变化后退出编辑态，避免下标错位
    setEditing(null);
  }, [cues.length]);

  const commit = (index: number) => {
    onRename(index, draftName);
    setEditing(null);
  };

  return (
    <section className="panel cue-panel">
      <div className="heading">
        <div>
          <p>触发顺序</p>
          <h2>Cue 列表</h2>
        </div>
        <button className="primary" onClick={onAdd}>
          + 新增 Cue
        </button>
      </div>

      <ol className="cue-list">
        {cues.map((cue, index) => (
          <li
            key={cue.id}
            className={index === activeIndex ? "cue-item is-active" : "cue-item"}
            onClick={() => onSelect(index)}
          >
            <b className="cue-no">{cueLabel(index)}</b>
            <div className="cue-body">
              {editing === index ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => commit(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit(index);
                    if (e.key === "Escape") setEditing(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h3
                  title="双击改名"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditing(index);
                    setDraftName(cue.name);
                  }}
                >
                  {cue.name}
                </h3>
              )}
              <p>
                {cue.note ? `${cue.note} · ` : ""}
                {cue.fixtureIds.length} 盏灯
              </p>
            </div>
            <div className="cue-ops" onClick={(e) => e.stopPropagation()}>
              <button
                aria-label="上移"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
              >
                ↑
              </button>
              <button
                aria-label="下移"
                disabled={index === cues.length - 1}
                onClick={() => onMove(index, 1)}
              >
                ↓
              </button>
              <button
                aria-label="改名"
                onClick={() => {
                  setEditing(index);
                  setDraftName(cue.name);
                }}
              >
                改名
              </button>
            </div>
          </li>
        ))}
      </ol>
      {cues.length === 0 && <p className="empty-hint">还没有 Cue，点击右上角新增。</p>}
    </section>
  );
}
