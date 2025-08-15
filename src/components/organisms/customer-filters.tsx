"use client";

import { Input } from "@/components/ui/input";

export type CustomerFiltersProps = {
  search: string;
  sortKey: "name" | "lastVisit";
  onSearchChange: (v: string) => void;
  onSortChange: (v: "name" | "lastVisit") => void;
};

export function CustomerFilters({
  search,
  sortKey,
  onSearchChange,
  onSortChange,
}: CustomerFiltersProps) {
  return (
    <div className="flex gap-2">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="検索"
      />
      <select
        value={sortKey}
        onChange={(e) => onSortChange(e.target.value as "name" | "lastVisit")}
        className="border px-2 py-1"
      >
        <option value="name">名前順</option>
        <option value="lastVisit">最終来店日</option>
      </select>
    </div>
  );
}
