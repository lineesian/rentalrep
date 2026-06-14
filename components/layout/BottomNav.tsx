"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  profileId?: string;
}

export function BottomNav({ profileId }: BottomNavProps) {
  const pathname = usePathname();

  const NAV = [
    { href: "/home",                         label: "Home",    icon: "🏠", match: "/home" },
    { href: "/search",                        label: "Explore", icon: "🔍", match: "/search" },
    { href: profileId ? `/profile/${profileId}` : "/profile", label: "Profile", icon: "👤", match: "/profile" },
    { href: "/agency",                        label: "Agency",  icon: "🏢", match: "/agency" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-gray-100 flex z-50 pb-safe">
      {NAV.map(({ href, label, icon, match }) => {
        const active = pathname === href || pathname.startsWith(match);
        return (
          <Link
            key={label}
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
