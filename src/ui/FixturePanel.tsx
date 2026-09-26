import { useMemo, useState } from "react";
import { GELS, gelByCode } from "../data/seed";
import { LIGHT_POSITIONS } from "../data/types";
import type { Fixture, LightPosition } from "../data/types";
import type { RehearsalModel } from "../model/useRehearsal";
import { CHANNEL_MAX, CHANNEL_MIN } from "../rules/limits";
import { checkChannel } from "../rules/fixtures";
import { FilterBar } from "./FilterBar";

interface FixturePanelProps {
  model: RehearsalModel;
}

export function FixturePanel({ model }: FixturePanelProps) {
  const { draft, visibleFixtures, selectedFixture, selectedCue } = model;

  const counts = useMemo(() => {
    const result = Object.fromEntries(
      LIGHT_POSITIONS.map((p) => [p, 0]),
    ) as Record<LightPosition, number>;
    for (const f of draft.fixtures) result[f.position] += 1;
    return result;
  }, [draft.fixtures]);

  const addPosition: LightPosition =
    draft.filter === "全部" ? "面光" : draft.filter;

  return (
    <section className="panel fixture-panel">
      <div className="heading">
        <div>
          <p>灯具筛选</p>
          <h2>灯具 / 光位</h2>
        </div>
        <button className="ghost" onClick={() => model.addFixture(addPosition)}>
          ＋ 加{addPosition}灯
        </button>
      </div>

      <div className="panel-filter">
        <FilterBar
          filter={draft.filter}
          counts={counts}
          total={draft.fixtures.length}
          onChange={model.setFilter}
        />
      </div>

      <ul className="fixture-list">
        {visibleFixtures.map((f) => {
          const level = selectedCue ? model.levelOf(f.id) : null;
          const active = f.id === selectedFixture?.id;
          return (
            <li key={f.id}>
              <button
                className={active ? "fixture-row active" : "fixture-row"}
                onClick={() => model.selectFixture(f.id)}
              >
                <span
                  className="gel-dot"
                  style={{ background: gelByCode(f.gelCode).color }}
                  title={`${f.gelCode} ${gelByCode(f.gelCode).name}`}
                />
                <span className="fixture-row-main">
                  <b>{f.code}</b>
                  <small>
                    CH {String(f.channel).padStart(3, "0")} · {f.position}
                  </small>
                </span>
                {f.focusPending && (
                  <span className="badge warn" title="焦点待走位确认">
                    焦点
                  </span>
                )}
                <span className={level === null ? "level-tag off" : "level-tag"}>
                  {level === null ? "未用" : `${level}%`}
                </span>
              </button>
            </li>
          );
        })}
        {visibleFixtures.length === 0 && (
          <li className="empty-hint">该光位还没有灯具，点右上「加灯」。</li>
        )}
      </ul>

      {selectedFixture && (
        <FixtureEditor
          key={selectedFixture.id}
          fixture={selectedFixture}
          allFixtures={draft.fixtures}
          model={model}
        />
      )}
    </section>
  );
}

/** 灯具编辑：通道、色片、焦点、亮度预设，改动实时进舞台图和当前场景。 */
function FixtureEditor({
  fixture,
  allFixtures,
  model,
}: {
  fixture: Fixture;
  allFixtures: Fixture[];
  model: RehearsalModel;
}) {
  const channelCheck = checkChannel(allFixtures, fixture.channel, fixture.id);
  const blockingCues = model.findBlockingCues(fixture.id);
  const [channelDraft, setChannelDraft] = useState(String(fixture.channel));

  const parsedChannel = Number(channelDraft);
  const draftInvalid =
    channelDraft.trim() === "" ||
    !Number.isInteger(parsedChannel) ||
    parsedChannel < CHANNEL_MIN ||
    parsedChannel > CHANNEL_MAX;
  const liveCheck =
    draftInvalid || channelDraft === String(fixture.channel)
      ? channelCheck
      : checkChannel(allFixtures, parsedChannel, fixture.id);

  const commitChannel = () => {
    if (!draftInvalid && liveCheck.valid) {
      model.changeChannel(fixture.id, parsedChannel);
    }
    setChannelDraft(String(fixture.channel));
  };

  return (
    <div className="fixture-editor">
      <div className="editor-title">
        <h3>{fixture.code}</h3>
        <button
          className="danger"
          onClick={() => model.requestRemoveFixture(fixture.id)}
          title={
            blockingCues.length > 0
              ? `被 ${blockingCues.length} 条 Cue 引用，无法移除`
              : "移除灯具"
          }
        >
          移除
        </button>
      </div>

      <label className="field">
        <span>
          通道号（{CHANNEL_MIN}–{CHANNEL_MAX}，全台唯一）
        </span>
        <input
          type="number"
          min={CHANNEL_MIN}
          max={CHANNEL_MAX}
          value={channelDraft}
          aria-invalid={draftInvalid || !liveCheck.valid}
          data-invalid={draftInvalid || !liveCheck.valid || undefined}
          onChange={(e) => setChannelDraft(e.target.value)}
          onBlur={commitChannel}
          onKeyDown={(e) => e.key === "Enter" && commitChannel()}
        />
        {draftInvalid ? (
          <small className="field-error">
            请输入 {CHANNEL_MIN}–{CHANNEL_MAX} 的整数
          </small>
        ) : (
          !liveCheck.valid &&
          liveCheck.conflict && (
            <small className="field-error">
              与 {liveCheck.conflict.code}（CH{" "}
              {String(liveCheck.conflict.channel).padStart(3, "0")}
              ）撞通道，未生效
            </small>
          )
        )}
      </label>

      <label className="field">
        <span>色片</span>
        <select
          value={fixture.gelCode}
          onChange={(e) => model.patchFixture(fixture.id, { gelCode: e.target.value })}
        >
          {GELS.map((gel) => (
            <option key={gel.code} value={gel.code}>
              {gel.code} · {gel.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="field focus-fields">
        <legend>焦点位置（舞台图可直接拖拽）</legend>
        <label>
          <span>X</span>
          <input
            type="number"
            value={fixture.focus.x}
            onChange={(e) =>
              model.changeFocus(fixture.id, {
                ...fixture.focus,
                x: Number(e.target.value),
              })
            }
          />
        </label>
        <label>
          <span>Y</span>
          <input
            type="number"
            value={fixture.focus.y}
            onChange={(e) =>
              model.changeFocus(fixture.id, {
                ...fixture.focus,
                y: Number(e.target.value),
              })
            }
          />
        </label>
      </fieldset>

      <label className="field checkbox">
        <input
          type="checkbox"
          checked={fixture.focusPending}
          onChange={() => model.toggleFocusPending(fixture.id)}
        />
        <span>焦点待演员走位确认</span>
      </label>

      <label className="field">
        <span>亮度预设：{fixture.preset}%（加入新场景时的初始电平）</span>
        <input
          type="range"
          min={0}
          max={100}
          value={fixture.preset}
          onChange={(e) => model.changePreset(fixture.id, Number(e.target.value))}
        />
      </label>
    </div>
  );
}
