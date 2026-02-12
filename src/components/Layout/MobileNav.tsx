"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/algorithm-registry";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden flex gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar">
      {categories.map((cat) => {
        const href = `/${cat.slug}/${cat.defaultAlgorithm}`;
        const isActive = pathname.startsWith(`/${cat.slug}`);
        return (
          <Link
            key={cat.slug}
            href={href}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100"
                : "border-white/[0.06] bg-white/[0.03] text-slate-400"
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}
