import { LIGHT_POSITIONS } from "../data/types";
import type { LightPosition } from "../data/types";

interface FilterBarProps {
  filter: LightPosition | "全部";
  counts: Record<LightPosition, number>;
  total: number;
  onChange: (filter: LightPosition | "全部") => void;
}

/** 按光位筛选灯具；每个光位带灯具数量。 */
export function FilterBar({ filter, counts, total, onChange }: FilterBarProps) {
  const options: Array<LightPosition | "全部"> = ["全部", ...LIGHT_POSITIONS];
  return (
    <div className="chips" role="group" aria-label="按光位筛选灯具">
      {options.map((option) => {
        const count = option === "全部" ? total : counts[option];
        const active = filter === option;
        return (
          <button
            key={option}
            className={active ? "chip active" : "chip"}
            aria-pressed={active}
            onClick={() => onChange(option)}
          >
            {option}
            <span className="chip-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
