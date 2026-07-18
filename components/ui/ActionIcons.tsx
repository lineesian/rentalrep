// Clean SVG icons for the home-page action cards. No emojis.

interface IconProps { size?: number }

export function RateLandlordIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="3"/>
      <path d="M6 11c0-2.5 2.7-4 6-4s6 1.5 6 4"/>
      <path d="M3 21l9-7 9 7"/>
      <path d="M5 21v-5h14v5"/>
    </svg>
  );
}

export function RateTenantIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="4"/>
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

export function RateAgencyIcon({ size = 28 }: IconProps) {
  // Body y=4..30, parapet at y=9, floor-1 windows y=11..16, floor-2 windows y=18..23, door y=24..30
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="24" height="26" rx="1.5" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
      <line x1="4" y1="9" x2="28" y2="9" stroke="#0E9E92" strokeWidth={1.2}/>
      <rect x="7"  y="11" width="5" height="5" rx="0.5" stroke="#0E9E92" strokeWidth={1.4}/>
      <rect x="20" y="11" width="5" height="5" rx="0.5" stroke="#0E9E92" strokeWidth={1.4}/>
      <rect x="7"  y="18" width="5" height="5" rx="0.5" stroke="#0E9E92" strokeWidth={1.4}/>
      <rect x="20" y="18" width="5" height="5" rx="0.5" stroke="#0E9E92" strokeWidth={1.4}/>
      <rect x="14" y="24" width="4" height="6" rx="0.5" fill="#F4B53F"/>
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

export function RateAgentIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="7" r="3.5"/>
      <path d="M2 21c0-3.5 3.1-6 7-6s7 2.5 7 6"/>
      <circle cx="17" cy="8" r="2.5"/>
      <path d="M17 14c2.5 0 5 1.5 5 4.5"/>
    </svg>
  );
}

export function RatePropertyIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 14L16 5l12 9V28H4V14z" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8} strokeLinejoin="round"/>
      <rect x="12" y="19" width="8" height="9" rx="1" stroke="#0E9E92" strokeWidth={1.5}/>
      <rect x="8"  y="15" width="4" height="4" rx="0.5" fill="#F4B53F"/>
      <rect x="20" y="15" width="4" height="4" rx="0.5" fill="#F4B53F"/>
    </svg>
  );
}

export function DepositTrackerIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

export function MaintenanceLogIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a3 3 0 0 1-4.24 4.24L5 16v3h3l5.46-5.46a3 3 0 0 1 4.24-4.24l-2.2 2.2-1.5-1.5 2.2-2.2z"/>
    </svg>
  );
}

export function LeaseCheckIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9l-6-6z"/>
      <path d="M13 3v6h6"/>
      <circle cx="10.5" cy="15.5" r="2.5"/>
      <path d="M12.3 17.3L15 20"/>
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
