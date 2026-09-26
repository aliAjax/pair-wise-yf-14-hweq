import type { PositionId } from "../types";
import { POSITIONS } from "../data/positions";

interface PositionFilterProps {
  value: PositionId | null;
  counts: Record<PositionId, number>;
  total: number;
  onChange: (value: PositionId | null) => void;
}

export default function PositionFilter({
  value,
  counts,
  total,
  onChange,
}: PositionFilterProps) {
  return (
    <div className="chips filter-chips">
      <button
        className={value === null ? "is-on" : ""}
        onClick={() => onChange(null)}
      >
        全部 <em>{total}</em>
      </button>
      {POSITIONS.map((p) => (
        <button
          key={p.id}
          className={value === p.id ? "is-on" : ""}
          onClick={() => onChange(p.id)}
        >
          {p.name} <em>{counts[p.id]}</em>
        </button>
      ))}
    </div>
  );
}
