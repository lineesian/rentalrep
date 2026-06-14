// Clean SVG icons for the home-page action cards. No emojis.

interface IconProps { size?: number }

export function RateLandlordIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 13L16 4l12 9V28H4V13z" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8} strokeLinejoin="round"/>
      <polygon points="16,10 17.2,13.8 21.2,13.8 18,16.2 19.2,20 16,17.6 12.8,20 14,16.2 10.8,13.8 14.8,13.8" fill="#F4B53F"/>
    </svg>
  );
}

export function RateTenantIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="11" r="5.5" stroke="#0E9E92" strokeWidth={1.8} fill="#E6F9F8"/>
      <path d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
      <circle cx="24" cy="10" r="4" fill="#F4B53F"/>
      <path d="M24 8v2.5l1.5 1.5" stroke="#07312C" strokeWidth={1.3} strokeLinecap="round"/>
    </svg>
  );
}

export function RateAgencyIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Building body */}
      <rect x="6" y="8" width="20" height="21" rx="1.5" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
      {/* Roof parapet line */}
      <path d="M6 12h20" stroke="#0E9E92" strokeWidth={1.2}/>
      {/* Floor 1 windows */}
      <rect x="9"  y="14" width="4" height="3" rx="0.5" fill="#0E9E92" fillOpacity="0.5"/>
      <rect x="19" y="14" width="4" height="3" rx="0.5" fill="#0E9E92" fillOpacity="0.5"/>
      {/* Floor 2 windows */}
      <rect x="9"  y="20" width="4" height="3" rx="0.5" fill="#0E9E92" fillOpacity="0.5"/>
      <rect x="19" y="20" width="4" height="3" rx="0.5" fill="#0E9E92" fillOpacity="0.5"/>
      {/* Central door */}
      <rect x="14" y="22" width="4" height="7" rx="0.5" fill="#F4B53F"/>
    </svg>
  );
}

export function ScreenTenantIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="22" height="26" rx="2" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
      <circle cx="16" cy="13" r="4" stroke="#0E9E92" strokeWidth={1.8}/>
      <path d="M10 23c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
      <path d="M19 7l1.5 1.5L23 6" stroke="#F4B53F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MyProfileIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="13" r="6" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
      <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
      <polygon points="16,5 17,7.8 20,7.8 17.5,9.5 18.5,12.3 16,10.6 13.5,12.3 14.5,9.5 12,7.8 15,7.8" fill="#F4B53F"/>
    </svg>
  );
}
