import type { RemoveBlockedInfo } from "../model/useRehearsal";

interface RemoveBlockedDialogProps {
  info: RemoveBlockedInfo | null;
  onClose: () => void;
  onJumpCue: (cueId: string) => void;
}

/** 移除保护：灯具被 Cue 引用时列出相关 Cue 并挡住移除。 */
export function RemoveBlockedDialog({
  info,
  onClose,
  onJumpCue,
}: RemoveBlockedDialogProps) {
  if (!info) return null;
  const { fixture, cues } = info;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="blocked-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="blocked-title">无法移除 {fixture.code}</h3>
        <p>
          该灯具（CH {String(fixture.channel).padStart(3, "0")} ·{" "}
          {fixture.position}）仍被以下 <b>{cues.length}</b> 条 Cue 引用。
          灯具与 Cue 顺序均已原样保留，请先在这些场景中摘掉它再移除：
        </p>
        <ul className="blocked-list">
          {cues.map((cue) => (
            <li key={cue.id}>
              <span className="cue-no">{String(cue.no).padStart(2, "0")}</span>
              <button
                className="blocked-jump"
                onClick={() => {
                  onJumpCue(cue.id);
                  onClose();
                }}
              >
                {cue.name}
                <small>本场景电平 {cue.levels[fixture.id]}%</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="primary" onClick={onClose} autoFocus>
            知道了，保留灯具
          </button>
        </div>
      </div>
    </div>
  );
}
