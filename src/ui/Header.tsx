import type { RehearsalModel } from "../model/useRehearsal";

interface HeaderProps {
  model: RehearsalModel;
}

/** 顶部：演出名称、版本备注、排演统计与本地草稿状态。 */
export function Header({ model }: HeaderProps) {
  const { draft, saved } = model;
  const pendingFocus = draft.fixtures.filter((f) => f.focusPending).length;

  return (
    <header className="rehearsal-header">
      <div className="header-top">
        <div className="mode-tag">排演模式 · 本地草稿</div>
        <div className="header-actions">
          <span className={saved ? "save-state saved" : "save-state saving"}>
            {saved ? "草稿已保存" : "正在保存…"}
          </span>
          <button
            className="ghost"
            onClick={() => {
              if (window.confirm("放弃本地草稿、恢复出厂排演数据？")) {
                model.resetDraft();
              }
            }}
          >
            恢复示例
          </button>
        </div>
      </div>

      <input
        className="show-title-input"
        value={draft.showTitle}
        aria-label="演出名称"
        onChange={(e) => model.setShowTitle(e.target.value)}
      />
      <input
        className="version-input"
        value={draft.versionNote}
        aria-label="演出版本备注"
        placeholder="演出版本备注，如：第三幕联排 · 2026-09-26"
        onChange={(e) => model.setVersionNote(e.target.value)}
      />

      <div className="metrics">
        <Metric label="灯具数量" value={draft.fixtures.length} />
        <Metric label="Cue 数量" value={draft.cues.length} />
        <Metric
          label="当前场景"
          value={model.selectedCue ? `Q${model.selectedCue.no}` : "—"}
        />
        <Metric label="待确认焦点" value={pendingFocus} warn={pendingFocus > 0} />
      </div>
    </header>
  );
}

function Metric({
  label,
  value,
  warn,
}: {
  label: string;
  value: number | string;
  warn?: boolean;
}) {
  return (
    <article>
      <small>{label}</small>
      <strong className={warn ? "metric-warn" : undefined}>{value}</strong>
    </article>
  );
}
