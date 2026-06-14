interface LogoProps {
  size?: number;
  /** Show wordmark ("RentalRep") beside the icon. Default true. */
  showWordmark?: boolean;
  /** Show tagline beneath wordmark. Default true. */
  showTagline?: boolean;
}

export function Logo({ size = 32, showWordmark = true, showTagline = false }: LogoProps) {
  const fontSize = Math.round(size * 0.5);
  const tagSize  = Math.max(11, Math.round(size * 0.32));

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Icon: teal house outline + gold star */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        {/* House / shield body — Trust Teal */}
        <path
          d="M20 3L5 11V23C5 31.284 11.716 38 20 38C28.284 38 35 31.284 35 23V11L20 3Z"
          fill="#0E9E92"
        />
        {/* Subtle inner depth layer — darker teal */}
        <path
          d="M20 8L9 15V23C9 29.627 13.925 35.1 20.5 36.7"
          fill="#07312C"
          fillOpacity="0.25"
        />
        {/* Gold star inside */}
        <polygon
          points="20,12 21.8,17.5 27.5,17.5 22.9,20.9 24.7,26.4 20,23 15.3,26.4 17.1,20.9 12.5,17.5 18.2,17.5"
          fill="#F4B53F"
        />
      </svg>

      {showWordmark && (
        <div className="leading-none">
          <div style={{ fontSize, fontFamily: "Outfit, sans-serif", fontWeight: 700, lineHeight: 1 }}>
            <span style={{ color: "#ffffff" }}>Rental</span>
            <span style={{ color: "#2FD4C0" }}>Rep</span>
          </div>
          {showTagline && (
            <div
              style={{
                fontSize: tagSize,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 500,
                color: "#2FD4C0",
                letterSpacing: "0.04em",
                marginTop: 2,
                opacity: 0.85,
              }}
            >
              Rate. Trust. Rent with Confidence.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
