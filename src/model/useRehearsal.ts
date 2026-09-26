// 模型层：把数据层（草稿存取）与规则层（纯函数）编排成 React 状态，
// 界面组件只调用这里暴露的意图方法，不直接改草稿结构。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "../data/storage";
import type {
  Cue,
  DraftState,
  Fixture,
  LightPosition,
  Point,
} from "../data/types";
import {
  addCue,
  activeFixtures,
  activeLevel,
  createId,
  detachCueLevel,
  detachFixtureFromCues,
  moveCueDown,
  moveCueUp,
  renameCue,
  setCueLevel,
  updateCueNote,
} from "../rules/cues";
import {
  checkChannel,
  cuesReferencingFixture,
  filterFixtures,
  nextFixtureCode,
  nextFreeChannel,
} from "../rules/fixtures";
import { clampLevel } from "../rules/limits";
import { clampFocusToStage } from "../rules/stage";

export interface RemoveBlockedInfo {
  fixture: Fixture;
  cues: Cue[];
}

export function useRehearsal() {
  const [draft, setDraft] = useState<DraftState>(() => loadDraft());
  const [removeBlocked, setRemoveBlocked] = useState<RemoveBlockedInfo | null>(
    null,
  );
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<number | null>(null);
  const latestDraft = useRef(draft);
  latestDraft.current = draft;

  // 排演调整自动存为本地草稿（选择操作走 touch=false，不打脏标记）。
  const commit = useCallback(
    (updater: (prev: DraftState) => DraftState, touch = true) => {
      setDraft((prev) => {
        const next = updater(prev);
        return touch ? { ...next, updatedAt: new Date().toISOString() } : next;
      });
      if (touch) setSaved(false);
    },
    [],
  );

  useEffect(() => {
    if (saved) return;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveDraft(latestDraft.current);
      setSaved(true);
    }, 300);
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    };
  }, [draft, saved]);

  // 卸载前兜底落盘最新草稿，避免 300ms 防抖窗口丢调整。
  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveDraft(latestDraft.current);
    };
  }, []);

  const selectedCue = useMemo(
    () => draft.cues.find((c) => c.id === draft.selectedCueId) ?? draft.cues[0],
    [draft.cues, draft.selectedCueId],
  );
  const selectedFixture = useMemo(
    () =>
      draft.fixtures.find((f) => f.id === draft.selectedFixtureId) ??
      draft.fixtures[0],
    [draft.fixtures, draft.selectedFixtureId],
  );
  const visibleFixtures = useMemo(
    () => filterFixtures(draft.fixtures, draft.filter),
    [draft.fixtures, draft.filter],
  );
  const active = useMemo(
    () => activeFixtures(selectedCue, draft.fixtures),
    [selectedCue, draft.fixtures],
  );

  // ---- 选择与筛选（不落草稿时间戳） ----
  const selectFixture = useCallback(
    (id: string) =>
      commit((prev) => ({ ...prev, selectedFixtureId: id }), false),
    [commit],
  );
  const selectCue = useCallback(
    (id: string) => commit((prev) => ({ ...prev, selectedCueId: id }), false),
    [commit],
  );
  const setFilter = useCallback(
    (filter: LightPosition | "全部") =>
      commit((prev) => ({ ...prev, filter }), false),
    [commit],
  );

  // ---- 演出信息 ----
  const setShowTitle = useCallback(
    (showTitle: string) => commit((prev) => ({ ...prev, showTitle })),
    [commit],
  );
  const setVersionNote = useCallback(
    (versionNote: string) => commit((prev) => ({ ...prev, versionNote })),
    [commit],
  );

  // ---- 灯具编辑：通道、色片、焦点、亮度预设 ----
  const patchFixture = useCallback(
    (fixtureId: string, patch: Partial<Fixture>) =>
      commit((prev) => ({
        ...prev,
        fixtures: prev.fixtures.map((f) =>
          f.id === fixtureId ? { ...f, ...patch } : f,
        ),
      })),
    [commit],
  );

  const changeChannel = useCallback(
    (fixtureId: string, channel: number) =>
      commit((prev) => {
        if (!checkChannel(prev.fixtures, channel, fixtureId).valid) return prev;
        return {
          ...prev,
          fixtures: prev.fixtures.map((f) =>
            f.id === fixtureId ? { ...f, channel } : f,
          ),
        };
      }),
    [commit],
  );

  const changeFocus = useCallback(
    (fixtureId: string, focus: Point) =>
      commit((prev) => ({
        ...prev,
        fixtures: prev.fixtures.map((f) =>
          f.id === fixtureId
            ? { ...f, focus: clampFocusToStage(focus), focusPending: false }
            : f,
        ),
      })),
    [commit],
  );

  const toggleFocusPending = useCallback(
    (fixtureId: string) =>
      commit((prev) => ({
        ...prev,
        fixtures: prev.fixtures.map((f) =>
          f.id === fixtureId ? { ...f, focusPending: !f.focusPending } : f,
        ),
      })),
    [commit],
  );

  const changePreset = useCallback(
    (fixtureId: string, preset: number) =>
      patchFixture(fixtureId, { preset: clampLevel(preset) }),
    [patchFixture],
  );

  const addFixture = useCallback(
    (position: LightPosition) =>
      commit((prev) => {
        const fixture: Fixture = {
          id: createId("fx"),
          code: nextFixtureCode(prev.fixtures, position),
          position,
          channel: nextFreeChannel(prev.fixtures, 1),
          gelCode: "无",
          location: { x: 500, y: 560 },
          focus: { x: 500, y: 330 },
          preset: 50,
          focusPending: true,
        };
        return {
          ...prev,
          fixtures: [...prev.fixtures, fixture],
          selectedFixtureId: fixture.id,
        };
      }),
    [commit],
  );

  /**
   * 移除灯具：被任一 Cue 引用时拦截（保留原灯具和 Cue 顺序），
   * 界面据返回的 blockingCue 列表挡住操作。
   */
  const requestRemoveFixture = useCallback(
    (fixtureId: string) => {
      const fixture = draft.fixtures.find((f) => f.id === fixtureId);
      const blockingCues = cuesReferencingFixture(draft.cues, fixtureId);
      if (blockingCues.length > 0 || !fixture) {
        if (fixture) setRemoveBlocked({ fixture, cues: blockingCues });
        return;
      }
      commit((prev) => {
        const fixtures = prev.fixtures.filter((f) => f.id !== fixtureId);
        return {
          ...prev,
          fixtures,
          cues: detachFixtureFromCues(prev.cues, fixtureId),
          selectedFixtureId:
            prev.selectedFixtureId === fixtureId
              ? fixtures[0]?.id ?? null
              : prev.selectedFixtureId,
        };
      });
    },
    [commit, draft.cues, draft.fixtures],
  );

  const closeRemoveBlocked = useCallback(() => setRemoveBlocked(null), []);

  /** 只读地预演拦截结果（供按钮提前判断）。 */
  const findBlockingCues = useCallback(
    (fixtureId: string) =>
      cuesReferencingFixture(draft.cues, fixtureId),
    [draft.cues],
  );

  // ---- Cue 管理 ----
  const appendCue = useCallback(
    () =>
      commit((prev) => {
        const cues = addCue(prev.cues);
        return {
          ...prev,
          cues,
          selectedCueId: cues[cues.length - 1].id,
        };
      }),
    [commit],
  );
  const renameSelectedOr = useCallback(
    (cueId: string, name: string) =>
      commit((prev) => ({ ...prev, cues: renameCue(prev.cues, cueId, name) })),
    [commit],
  );
  const setCueNote = useCallback(
    (note: string) =>
      commit((prev) => {
        if (!prev.selectedCueId) return prev;
        return {
          ...prev,
          cues: updateCueNote(prev.cues, prev.selectedCueId, note),
        };
      }),
    [commit],
  );
  const moveSelectedCue = useCallback(
    (direction: -1 | 1) =>
      commit((prev) => {
        if (!prev.selectedCueId) return prev;
        const cues =
          direction === -1
            ? moveCueUp(prev.cues, prev.selectedCueId)
            : moveCueDown(prev.cues, prev.selectedCueId);
        return { ...prev, cues };
      }),
    [commit],
  );
  const setLevel = useCallback(
    (fixtureId: string, level: number) =>
      commit((prev) => {
        const cueId =
          prev.selectedCueId ?? prev.cues[0]?.id;
        if (!cueId) return prev;
        return {
          ...prev,
          selectedCueId: cueId,
          cues: setCueLevel(prev.cues, cueId, fixtureId, level),
        };
      }),
    [commit],
  );

  /** 把灯具按其亮度预设挂进当前场景。 */
  const attachSelectedFixture = useCallback(
    () =>
      commit((prev) => {
        const cueId = prev.selectedCueId ?? prev.cues[0]?.id;
        const fixture = prev.fixtures.find(
          (f) => f.id === prev.selectedFixtureId,
        );
        if (!cueId || !fixture) return prev;
        if (
          Object.prototype.hasOwnProperty.call(
            prev.cues.find((c) => c.id === cueId)?.levels ?? {},
            fixture.id,
          )
        ) {
          return prev;
        }
        return {
          ...prev,
          cues: setCueLevel(prev.cues, cueId, fixture.id, fixture.preset),
        };
      }),
    [commit],
  );

  /** 把灯具从当前场景摘除（不删灯具）。 */
  const detachFromCurrentCue = useCallback(
    (fixtureId: string) =>
      commit((prev) => {
        const cueId = prev.selectedCueId ?? prev.cues[0]?.id;
        if (!cueId) return prev;
        return {
          ...prev,
          cues: detachCueLevel(prev.cues, cueId, fixtureId),
        };
      }),
    [commit],
  );

  const resetDraft = useCallback(() => {
    clearDraft();
    const fresh = loadDraft();
    setDraft(fresh);
    setSaved(true);
  }, []);

  return {
    draft,
    saved,
    selectedCue,
    selectedFixture,
    visibleFixtures,
    active,
    removeBlocked,
    // helpers
    levelOf: (fixtureId: string) => activeLevel(selectedCue, fixtureId),
    findBlockingCues,
    // selection
    selectFixture,
    selectCue,
    setFilter,
    // show
    setShowTitle,
    setVersionNote,
    // fixture
    patchFixture,
    changeChannel,
    changeFocus,
    toggleFocusPending,
    changePreset,
    addFixture,
    requestRemoveFixture,
    closeRemoveBlocked,
    // cue
    appendCue,
    renameSelectedOr,
    setCueNote,
    moveSelectedCue,
    setLevel,
    attachSelectedFixture,
    detachFromCurrentCue,
    resetDraft,
  };
}

export type RehearsalModel = ReturnType<typeof useRehearsal>;
