"use client";

import { MenuGrid, type MenuItem } from "@/components/organisms/menu-grid";

type HomeTemplateProps = {
  menuItems: MenuItem[];
};

export function HomeTemplate({ menuItems }: HomeTemplateProps) {
  return (
    <main className="max-w-4xl px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">管理メニュー</h1>
      <MenuGrid items={menuItems} />
    </main>
  );
}
