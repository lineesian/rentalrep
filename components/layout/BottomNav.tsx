"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/home",   label: "Home",    icon: "🏠" },
  { href: "/search", label: "Explore", icon: "🔍" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/agency", label: "Agency",  icon: "🏢" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-gray-100 flex z-50 pb-safe">
      {NAV.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-3 text-[10px] font-medium font-body transition-colors ${
              active ? "text-teal-400" : "text-gray-400"
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
