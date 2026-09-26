import { useMemo } from "react";
import { Header } from "./ui/Header";
import { FixturePanel } from "./ui/FixturePanel";
import { StageMap } from "./ui/StageMap";
import { CueList } from "./ui/CueList";
import { ScenePanel } from "./ui/ScenePanel";
import { RemoveBlockedDialog } from "./ui/RemoveBlockedDialog";
import { useRehearsal } from "./model/useRehearsal";

function App() {
  const model = useRehearsal();

  // 舞台图只看当前 Cue 的电平；未选 Cue 时全暗。
  const levels = useMemo(
    () => model.selectedCue?.levels ?? {},
    [model.selectedCue],
  );
  const visibleIds = useMemo(
    () => new Set(model.visibleFixtures.map((f) => f.id)),
    [model.visibleFixtures],
  );

  return (
    <main className="app rehearsal">
      <Header model={model} />

      <div className="rehearsal-grid">
        <FixturePanel model={model} />

        <section className="panel stage-panel">
          <div className="heading">
            <div>
              <p>舞台平面灯位图</p>
              <h2>
                {model.selectedCue
                  ? `预览：Cue ${String(model.selectedCue.no).padStart(2, "0")} ${model.selectedCue.name}`
                  : "舞台灯位图"}
              </h2>
            </div>
            <span className="map-legend">
              <i className="legend-beam" /> 光束亮度 = 当前场景电平
              <i className="legend-focus" /> 橙圈 = 待确认焦点
            </span>
          </div>
          <StageMap
            fixtures={model.draft.fixtures}
            visibleIds={visibleIds}
            selectedId={model.selectedFixture?.id ?? null}
            levels={levels}
            onSelect={model.selectFixture}
            onFocusChange={model.changeFocus}
          />
          <ScenePanel model={model} />
        </section>

        <CueList model={model} />
      </div>

      <RemoveBlockedDialog
        info={model.removeBlocked}
        onClose={model.closeRemoveBlocked}
        onJumpCue={(cueId) => {
          model.selectCue(cueId);
          const cue = model.draft.cues.find((c) => c.id === cueId);
          const firstRefId = cue ? Object.keys(cue.levels)[0] : undefined;
          if (firstRefId) model.selectFixture(firstRefId);
        }}
      />
    </main>
  );
}

export default App;
