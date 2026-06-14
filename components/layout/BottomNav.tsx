"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, ProfileIcon, AgencyIcon } from "@/components/ui/NavIcons";

interface BottomNavProps {
  profileId?: string;
}

export function BottomNav({ profileId }: BottomNavProps) {
  const pathname = usePathname();

  const NAV = [
    { href: "/home",   label: "Home",    Icon: HomeIcon,    match: "/home" },
    { href: "/search", label: "Explore", Icon: SearchIcon,  match: "/search" },
    { href: profileId ? `/profile/${profileId}` : "/profile", label: "Profile", Icon: ProfileIcon, match: "/profile" },
    { href: "/agency", label: "Agency",  Icon: AgencyIcon,  match: "/agency" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-gray-100 flex z-50 pb-safe">
      {NAV.map(({ href, label, Icon, match }) => {
        const active = pathname != null && (pathname === href || pathname.startsWith(match));
        return (
          <Link
            key={label}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-3 text-[10px] font-medium font-body transition-colors ${
              active ? "text-mint-400" : "text-sage-400"
            }`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
