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
  // Building: body y=3..22, parapet at y=7, floor-1 windows y=9..12, floor-2 windows y=14..17, door y=18..22
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="19" rx="1" stroke={color} strokeWidth={1.8}/>
      <line x1="3" y1="7" x2="21" y2="7" stroke={color} strokeWidth={1.2}/>
      <rect x="5.5" y="9"  width="4" height="3" rx="0.5" stroke={color} strokeWidth={1.2}/>
      <rect x="14.5" y="9"  width="4" height="3" rx="0.5" stroke={color} strokeWidth={1.2}/>
      <rect x="5.5" y="14" width="4" height="3" rx="0.5" stroke={color} strokeWidth={1.2}/>
      <rect x="14.5" y="14" width="4" height="3" rx="0.5" stroke={color} strokeWidth={1.2}/>
      <rect x="10" y="18" width="4" height="4" rx="0.5" stroke={color} strokeWidth={1.2}/>
    </svg>
  );
}
