import type { Cast } from "@/lib/types";

interface Props {
  casts: Cast[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CastSelect({ casts, value, onChange, className }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {casts.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
