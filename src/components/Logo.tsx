export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
        <defs><linearGradient id="fk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0E7D5" /><stop offset=".5" stopColor="#D6C39A" /><stop offset="1" stopColor="#8f7743" />
        </linearGradient></defs>
        <path d="M6 42V6h28v8H16v6h15v8H16v14z" fill="url(#fk)" />
        <path d="M30 42l12-16v16z" fill="url(#fk)" opacity=".75" />
      </svg>
      <span className="text-lg font-semibold tracking-[0.18em] text-champagne">FINANCEKORN</span>
    </span>
  );
}
