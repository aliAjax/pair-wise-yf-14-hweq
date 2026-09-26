import type { Cue } from "../types";
import { cueLabel } from "../rules/cueRules";

interface RemoveBlockedDialogProps {
  fixtureNo: string;
  relatedCues: Cue[];
  cueIndexOf: (cueId: string) => number;
  onClose: () => void;
}

// 移除被 Cue 引用的灯具时弹出：列出相关 Cue 并挡住操作
export default function RemoveBlockedDialog({
  fixtureNo,
  relatedCues,
  cueIndexOf,
  onClose,
}: RemoveBlockedDialogProps) {
  return (
    <div className="dialog-mask" onClick={onClose}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label="无法移除灯具"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>无法移除 {fixtureNo}</h2>
        <p>以下 Cue 正在引用这盏灯，请先在这些 Cue 中调整后再移除：</p>
        <ul className="dialog-cues">
          {relatedCues.map((cue) => (
            <li key={cue.id}>
              <b>{cueLabel(cueIndexOf(cue.id))}</b>
              <span>{cue.name}</span>
            </li>
          ))}
        </ul>
        <button className="primary" onClick={onClose}>
          知道了
        </button>
      </div>
    </div>
  );
}
