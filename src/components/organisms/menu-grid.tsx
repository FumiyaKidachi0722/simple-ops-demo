"use client";

import { MenuCard, type MenuCardProps } from "@/components/atoms/menu-card";

export type MenuItem = MenuCardProps;

type MenuGridProps = {
  items: MenuItem[];
};

export function MenuGrid({ items }: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <MenuCard key={item.href} {...item} />
      ))}
    </div>
  );
}
