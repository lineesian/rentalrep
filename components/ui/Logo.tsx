export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="RentalRep logo">
      <path d="M16 2L4 8V18C4 24.627 9.373 30 16 30C22.627 30 28 24.627 28 18V8L16 2Z" fill="#07312C" />
      <path d="M16 7L8 12V18C8 22.971 11.602 27.1 16.4 27.9" fill="#0E9E92" fillOpacity="0.2" />
      <polygon
        points="16,10 17.5,14.5 22.5,14.5 18.5,17.5 20,22 16,19 12,22 13.5,17.5 9.5,14.5 14.5,14.5"
        fill="#F4B53F"
      />
    </svg>
  );
}
