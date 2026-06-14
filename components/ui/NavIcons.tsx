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
      {/* Building body */}
      <rect x="3" y="5" width="18" height="16" rx="1" stroke={color} strokeWidth={1.8}/>
      {/* Roof parapet */}
      <path d="M3 9h18" stroke={color} strokeWidth={1.2}/>
      {/* Floor 1 windows */}
      <rect x="6"  y="11" width="3" height="2.5" rx="0.4" fill={color} fillOpacity="0.5"/>
      <rect x="15" y="11" width="3" height="2.5" rx="0.4" fill={color} fillOpacity="0.5"/>
      {/* Floor 2 windows */}
      <rect x="6"  y="15.5" width="3" height="2.5" rx="0.4" fill={color} fillOpacity="0.5"/>
      <rect x="15" y="15.5" width="3" height="2.5" rx="0.4" fill={color} fillOpacity="0.5"/>
      {/* Central door */}
      <rect x="10.5" y="16" width="3" height="5" rx="0.4" stroke={color} strokeWidth={1.2}/>
    </svg>
  );
}
