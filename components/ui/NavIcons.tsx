// Clean SVG nav icons — used by BottomNav. No emojis.

interface IconProps { size?: number; color?: string }

export function HomeIcon({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <path d="M9 21V13h6v8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SearchIcon({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={1.8}/>
      <path d="M15.5 15.5L21 21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </svg>
  );
}

export function ProfileIcon({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.8}/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </svg>
  );
}

export function AgencyIcon({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="1" stroke={color} strokeWidth={1.8}/>
      <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <path d="M12 12v4M9 14h6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </svg>
  );
}
