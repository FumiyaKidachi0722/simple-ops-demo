"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
        <Link href="/" className="text-lg font-semibold">
          Simple Ops
        </Link>
      </div>
    </header>
  );
}

export default SiteHeader;
