// Capacete espartano da marca: crista, casco, protetores de bochecha e viseira em T.
export default function Capacete({ size = 24, cor = 'currentColor' }: { size?: number; cor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={cor} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M9 7.5C11 2.5 21 2.5 23 7.5" />
      <path d="M6.5 25V14.5C6.5 9.5 10.5 6.5 16 6.5S25.5 9.5 25.5 14.5V25L21.5 28.5V22.5H10.5V28.5Z" />
      <path d="M11.5 15.5H20.5" />
      <path d="M16 15.5V22.5" />
    </svg>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span style={{ color: '#c8d3e0' }}><Capacete size={size} /></span>
      <span className="leading-none">
        <span className="block text-[10px] tracking-[0.32em] text-mute font-mono">GENERAL</span>
        <span className="block text-[19px] font-bold tracking-[0.12em] text-ink mt-1">VALENTE</span>
      </span>
    </div>
  );
}
