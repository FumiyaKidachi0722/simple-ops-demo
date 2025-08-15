"use client";

import Link from "next/link";

export type MenuCardProps = {
  href: string;
  label: string;
  disabled?: boolean;
};

export function MenuCard({ href, label, disabled = false }: MenuCardProps) {
  const baseClass =
    "block p-6 text-lg font-medium text-center border rounded-lg shadow-sm bg-card transition-shadow";
  if (disabled) {
    return (
      <div className={`${baseClass} opacity-50 pointer-events-none`}>
        {label}
      </div>
    );
  }
  return (
    <Link href={href} className={`${baseClass} hover:shadow-md`}>
      {label}
    </Link>
  );
}
