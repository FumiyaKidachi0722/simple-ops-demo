import type { Customer } from "@/lib/types";

type CustomerOption = Pick<Customer, "id" | "name">;

interface Props {
  customers: CustomerOption[];
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function CustomerSelect({
  customers,
  value,
  onChange,
  className,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={className}
    >
      {customers.map((c) => (
        <option key={c.id} value={c.id}>
          {`${c.name}([${c.id}])`}
        </option>
      ))}
    </select>
  );
}
