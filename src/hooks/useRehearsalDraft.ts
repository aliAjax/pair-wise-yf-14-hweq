import { useCallback, useEffect, useRef, useState } from "react";
import type { Cue, Draft, Fixture, ShowProfile } from "../types";
import { INITIAL_DRAFT } from "../data/initialDraft";
import { clearDraft, loadDraft, saveDraft } from "../rules/storage";
import { moveCue, renameCue } from "../rules/cueRules";

// 排演草稿的统一状态入口：所有修改经此进入，再由 effect 落盘到 localStorage
export function useRehearsalDraft() {
  const [initial] = useState<Draft>(() => loadDraft());
  const [draft, setDraft] = useState<Draft>(initial);
  const [savedAt, setSavedAt] = useState<number>(initial.savedAt);
  const [dirty, setDirty] = useState(false);
  const timer = useRef<number | null>(null);

  // 调整后防抖自动写入本地草稿
  useEffect(() => {
    if (!dirty) return;
    timer.current = window.setTimeout(() => {
      const next = { ...draft, savedAt: Date.now() };
      saveDraft(next);
      setDraft(next);
      setSavedAt(next.savedAt);
      setDirty(false);
    }, 500);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [draft, dirty]);

  const mutate = useCallback((recipe: (prev: Draft) => Draft) => {
    setDraft((prev) => recipe(prev));
    setDirty(true);
  }, []);

  const saveNow = useCallback(() => {
    const next = { ...draft, savedAt: Date.now() };
    saveDraft(next);
    setDraft(next);
    setSavedAt(next.savedAt);
    setDirty(false);
  }, [draft]);

  const resetDraft = useCallback(() => {
    clearDraft();
    setDraft(INITIAL_DRAFT);
    setSavedAt(0);
    setDirty(false);
  }, []);

  // 灯具调整
  const updateFixture = useCallback(
    (fixtureId: string, patch: Partial<Omit<Fixture, "id">>) => {
      mutate((prev) => ({
        ...prev,
        fixtures: prev.fixtures.map((f) =>
          f.id === fixtureId ? { ...f, ...patch } : f,
        ),
      }));
    },
    [mutate],
  );

  const removeFixture = useCallback(
    (fixtureId: string) => {
      mutate((prev) => ({
        ...prev,
        fixtures: prev.fixtures.filter((f) => f.id !== fixtureId),
      }));
    },
    [mutate],
  );

  // Cue 调整
  const addCue = useCallback(
    (cue: Cue) => {
      mutate((prev) => ({ ...prev, cues: [...prev.cues, cue] }));
    },
    [mutate],
  );

  const reorderCue = useCallback(
    (index: number, direction: -1 | 1) => {
      mutate((prev) => ({ ...prev, cues: moveCue(prev.cues, index, direction) }));
    },
    [mutate],
  );

  const renameCueAt = useCallback(
    (index: number, name: string) => {
      mutate((prev) => ({ ...prev, cues: renameCue(prev.cues, index, name) }));
    },
    [mutate],
  );

  const updateShow = useCallback(
    (patch: Partial<ShowProfile>) => {
      mutate((prev) => ({ ...prev, show: { ...prev.show, ...patch } }));
    },
    [mutate],
  );

  return {
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
  };
}
