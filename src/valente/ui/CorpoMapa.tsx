import { COR, AREA_POR_ID, situacao, type AreaId } from '../areas';

interface Props {
  pcts: Record<AreaId, number | null>;
  onSelect: (id: AreaId) => void;
  className?: string;
}

// A imagem (aspecto 0.6) fica centrada e ocupa 70% da largura do quadro; as coordenadas do nó
// (nx, ny) são frações da imagem. Os rótulos ficam nas margens, ligados ao nó por uma linha.
const IMG_L = 15; // % da largura onde a imagem começa
const IMG_W = 70; // % da largura ocupada pela imagem

const MARCADORES: { id: AreaId; lado: 'L' | 'R'; y: number; nx: number; ny: number }[] = [
  { id: 'leitura', lado: 'L', y: 7, nx: 0.46, ny: 0.07 },
  { id: 'mindfulness', lado: 'L', y: 21, nx: 0.5, ny: 0.035 },
  { id: 'carreira', lado: 'L', y: 42, nx: 0.3, ny: 0.37 },
  { id: 'esporte', lado: 'L', y: 74, nx: 0.4, ny: 0.7 },
  { id: 'memorizacao', lado: 'R', y: 7, nx: 0.54, ny: 0.07 },
  { id: 'comunicacao', lado: 'R', y: 20, nx: 0.5, ny: 0.155 },
  { id: 'espiritual', lado: 'R', y: 33, nx: 0.5, ny: 0.22 },
  { id: 'alimentacao', lado: 'R', y: 47, nx: 0.5, ny: 0.34 },
];

const tom = (p: number | null) => COR[situacao(p)];

export default function CorpoMapa({ pcts, onSelect, className = '' }: Props) {
  return (
    <div className={`relative w-full @container ${className}`} style={{ aspectRatio: '0.82' }}>
      <img
        src="/img/corpo.jpg"
        alt=""
        className="absolute top-0 h-full select-none pointer-events-none"
        style={{ left: `${IMG_L}%`, width: `${IMG_W}%`, objectFit: 'cover', mixBlendMode: 'var(--corpo-blend)' as any, maskImage: 'radial-gradient(ellipse closest-side, #000 62%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse closest-side, #000 62%, transparent 100%)' }}
      />

      {/* linhas de ligação */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {MARCADORES.map((m) => {
          const cor = tom(pcts[m.id]);
          const x = IMG_L + m.nx * IMG_W;
          const y = m.ny * 100;
          const x0 = m.lado === 'L' ? 27 : 73;
          return <polyline key={m.id} points={`${x0},${m.y} ${(x0 + x) / 2},${m.y} ${x},${y}`} fill="none" stroke={cor} strokeWidth="1.2" vectorEffect="non-scaling-stroke" opacity="0.85" />;
        })}
      </svg>

      {/* nós no corpo */}
      {MARCADORES.map((m) => {
        const cor = tom(pcts[m.id]);
        return (
          <button
            key={`n-${m.id}`}
            onClick={() => onSelect(m.id)}
            aria-label={AREA_POR_ID[m.id].nome}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer flex items-center justify-center"
            style={{ left: `${IMG_L + m.nx * IMG_W}%`, top: `${m.ny * 100}%`, background: `${cor}33` }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: cor, boxShadow: `0 0 8px ${cor}` }} />
          </button>
        );
      })}

      {/* rótulos */}
      {MARCADORES.map((m) => {
        const area = AREA_POR_ID[m.id];
        const Icon = area.icon;
        const p = pcts[m.id];
        const cor = tom(p);
        const esq = m.lado === 'L';
        return (
          <button
            key={`l-${m.id}`}
            onClick={() => onSelect(m.id)}
            className={`absolute -translate-y-1/2 flex items-center gap-1 @sm:gap-1.5 cursor-pointer ${esq ? 'left-0 flex-row' : 'right-0 flex-row-reverse text-right'}`}
            style={{ top: `${m.y}%`, width: m.y < 25 ? '36%' : '27%' }}
          >
            <span className="shrink-0 w-[22px] h-[22px] @sm:w-[26px] @sm:h-[26px] rounded-md flex items-center justify-center" style={{ background: `${cor}22`, border: `1px solid ${cor}77`, color: cor }}>
              <Icon size={14} />
            </span>
            <span className="min-w-0 leading-none">
              <span className="block text-[10px] @sm:text-[11px] text-ink truncate">{area.nome.replace(' e Academia', '')}</span>
              <span className="block text-[15px] @sm:text-[18px] font-semibold mt-1 num" style={{ color: cor }}>{p === null ? '—' : `${p}%`}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
