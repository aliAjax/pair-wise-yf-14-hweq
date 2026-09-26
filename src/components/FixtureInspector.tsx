import { useEffect, useState } from "react";
import type { Fixture } from "../types";
import { GELS } from "../data/gels";
import { positionName } from "../data/positions";
import {
  CHANNEL_MAX,
  CHANNEL_MIN,
  findChannelConflict,
  isValidChannel,
} from "../rules/fixtureRules";

interface FixtureInspectorProps {
  fixture: Fixture | null;
  fixtures: Fixture[];
  onPatch: (id: string, patch: Partial<Omit<Fixture, "id">>) => void;
  onRemove: (id: string) => void;
}

export default function FixtureInspector({
  fixture,
  fixtures,
  onPatch,
  onRemove,
}: FixtureInspectorProps) {
  const [channelText, setChannelText] = useState("");

  useEffect(() => {
    setChannelText(fixture ? String(fixture.channel) : "");
  }, [fixture?.id, fixture?.channel]);

  if (!fixture) {
    return (
      <section className="panel inspector">
        <h2>灯具调整</h2>
        <p className="empty-hint">在舞台图或下方列表中选中一盏灯，即可调整通道、色片、焦点与亮度。</p>
      </section>
    );
  }

  const channelNum = Number(channelText);
  const channelInvalid = !isValidChannel(channelNum);
  const conflict = !channelInvalid
    ? findChannelConflict(fixtures, channelNum, fixture.id)
    : undefined;

  const commitChannel = () => {
    if (channelInvalid || conflict) return;
    onPatch(fixture.id, { channel: channelNum });
  };

  return (
    <section className="panel inspector">
      <div className="heading">
        <div>
          <p>{positionName(fixture.position)}</p>
          <h2>{fixture.no}</h2>
        </div>
        <button className="danger" onClick={() => onRemove(fixture.id)}>
          移除灯具
        </button>
      </div>

      <div className="field-grid">
        <label>
          <span>通道号（{CHANNEL_MIN}–{CHANNEL_MAX}）</span>
          <input
            type="number"
            min={CHANNEL_MIN}
            max={CHANNEL_MAX}
            value={channelText}
            onChange={(e) => setChannelText(e.target.value)}
            onBlur={commitChannel}
            onKeyDown={(e) => e.key === "Enter" && commitChannel()}
          />
        </label>
        <label>
          <span>色片</span>
          <select
            value={fixture.gelId}
            onChange={(e) => onPatch(fixture.id, { gelId: e.target.value })}
          >
            {GELS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>焦点 X（左→右 {Math.round(fixture.focus.x)}）</span>
          <input
            type="range"
            min={2}
            max={98}
            value={fixture.focus.x}
            onChange={(e) =>
              onPatch(fixture.id, {
                focus: { ...fixture.focus, x: Number(e.target.value) },
              })
            }
          />
        </label>
        <label>
          <span>焦点 Y（后→前 {Math.round(fixture.focus.y)}）</span>
          <input
            type="range"
            min={2}
            max={98}
            value={fixture.focus.y}
            onChange={(e) =>
              onPatch(fixture.id, {
                focus: { ...fixture.focus, y: Number(e.target.value) },
              })
            }
          />
        </label>
        <label className="span-2">
          <span>亮度 {fixture.intensity}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={fixture.intensity}
            onChange={(e) =>
              onPatch(fixture.id, { intensity: Number(e.target.value) })
            }
          />
        </label>
      </div>

      {channelInvalid && (
        <p className="field-error">通道号需为 {CHANNEL_MIN}–{CHANNEL_MAX} 的整数。</p>
      )}
      {conflict && (
        <p className="field-error">
          通道 {channelNum} 已被 {conflict.no} 占用，请换一个通道。
        </p>
      )}
    </section>
  );
}
