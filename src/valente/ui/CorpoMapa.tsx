import { COR, AREA_POR_ID, situacao, type AreaId } from '../areas';

interface Props {
  pcts: Record<AreaId, number | null>;
  onSelect: (id: AreaId) => void;
  className?: string;
}

// Marcador: lado do rótulo, y do rótulo e nó no corpo (o corpo está centrado em x=260).
const MARCADORES: { id: AreaId; lado: 'L' | 'R'; y: number; no: [number, number]; lx?: number }[] = [
  { id: 'leitura', lado: 'L', y: 18, no: [247, 56] },
  { id: 'mindfulness', lado: 'L', y: 84, no: [260, 36] },
  { id: 'memorizacao', lado: 'R', y: 40, no: [273, 56] },
  { id: 'comunicacao', lado: 'R', y: 112, no: [260, 106] },
  { id: 'espiritual', lado: 'R', y: 172, no: [260, 150] },
  { id: 'carreira', lado: 'L', y: 214, no: [180, 204] },
  { id: 'alimentacao', lado: 'R', y: 252, no: [260, 236] },
  { id: 'esporte', lado: 'L', y: 392, no: [244, 392], lx: 206 },
];

const tom = (p: number | null) => COR[situacao(p)];

export default function CorpoMapa({ pcts, onSelect, className = '' }: Props) {
  const corpo = { fill: 'url(#gCorpo)', stroke: 'var(--corpo-borda)', strokeWidth: 1.2, strokeLinejoin: 'round' as const };
  const hit = (id: AreaId) => ({ className: 'cursor-pointer', fill: 'transparent', onClick: () => onSelect(id) });

  return (
    <svg viewBox="0 0 520 540" className={className} role="img" aria-label="Mapa das áreas da vida">
      <defs>
        <linearGradient id="gCorpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--corpo-1)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--corpo-2)" stopOpacity="0.9" />
        </linearGradient>
        <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* silhueta */}
      <g filter="url(#brilho)" opacity="0.35">
        <ellipse cx="260" cy="62" rx="26" ry="32" fill="var(--corpo-borda)" />
        <path d="M222 128 Q260 116 298 128 L304 200 L216 200Z" fill="var(--corpo-borda)" />
      </g>
      <ellipse cx="260" cy="62" rx="26" ry="32" {...corpo} />
      <path d="M248 92 H272 V118 H248Z" {...corpo} />
      <path d="M222 122 Q260 110 298 122 Q312 128 314 142 L296 142 L296 274 L224 274 L224 142 L206 142 Q208 128 222 122Z" {...corpo} />
      <path d="M206 142 Q196 150 192 190 L186 262 Q184 272 194 274 L204 272 L214 206 L218 160Z" {...corpo} />
      <path d="M314 142 Q324 150 328 190 L334 262 Q336 272 326 274 L316 272 L306 206 L302 160Z" {...corpo} />
      <path d="M226 278 H258 L254 508 H232Z" {...corpo} />
      <path d="M262 278 H294 L288 508 H266Z" {...corpo} />
      {/* detalhes anatômicos discretos */}
      <path d="M260 124 V272" stroke="var(--corpo-borda)" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M232 168 Q260 180 288 168 M236 214 H284 M238 244 H282" stroke="var(--corpo-borda)" strokeOpacity="0.3" strokeWidth="1" fill="none" />

      {/* zonas clicáveis */}
      <ellipse cx="260" cy="62" rx="28" ry="34" {...hit('leitura')} />
      <rect x="246" y="94" width="28" height="24" {...hit('comunicacao')} />
      <rect x="222" y="124" width="76" height="76" {...hit('espiritual')} />
      <rect x="226" y="200" width="68" height="74" {...hit('alimentacao')} />
      <rect x="188" y="142" width="34" height="132" {...hit('carreira')} />
      <rect x="298" y="142" width="34" height="132" {...hit('carreira')} />
      <rect x="226" y="278" width="68" height="230" {...hit('esporte')} />

      {MARCADORES.map((m) => {
        const area = AREA_POR_ID[m.id];
        const Icon = area.icon;
        const p = pcts[m.id];
        const cor = tom(p);
        const esq = m.lado === 'L';
        const xTile = esq ? 0 : 486;
        const xTxt = esq ? 42 : 480;
        const xLinha = m.lx ?? (esq ? 136 : 384);
        const yMeio = m.y + 17;
        return (
          <g key={m.id} className="cursor-pointer" onClick={() => onSelect(m.id)} role="button" aria-label={`${area.nome} ${p ?? 'sem dado'}`}>
            <path d={`M${xLinha} ${yMeio} H${(xLinha + m.no[0]) / 2} L${m.no[0]} ${m.no[1]}`} stroke={cor} strokeWidth="1.2" fill="none" opacity="0.8" />
            <circle cx={m.no[0]} cy={m.no[1]} r="9" fill={cor} opacity="0.22" />
            <circle cx={m.no[0]} cy={m.no[1]} r="4.5" fill={cor} />
            <rect x={xTile} y={m.y} width="34" height="34" rx="5" fill={`${cor}1f`} stroke={`${cor}88`} />
            <g transform={`translate(${xTile + 8},${m.y + 8})`} style={{ color: cor }}><Icon size={18} /></g>
            <text x={xTxt} y={m.y + 14} textAnchor={esq ? 'start' : 'end'} fill="var(--color-ink)" fontSize="16" fontFamily="Inter, sans-serif">
              {area.nome}
            </text>
            <text x={xTxt} y={m.y + 40} textAnchor={esq ? 'start' : 'end'} fill={cor} fontSize="28" fontWeight="600" fontFamily="Inter, sans-serif">
              {p === null ? '—' : `${p}%`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
