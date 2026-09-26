import { useMemo, useState } from "react";
import "./styles.css";
import type { Cue, Fixture, Point, PositionId } from "./types";
import { POSITIONS } from "./data/positions";
import { filterFixtures } from "./rules/fixtureRules";
import { checkRemoveFixture, createCue } from "./rules/cueRules";
import { useRehearsalDraft } from "./hooks/useRehearsalDraft";
import PositionFilter from "./components/PositionFilter";
import StagePlot from "./components/StagePlot";
import FixtureInspector from "./components/FixtureInspector";
import FixtureTable from "./components/FixtureTable";
import CueList from "./components/CueList";
import ScenePreview from "./components/ScenePreview";
import RemoveBlockedDialog from "./components/RemoveBlockedDialog";

function App() {
  const {
    draft,
    dirty,
    savedAt,
    saveNow,
    resetDraft,
    updateFixture,
    removeFixture,
    addCue,
    reorderCue,
    renameCueAt,
    updateShow,
  } = useRehearsalDraft();

  const [position, setPosition] = useState<PositionId | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{
    fixture: Fixture;
    relatedCues: Cue[];
  } | null>(null);

  const visibleFixtures = useMemo(
    () => filterFixtures(draft.fixtures, position),
    [draft.fixtures, position],
  );

  // 当前 Cue 按 id 追踪：上下排序时高亮跟随原 Cue，不跟下标走
  const foundCueIndex = activeCueId
    ? draft.cues.findIndex((c) => c.id === activeCueId)
    : -1;
  const safeCueIndex = foundCueIndex === -1 ? 0 : foundCueIndex;
  const activeCue = draft.cues[safeCueIndex] ?? null;
  const activeIds = useMemo(
    () => new Set(activeCue?.fixtureIds ?? []),
    [activeCue],
  );

  const selectedFixture =
    draft.fixtures.find((f) => f.id === selectedFixtureId) ?? null;

  const counts = useMemo(() => {
    const map = Object.fromEntries(POSITIONS.map((p) => [p.id, 0])) as Record<
      PositionId,
      number
    >;
    for (const f of draft.fixtures) map[f.position] += 1;
    return map;
  }, [draft.fixtures]);

  // 移除灯具：被 Cue 引用则挡住并列出相关 Cue
  const handleRemoveFixture = (fixtureId: string) => {
    const fixture = draft.fixtures.find((f) => f.id === fixtureId);
    if (!fixture) return;
    const check = checkRemoveFixture(draft.cues, fixtureId);
    if (check.blocked) {
      setBlocked({ fixture, relatedCues: check.relatedCues });
      return;
    }
    removeFixture(fixtureId);
    if (selectedFixtureId === fixtureId) setSelectedFixtureId(null);
  };

  const handleAddCue = () => {
    const cue = createCue(draft.cues, draft.cues.length + 1);
    addCue(cue);
    setActiveCueId(cue.id); // 新 Cue 追加在队尾并立即选中
  };

  const handleDragFocus = (id: string, point: Point) => {
    updateFixture(id, { focus: point });
  };

  const pendingFocus = draft.fixtures.filter(
    (f) => f.intensity > 0 && f.intensity < 40,
  ).length;

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-top">
          <p>排演模式 · 灯光工作台</p>
          <div className="hero-actions">
            <span className={dirty ? "save-state is-dirty" : "save-state"}>
              {dirty
                ? "有未保存的调整…"
                : savedAt
                  ? `草稿已保存 ${new Date(savedAt).toLocaleTimeString()}`
                  : "尚未保存"}
            </span>
            <button className="primary" onClick={saveNow}>
              保存草稿
            </button>
            <button onClick={resetDraft}>重置示例</button>
          </div>
        </div>
        <input
          className="show-title"
          value={draft.show.title}
          onChange={(e) => updateShow({ title: e.target.value })}
          aria-label="演出名称"
        />
        <input
          className="show-note"
          value={draft.show.versionNote}
          onChange={(e) => updateShow({ versionNote: e.target.value })}
          placeholder="演出版本备注，如：联排 V3 · 重点确认追光走位"
          aria-label="演出版本备注"
        />
      </header>

      <section className="metrics">
        <article>
          <small>灯具数量</small>
          <strong>{draft.fixtures.length}</strong>
        </article>
        <article>
          <small>Cue 数量</small>
          <strong>{draft.cues.length}</strong>
        </article>
        <article>
          <small>当前场景</small>
          <strong>{activeCue ? `Cue ${safeCueIndex + 1}` : "—"}</strong>
        </article>
        <article>
          <small>待确认焦点</small>
          <strong>{pendingFocus}</strong>
        </article>
      </section>

      <section className="workspace">
        <aside className="panel">
          <h2>光位筛选</h2>
          <PositionFilter
            value={position}
            counts={counts}
            total={draft.fixtures.length}
            onChange={setPosition}
          />
          <StagePlot
            fixtures={visibleFixtures}
            activeIds={activeIds}
            selectedId={selectedFixtureId}
            onSelect={setSelectedFixtureId}
            onDragFocus={handleDragFocus}
          />
        </aside>

        <div className="workspace-main">
          <FixtureInspector
            fixture={selectedFixture}
            fixtures={draft.fixtures}
            onPatch={updateFixture}
            onRemove={handleRemoveFixture}
          />
          <section className="panel">
            <div className="heading">
              <div>
                <p>{position ? "筛选结果" : "全部灯具"}</p>
                <h2>灯具清单（{visibleFixtures.length}）</h2>
              </div>
            </div>
            <FixtureTable
              fixtures={visibleFixtures}
              cues={draft.cues}
              selectedId={selectedFixtureId}
              onSelect={setSelectedFixtureId}
              onRemove={handleRemoveFixture}
            />
          </section>
        </div>

        <div className="workspace-side">
          <CueList
            cues={draft.cues}
            activeIndex={safeCueIndex}
            onSelect={(index) => setActiveCueId(draft.cues[index].id)}
            onMove={reorderCue}
            onRename={renameCueAt}
            onAdd={handleAddCue}
          />
          <ScenePreview
            cue={activeCue}
            cueIndex={safeCueIndex}
            fixtures={draft.fixtures}
          />
        </div>
      </section>

      {blocked && (
        <RemoveBlockedDialog
          fixtureNo={blocked.fixture.no}
          relatedCues={blocked.relatedCues}
          cueIndexOf={(cueId) => draft.cues.findIndex((c) => c.id === cueId)}
          onClose={() => setBlocked(null)}
        />
      )}
    </main>
  );
}

export default App;
