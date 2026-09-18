import type { Personaje } from "../game/store";

/* ============================================================
   AVATAR DEL JUGADOR — capas, de atras hacia adelante:
   aura · sombra · capa · piernas · cabello trasero · torso+atuendo
   · brazos · hombreras · cabeza · rostro · cabello frontal · casco · mascara
   ============================================================ */
export function Avatar({ p, size = 220, animado = true }: { p: Personaje; size?: number; animado?: boolean }) {
  const w = p.complexion === "ancha" ? 1.06 : p.complexion === "esbelta" ? 0.84 : 0.95;
  const h = p.altura || 1;
  const osc = sombra(p.ropa);
  const det = p.detalle;
  const detOsc = sombra(p.detalle);
  const tapaPelo = p.cabeza === "capucha" || p.cabeza === "capuchaPico" || p.cabeza === "yelmo" || p.cabeza === "celada" || p.cabeza === "turbante" || p.cabeza === "calavera";
  const id = "av" + Math.abs(hash(JSON.stringify(p))).toString(36);
  const conCapa = p.capa !== "ninguna";
  /* el sexo ajusta hombros, cintura y rasgos, sin caricaturizar */
  const hombro = p.sexo === "m" ? 1.06 : p.sexo === "f" ? 0.94 : 1;
  const cintura = p.sexo === "f" ? 0.9 : p.sexo === "m" ? 1.02 : 0.96;
  const cara = p.sexo === "m" ? 1.03 : p.sexo === "f" ? 0.96 : 1;

  return (
    <svg viewBox="0 0 200 270" width={size} height={(size * 270) / 200} className={animado ? "avatar flota" : "avatar"} aria-label={p.nombre || "personaje"}>
      <defs>
        <radialGradient id={id + "g"} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={p.ropa} stopOpacity=".3" />
          <stop offset="100%" stopColor={p.ropa} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id + "t"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.ropa} />
          <stop offset="100%" stopColor={osc} />
        </linearGradient>
        <linearGradient id={id + "m"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9CDD6" />
          <stop offset="45%" stopColor="#8F97A6" />
          <stop offset="100%" stopColor="#5A6170" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="150" rx="86" ry="110" fill={`url(#${id}g)`} />
      <ellipse cx="100" cy="257" rx={44 * w} ry="7" fill="#000" opacity=".38" />

      <g transform={`translate(100 262) scale(${h}) translate(-100 -262)`}>
        {conCapa && (
          <>
            <path d={`M ${100 - 40 * w * hombro} 114 Q 100 106 ${100 + 40 * w * hombro} 114 L ${100 + 54 * w} 244 Q 100 252 ${100 - 54 * w} 244 Z`} fill={sombra(p.capa, .78)} />
            <path d={`M ${100 - 40 * w * hombro} 114 Q 100 122 ${100 + 40 * w * hombro} 114 L ${100 + 46 * w} 196 Q 100 190 ${100 - 46 * w} 196 Z`} fill={p.capa} opacity=".5" />
          </>
        )}

        {/* piernas y botas */}
        <rect x={100 - 25 * w} y="192" width={21 * w} height="50" rx="7" fill={detOsc} />
        <rect x={100 + 4 * w} y="192" width={21 * w} height="50" rx="7" fill={detOsc} />
        <path d={`M ${100 - 29 * w} 230 h ${27 * w} v 18 a 4 4 0 0 1 -4 4 h ${-19 * w} a 4 4 0 0 1 -4 -4 Z`} fill="#231A2E" />
        <path d={`M ${100 + 2 * w} 230 h ${27 * w} v 18 a 4 4 0 0 1 -4 4 h ${-19 * w} a 4 4 0 0 1 -4 -4 Z`} fill="#231A2E" />
        <rect x={100 - 29 * w} y="229" width={27 * w} height="4.5" rx="2" fill={det} />
        <rect x={100 + 2 * w} y="229" width={27 * w} height="4.5" rx="2" fill={det} />

        <CabelloTrasero estilo={p.cabello} color={p.colorCabello} oculto={tapaPelo} />

        <Atuendo tipo={p.atuendo} w={w} hombro={hombro} cintura={cintura} ropa={p.ropa} osc={osc} det={det} detOsc={detOsc}
          grad={`url(#${id}t)`} metal={`url(#${id}m)`} />

        <Brazos w={w} hombro={hombro} ropa={p.ropa} osc={osc} piel={p.piel} det={det} brazaletes={p.brazaletes} metal={`url(#${id}m)`} atuendo={p.atuendo} />

        {(p.atuendo === "asesino" || p.atuendo === "sombra") && p.brazaletes && <HojaOculta x={100 - 46 * w} y={186} w={w} det={p.detalle} />}

        {p.hombrera && <Hombreras w={w} hombro={hombro} det={det} detOsc={detOsc} metal={`url(#${id}m)`} atuendo={p.atuendo} />}

        {/* cabeza */}
        <rect x="92" y="96" width="16" height="20" rx="5" fill={sombra(p.piel, .82)} />
        <ellipse cx="100" cy="66" rx={32 * cara} ry={35 * cara} fill={p.piel} />
        <ellipse cx={100 - 31 * cara} cy="70" rx="5.5" ry="7.5" fill={p.piel} />
        <ellipse cx={100 + 31 * cara} cy="70" rx="5.5" ry="7.5" fill={p.piel} />

        <Ojos color={p.ojos} sexo={p.sexo} />
        <path d="M 97 74 q 3 3 6 0" stroke={sombra(p.piel, .8)} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 91 84 Q 100 91 109 84" stroke={sombra(p.piel, .72)} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="83" cy="79" r="4.2" fill="#FF7A9A" opacity=".3" />
        <circle cx="117" cy="79" r="4.2" fill="#FF7A9A" opacity=".3" />
        <Vello tipo={p.vello} color={p.colorCabello} />

        <CabelloFrontal estilo={p.cabello} color={p.colorCabello} oculto={tapaPelo} />

        <Cabeza tipo={p.cabeza} ropa={p.ropa} osc={osc} det={det} detOsc={detOsc} w={w} metal={`url(#${id}m)`} piel={p.piel} />
        <Rostro tipo={p.rostro} det={det} ropa={p.ropa} />
      </g>
    </svg>
  );
}

/* ---------- hombreras segun el atuendo ---------- */
function Hombreras({ w, hombro, det, detOsc, metal, atuendo }:
  { w: number; hombro: number; det: string; detOsc: string; metal: string; atuendo: string }) {
  const L = 100 - 47 * w * hombro, R = 100 + 47 * w * hombro;
  const duro = atuendo === "placas" || atuendo === "guardia" || atuendo === "diablo";
  if (duro) return (
    <g>
      <path d={`M ${L} 112 q ${-13 * w} 16 ${-5 * w} 32 q ${18 * w} 6 ${26 * w} -8 Z`} fill={metal} />
      <path d={`M ${R} 112 q ${13 * w} 16 ${5 * w} 32 q ${-18 * w} 6 ${-26 * w} -8 Z`} fill={metal} />
      <path d={`M ${L - 9 * w} 126 q ${9 * w} 8 ${19 * w} 6`} stroke={detOsc} strokeWidth="2" fill="none" />
      <path d={`M ${R + 9 * w} 126 q ${-9 * w} 8 ${-19 * w} 6`} stroke={detOsc} strokeWidth="2" fill="none" />
      {atuendo === "diablo" && (<>
        <circle cx={L - 4 * w} cy="130" r="3" fill="#FF6B35" />
        <circle cx={R + 4 * w} cy="130" r="3" fill="#FF6B35" />
      </>)}
    </g>
  );
  return (
    <g>
      <path d={`M ${L} 114 q ${-11 * w} 14 ${-4 * w} 28 q ${15 * w} 5 ${23 * w} -6 Z`} fill={det} />
      <path d={`M ${R} 114 q ${11 * w} 14 ${4 * w} 28 q ${-15 * w} 5 ${-23 * w} -6 Z`} fill={detOsc} />
      <path d={`M ${L} 122 q ${-7 * w} 9 ${-3 * w} 17`} stroke={detOsc} strokeWidth="1.6" fill="none" />
      <path d={`M ${R} 122 q ${7 * w} 9 ${3 * w} 17`} stroke={det} strokeWidth="1.6" fill="none" opacity=".5" />
    </g>
  );
}

/* ---------- cascos, capuchas y tocados ---------- */
function Cabeza({ tipo, ropa, osc, det, detOsc, w, metal, piel }:
  { tipo: string; ropa: string; osc: string; det: string; detOsc: string; w: number; metal: string; piel: string }) {
  switch (tipo) {
    case "capucha": case "capuchaPico": {
      const pico = tipo === "capuchaPico";
      return (
        <g>
          <path d={pico
            ? "M 100 12 Q 62 24 62 78 Q 64 92 70 96 Q 66 50 82 40 Q 91 33 100 33 Q 109 33 118 40 Q 134 50 130 96 Q 136 92 138 78 Q 138 24 100 12 Z"
            : "M 100 18 Q 64 30 64 78 Q 66 92 72 96 Q 68 52 84 43 Q 92 38 100 38 Q 108 38 116 43 Q 132 52 128 96 Q 134 92 136 78 Q 136 30 100 18 Z"}
            fill={ropa} />
          <path d={`M 66 84 Q 58 108 ${100 - 40 * w} 128 L ${100 - 26 * w} 124 Q 70 106 74 84 Z`} fill={osc} />
          <path d={`M 134 84 Q 142 108 ${100 + 40 * w} 128 L ${100 + 26 * w} 124 Q 130 106 126 84 Z`} fill={osc} />
          <path d="M 72 70 Q 72 42 100 38 Q 128 42 128 70 Q 120 48 100 46 Q 80 48 72 70 Z" fill="#0A0710" opacity=".5" />
          <path d={pico ? "M 70 96 Q 66 50 82 40 Q 91 33 100 33 Q 109 33 118 40 Q 134 50 130 96" : "M 72 96 Q 68 52 84 43 Q 92 38 100 38 Q 108 38 116 43 Q 132 52 128 96"}
            stroke={det} strokeWidth="2.4" fill="none" opacity=".85" />
          {pico && <path d="M 100 12 Q 116 20 112 40 Q 106 27 96 25 Z" fill={det} />}
        </g>
      );
    }
    case "yelmo": return (
      <g>
        <path d="M 68 66 Q 68 26 100 24 Q 132 26 132 66 L 132 78 L 68 78 Z" fill={metal} />
        <path d="M 68 78 L 132 78 L 132 86 Q 100 92 68 86 Z" fill={det} />
        <path d="M 100 24 L 100 78" stroke={detOsc} strokeWidth="2.5" />
        <path d="M 96 40 L 104 40 L 104 72 L 96 72 Z" fill="#0A0710" opacity=".75" />
        <path d="M 74 56 Q 68 58 66 62" stroke={detOsc} strokeWidth="2" fill="none" />
        <path d="M 126 56 Q 132 58 134 62" stroke={detOsc} strokeWidth="2" fill="none" />
      </g>
    );
    case "celada": return (
      <g>
        <path d="M 66 64 Q 66 22 100 20 Q 134 22 134 64 L 134 92 Q 100 100 66 92 Z" fill={metal} />
        <path d="M 66 56 Q 100 50 134 56 L 134 64 Q 100 58 66 64 Z" fill={detOsc} opacity=".7" />
        {[0, 1, 2].map((i) => <path key={i} d={`M 76 ${72 + i * 7} L 124 ${72 + i * 7}`} stroke="#0A0710" strokeWidth="3" opacity=".85" />)}
        <path d="M 72 62 Q 100 56 128 62" stroke="#0A0710" strokeWidth="5" fill="none" />
        <path d="M 100 20 Q 106 12 100 4 Q 94 12 100 20 Z" fill={det} />
        <path d="M 100 20 L 100 56" stroke={detOsc} strokeWidth="2" />
      </g>
    );
    case "corona": return (
      <g>
        <path d="M 70 46 L 76 22 L 86 38 L 100 16 L 114 38 L 124 22 L 130 46 Z" fill="#D9A441" />
        <path d="M 68 46 h 64 v 9 h -64 Z" fill="#C08B2E" />
        <circle cx="100" cy="26" r="3.5" fill="#FF3B5C" />
        <circle cx="79" cy="32" r="2.5" fill="#2DD4A7" />
        <circle cx="121" cy="32" r="2.5" fill="#7CD5FF" />
      </g>
    );
    case "diadema": return (
      <g>
        <path d="M 72 50 Q 100 36 128 50" stroke={det} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="41" r="4" fill="#FFB05C" />
      </g>
    );
    case "sombrero": return (
      <g>
        <ellipse cx="100" cy="54" rx="52" ry="11" fill={sombra(det, .8)} />
        <ellipse cx="100" cy="52" rx="52" ry="10" fill={det} />
        <path d="M 78 52 Q 76 22 100 20 Q 124 22 122 52 Z" fill={det} />
        <path d="M 78 46 Q 100 40 122 46 L 122 52 Q 100 46 78 52 Z" fill={sombra(det, .65)} />
        <path d="M 108 20 q 10 6 12 18" stroke={ropa} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
    case "turbante": return (
      <g>
        <path d="M 66 62 Q 64 26 100 22 Q 136 26 134 62 Q 118 48 100 48 Q 82 48 66 62 Z" fill={ropa} />
        <path d="M 68 54 Q 100 40 132 54" stroke={det} strokeWidth="5" fill="none" />
        <path d="M 70 44 Q 100 30 130 44" stroke={sombra(ropa, .72)} strokeWidth="4" fill="none" />
        <circle cx="100" cy="30" r="4" fill={det} />
        <path d="M 130 58 q 14 18 8 40 q -8 -14 -16 -26 Z" fill={ropa} opacity=".9" />
      </g>
    );
    case "cuernos": return (
      <g>
        <path d="M 74 44 Q 60 28 62 10 Q 76 22 82 42 Z" fill="#3A1410" />
        <path d="M 126 44 Q 140 28 138 10 Q 124 22 118 42 Z" fill="#3A1410" />
        <path d="M 74 44 Q 64 30 64 16" stroke="#D9483B" strokeWidth="1.6" fill="none" opacity=".7" />
        <path d="M 126 44 Q 136 30 136 16" stroke="#D9483B" strokeWidth="1.6" fill="none" opacity=".7" />
        <path d="M 72 48 Q 100 36 128 48" stroke="#3A1410" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="42" r="4" fill="#FF6B35" />
      </g>
    );
    case "calavera": return (
      <g>
        <path d="M 68 58 Q 68 20 100 18 Q 132 20 132 58 Q 132 74 122 80 L 78 80 Q 68 74 68 58 Z" fill="#D8D2C4" />
        <ellipse cx="86" cy="56" rx="9" ry="11" fill="#0A0710" />
        <ellipse cx="114" cy="56" rx="9" ry="11" fill="#0A0710" />
        <path d="M 100 64 L 95 76 L 105 76 Z" fill="#0A0710" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${86 + i * 7} 80 L ${86 + i * 7} 88`} stroke="#D8D2C4" strokeWidth="4" strokeLinecap="round" />)}
        <path d="M 68 44 Q 100 34 132 44" stroke="#B8B0A0" strokeWidth="2" fill="none" />
      </g>
    );
    default: return null;
  }
}

/* ---------- mascaras y anteojos ---------- */
function Rostro({ tipo, det, ropa }: { tipo: string; det: string; ropa: string }) {
  switch (tipo) {
    case "lentes": return (
      <g>
        <circle cx="88" cy="68" r="9" fill="#0A0710" opacity=".18" />
        <circle cx="112" cy="68" r="9" fill="#0A0710" opacity=".18" />
        <circle cx="88" cy="68" r="9" fill="none" stroke="#2A2035" strokeWidth="2.2" />
        <circle cx="112" cy="68" r="9" fill="none" stroke="#2A2035" strokeWidth="2.2" />
        <path d="M 97 68 L 103 68 M 79 68 L 70 66 M 121 68 L 130 66" stroke="#2A2035" strokeWidth="2.2" fill="none" />
      </g>
    );
    case "monoculo": return (
      <g>
        <circle cx="112" cy="68" r="11" fill="#7CD5FF" opacity=".14" />
        <circle cx="112" cy="68" r="11" fill="none" stroke="#D9A441" strokeWidth="2.4" />
        <path d="M 112 79 q 3 14 -4 22" stroke="#D9A441" strokeWidth="1.4" fill="none" />
      </g>
    );
    case "antifaz": return <path d="M 71 60 Q 100 52 129 60 L 127 76 Q 100 69 73 76 Z" fill="#14101C" opacity=".92" />;
    case "mascaraMedia": return (
      <g>
        <path d="M 70 76 Q 100 70 130 76 L 128 96 Q 100 104 72 96 Z" fill={det} />
        <path d="M 70 76 Q 100 70 130 76" stroke={sombra(det, .7)} strokeWidth="2" fill="none" />
        <path d="M 88 86 L 112 86" stroke={sombra(det, .6)} strokeWidth="1.6" />
      </g>
    );
    case "respirador": return (
      <g>
        <path d="M 74 74 Q 100 68 126 74 L 124 94 Q 100 102 76 94 Z" fill="#3A3140" />
        <circle cx="86" cy="86" r="6" fill="#1B1220" stroke="#8F97A6" strokeWidth="1.6" />
        <circle cx="114" cy="86" r="6" fill="#1B1220" stroke="#8F97A6" strokeWidth="1.6" />
        <path d="M 92 86 L 108 86" stroke="#8F97A6" strokeWidth="2" />
        <path d="M 74 78 L 64 74 M 126 78 L 136 74" stroke="#3A3140" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
    case "velo": return (
      <g>
        <path d="M 70 72 Q 100 66 130 72 L 130 104 Q 100 112 70 104 Z" fill={ropa} opacity=".92" />
        <path d="M 70 72 Q 100 66 130 72" stroke={det} strokeWidth="2" fill="none" />
        <path d="M 76 88 Q 100 94 124 88" stroke={sombra(ropa, .7)} strokeWidth="1.4" fill="none" />
      </g>
    );
    default: return null;
  }
}

/* ---------- atuendos ---------- */
function Atuendo({ tipo, w, hombro, cintura, ropa, osc, det, detOsc, grad, metal }:
  { tipo: string; w: number; hombro: number; cintura: number; ropa: string; osc: string; det: string; detOsc: string; grad: string; metal: string }) {
  const HL = 100 - 40 * w * hombro, HR = 100 + 40 * w * hombro;
  const CL = 100 - 36 * w * cintura, CR = 100 + 36 * w * cintura;
  const torso = `M ${HL} 114 Q 100 104 ${HR} 114 L ${CR} 196 Q 100 204 ${CL} 196 Z`;
  const L = (k: number) => 100 - k * w, R = (k: number) => 100 + k * w;

  switch (tipo) {
    case "asesino": return (
      <g>
        <path d={torso} fill={grad} />
        <path d={`M ${HL} 114 Q 100 104 ${HR} 114 L ${R(26)} 142 L ${L(14)} 196 L ${CL} 196 Z`} fill={osc} opacity=".5" />
        <path d={`M ${HR} 116 L ${R(26)} 144 L ${L(14)} 196`} stroke={det} strokeWidth="3.2" fill="none" />
        <path d={`M ${L(37)} 160 h ${74 * w} v 18 h ${-74 * w} Z`} fill={det} />
        <path d={`M ${L(37)} 175 h ${74 * w} v 5 h ${-74 * w} Z`} fill={detOsc} />
        <path d={`M ${R(28)} 160 l ${8 * w} 22 l ${-13 * w} -4 Z`} fill={detOsc} />
        <path d={`M ${L(33)} 124 L ${R(29)} 166`} stroke={detOsc} strokeWidth="7.5" strokeLinecap="round" />
        <circle cx={L(2)} cy={146} r="6" fill="#FFB05C" />
        <path d={`M ${L(30)} 184 L ${L(25)} 216 L ${L(9)} 190 Z`} fill={osc} />
        <path d={`M ${R(30)} 184 L ${R(25)} 216 L ${R(9)} 190 Z`} fill={osc} />
      </g>
    );

    case "sombra": return (
      <g>
        <path d={torso} fill={grad} />
        <path d={`M ${L(32)} 120 Q 100 112 ${R(32)} 120 L ${R(28)} 170 Q 100 178 ${L(28)} 170 Z`} fill={osc} />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${L(30)} ${130 + i * 13} Q 100 ${136 + i * 13} ${R(30)} ${130 + i * 13}`} stroke={detOsc} strokeWidth="2" fill="none" opacity=".8" />)}
        <path d={`M ${L(34)} 120 L ${R(30)} 172`} stroke={det} strokeWidth="6" strokeLinecap="round" />
        <path d={`M ${R(34)} 120 L ${L(30)} 172`} stroke={detOsc} strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="146" r="6.5" fill={det} /><circle cx="100" cy="146" r="2.6" fill="#FFB05C" />
        <rect x={L(37)} y="168" width={74 * w} height="10" rx="3" fill={detOsc} />
        <path d={`M ${L(30)} 178 l 0 16 l ${4 * w} -4 l ${4 * w} 4 l 0 -16 Z`} fill="#9AA7B4" />
        <path d={`M ${R(22)} 178 l 0 16 l ${4 * w} -4 l ${4 * w} 4 l 0 -16 Z`} fill="#9AA7B4" />
      </g>
    );

    /* ---- PARCA: sudario deshilachado y costillas grabadas ---- */
    case "parca": return (
      <g>
        <path d={`M ${HL} 112 Q 100 102 ${HR} 112
                  L ${R(34)} 190 L ${R(28)} 214 L ${R(22)} 192 L ${R(14)} 220 L ${R(6)} 194
                  L 100 224 L ${L(6)} 194 L ${L(14)} 220 L ${L(22)} 192 L ${L(28)} 214 L ${L(34)} 190 Z`} fill={grad} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} opacity=".55">
            <path d={`M ${L(22)} ${132 + i * 13} Q 100 ${138 + i * 13} ${R(22)} ${132 + i * 13}`} stroke={detOsc} strokeWidth="2.2" fill="none" />
          </g>
        ))}
        <path d="M 100 118 L 100 182" stroke={detOsc} strokeWidth="3" opacity=".7" />
        <path d={`M ${L(30)} 118 Q 100 128 ${R(30)} 118`} stroke={det} strokeWidth="2.4" fill="none" opacity=".6" />
        <circle cx="100" cy="128" r="5" fill="#2A1A10" stroke="#7A5A28" strokeWidth="1.2" />
        <circle cx="100" cy="128" r="1.6" fill="#8B0A1E" />
      </g>
    );

    /* ---- INFERNAL: placas con grietas de brasa ---- */
    case "diablo": return (
      <g>
        <path d={torso} fill={grad} />
        <path d={`M ${L(34)} 118 Q 100 110 ${R(34)} 118 L ${R(28)} 168 Q 100 178 ${L(28)} 168 Z`} fill="#2A0E0A" />
        <path d={`M ${L(24)} 122 L ${L(14)} 150 L ${L(20)} 152 L ${L(10)} 172`} stroke="#FF6B35" strokeWidth="2.2" fill="none" />
        <path d={`M ${R(24)} 126 L ${R(12)} 148 L ${R(18)} 152 L ${R(8)} 170`} stroke="#FF3B1F" strokeWidth="2" fill="none" />
        <path d={`M 100 118 L 100 172`} stroke="#FF6B35" strokeWidth="1.6" opacity=".8" />
        <rect x={L(37)} y="166" width={74 * w} height="12" rx="3" fill="#3A1410" />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={L(26) + i * 17 * w} cy="172" r="3.2" fill="#FF6B35" />)}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${L(32) + i * 17 * w} 180 l ${7 * w} 30 l ${7 * w} -30 Z`} fill={i % 2 ? "#3A1410" : "#5A1A12"} />
        ))}
        <circle cx="100" cy="140" r="7" fill="#FF6B35" opacity=".35" />
        <circle cx="100" cy="140" r="3.5" fill="#FFD36B" />
      </g>
    );

    case "explorador": return (
      <g>
        <path d={torso} fill={grad} />
        <path d={`M ${HL} 114 Q 100 106 ${HR} 114 L ${R(30)} 138 Q 100 128 ${L(30)} 138 Z`} fill={det} />
        <path d={`M ${L(14)} 116 L ${L(4)} 152 L 100 130 Z`} fill={detOsc} />
        <path d={`M ${R(14)} 116 L ${R(4)} 152 L 100 130 Z`} fill={detOsc} />
        {[0, 1, 2].map((i) => <circle key={i} cx="100" cy={138 + i * 11} r="2.6" fill={det} />)}
        <rect x={L(37)} y="158" width={74 * w} height="9" rx="3" fill={detOsc} />
        <rect x={L(37)} y="172" width={74 * w} height="7" rx="3" fill={det} />
        <rect x={100 - 7} y="156" width="14" height="13" rx="3" fill="#FFB05C" />
        <rect x={L(45)} y="166" width={14 * w} height="18" rx="4" fill={detOsc} />
        <ellipse cx={R(38)} cy="176" rx={8 * w} ry="10" fill={detOsc} />
      </g>
    );

    /* ---- NOMADA: capas de tela ligera y cuerda al hombro ---- */
    case "nomada": return (
      <g>
        <path d={`M ${HL} 114 Q 100 104 ${HR} 114 L ${R(40)} 210 Q 100 220 ${L(40)} 210 Z`} fill={grad} />
        <path d={`M ${HL} 114 Q 100 106 ${HR} 114 L ${R(24)} 150 L ${L(30)} 178 L ${L(40)} 160 Z`} fill={det} opacity=".8" />
        <path d={`M ${L(40)} 176 Q 100 188 ${R(40)} 176`} stroke={detOsc} strokeWidth="5" fill="none" />
        <path d={`M ${L(40)} 194 Q 100 204 ${R(40)} 194`} stroke={det} strokeWidth="3.5" fill="none" opacity=".7" />
        <path d={`M ${L(30)} 114 Q ${L(40)} 150 ${L(28)} 186`} stroke={detOsc} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={L(29)} cy="150" r="3.5" fill="#D9A441" />
        <path d={`M ${R(30)} 186 l ${6 * w} 22 l ${-14 * w} -6 Z`} fill={osc} />
      </g>
    );

    case "erudito": return (
      <g>
        <path d={`M ${100 - 42 * w} 114 Q 100 102 ${100 + 42 * w} 114 L ${100 + 40 * w} 208 Q 100 218 ${100 - 40 * w} 208 Z`} fill={grad} />
        <path d={`M ${L(20)} 108 Q 100 124 ${R(20)} 108 L ${R(16)} 96 Q 100 108 ${L(16)} 96 Z`} fill={det} />
        <path d={`M ${L(15)} 112 L ${L(19)} 204 L ${L(8)} 204 L ${L(6)} 114 Z`} fill={det} />
        <path d={`M ${R(15)} 112 L ${R(19)} 204 L ${R(8)} 204 L ${R(6)} 114 Z`} fill={det} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}><circle cx={L(13)} cy={132 + i * 18} r="2.4" fill={detOsc} /><circle cx={R(13)} cy={132 + i * 18} r="2.4" fill={detOsc} /></g>
        ))}
        <path d="M 100 118 L 100 132" stroke={detOsc} strokeWidth="2" />
        <circle cx="100" cy="138" r="7" fill="#FFB05C" /><circle cx="100" cy="138" r="3" fill={osc} />
      </g>
    );

    case "arcano": return (
      <g>
        <path d={`M ${100 - 41 * w} 114 Q 100 103 ${100 + 41 * w} 114 L ${100 + 38 * w} 206 Q 100 216 ${100 - 38 * w} 206 Z`} fill={grad} />
        <path d={`M ${100 - 41 * w} 122 Q 100 112 ${100 + 41 * w} 122`} stroke={det} strokeWidth="3" fill="none" />
        {[0, 1, 2, 3, 4].map((i) => (
          <text key={i} x={L(30) - 2 + i * 15 * w} y="136" fontSize="9" fill={det} opacity=".85" fontFamily="monospace">{["◇", "△", "◎", "▽", "✦"][i]}</text>
        ))}
        <path d="M 100 140 L 100 176" stroke={osc} strokeWidth="3" />
        <rect x={L(37)} y="168" width={74 * w} height="11" rx="4" fill={detOsc} />
        {[0, 1, 2].map((i) => <circle key={i} cx={L(18) + i * 18 * w} cy="173.5" r="3.4" fill="#FFB05C" opacity=".9" />)}
        <circle cx={R(36)} cy="186" r={9 * w} fill={det} opacity=".35" />
        <circle cx={R(36)} cy="186" r={5.5 * w} fill="#B794F6" />
        <circle cx={R(36)} cy="186" r={2.4 * w} fill="#FFF" opacity=".85" />
      </g>
    );

    case "guardia": return (
      <g>
        <path d={torso} fill={grad} />
        <path d={`M ${L(34)} 118 Q 100 108 ${R(34)} 118 L ${R(28)} 162 Q 100 172 ${L(28)} 162 Z`} fill={det} />
        <path d="M 100 112 L 100 166" stroke={detOsc} strokeWidth="2.5" />
        <path d={`M ${L(26)} 132 Q 100 142 ${R(26)} 132`} stroke={detOsc} strokeWidth="2.5" fill="none" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}><circle cx={L(26) + i * 6} cy="124" r="1.8" fill={detOsc} /><circle cx={R(26) - i * 6} cy="124" r="1.8" fill={detOsc} /></g>
        ))}
        <rect x={L(37)} y="160" width={74 * w} height="10" rx="3" fill={detOsc} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={L(34) + i * 17 * w} y="170" width={15 * w} height="28" rx="4" fill={i % 2 ? detOsc : det} />)}
      </g>
    );

    /* ---- CORAZA: armadura completa de placas ---- */
    case "placas": return (
      <g>
        <path d={torso} fill={metal} />
        <path d={`M ${L(20)} 106 Q 100 118 ${R(20)} 106 L ${R(16)} 98 Q 100 108 ${L(16)} 98 Z`} fill={metal} />
        <path d={`M ${L(34)} 120 Q 100 112 ${R(34)} 120 L ${R(30)} 150 Q 100 160 ${L(30)} 150 Z`} fill="#A7AEBC" />
        <path d={`M ${L(30)} 152 Q 100 162 ${R(30)} 152 L ${R(27)} 172 Q 100 182 ${L(27)} 172 Z`} fill="#98A0AF" />
        <path d="M 100 112 L 100 176" stroke="#6A7382" strokeWidth="2.4" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}><circle cx={L(31)} cy={124 + i * 9} r="1.6" fill="#6A7382" /><circle cx={R(31)} cy={124 + i * 9} r="1.6" fill="#6A7382" /></g>
        ))}
        <path d={`M ${L(34)} 118 Q 100 128 ${R(34)} 118`} stroke={det} strokeWidth="3" fill="none" />
        <rect x={L(37)} y="174" width={74 * w} height="9" rx="3" fill={det} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${L(36) + i * 14.5 * w} 184 h ${13 * w} l ${-2 * w} 22 h ${-9 * w} Z`} fill={i % 2 ? "#98A0AF" : "#A7AEBC"} />)}
      </g>
    );

    /* ---- HERALDO: jubon con galones y banda ---- */
    case "real": return (
      <g>
        <path d={torso} fill={grad} />
        <path d={`M ${L(20)} 108 Q 100 122 ${R(20)} 108 L ${R(15)} 98 Q 100 110 ${L(15)} 98 Z`} fill={det} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <path d={`M ${L(18)} ${128 + i * 13} L ${R(18)} ${128 + i * 13}`} stroke={det} strokeWidth="2.6" />
            <circle cx={L(18)} cy={128 + i * 13} r="2" fill={det} />
            <circle cx={R(18)} cy={128 + i * 13} r="2" fill={det} />
          </g>
        ))}
        <path d={`M ${HL} 118 L ${R(28)} 190 L ${R(16)} 196 L ${L(34)} 126 Z`} fill={det} opacity=".85" />
        <path d={`M ${HL} 118 L ${R(28)} 190`} stroke={detOsc} strokeWidth="1.6" />
        <circle cx={L(6)} cy="158" r="8" fill="#D9A441" />
        <circle cx={L(6)} cy="158" r="3.5" fill={osc} />
        <rect x={L(37)} y="172" width={74 * w} height="10" rx="3" fill={detOsc} />
        <path d={`M ${L(28)} 190 L ${L(22)} 214 L ${L(6)} 194 Z`} fill={osc} />
        <path d={`M ${R(28)} 190 L ${R(22)} 214 L ${R(6)} 194 Z`} fill={osc} />
      </g>
    );

    default: return (
      <g>
        <path d={torso} fill={grad} />
        <rect x={L(37)} y="160" width={74 * w} height="10" rx="4" fill={det} />
        <rect x={100 - 6} y="158" width="12" height="14" rx="3" fill="#FFB05C" />
        <path d="M 100 116 L 100 160" stroke={osc} strokeWidth="3" strokeLinecap="round" />
        <path d={`M ${L(30)} 192 L ${L(26)} 214 L ${L(10)} 194 Z`} fill={osc} />
        <path d={`M ${R(30)} 192 L ${R(26)} 214 L ${R(10)} 194 Z`} fill={osc} />
      </g>
    );
  }
}

/* hoja oculta del asesino, sobre el antebrazo */
function HojaOculta({ x, y, w, det }: { x: number; y: number; w: number; det: string }) {
  return (
    <g>
      <rect x={x - 7 * w} y={y - 10} width={14 * w} height="12" rx="3" fill={det} />
      <path d={`M ${x - 2 * w} ${y + 2} L ${x + 2 * w} ${y + 2} L ${x} ${y + 20} Z`} fill="#9AA7B4" />
    </g>
  );
}

/* ---------- brazos ---------- */
function Brazos({ w, hombro, ropa, osc, piel, det, brazaletes, metal, atuendo }:
  { w: number; hombro: number; ropa: string; osc: string; piel: string; det: string; brazaletes: boolean; metal: string; atuendo: string }) {
  const xi = 100 - 40 * w * hombro, xd = 100 + 40 * w * hombro;
  const duro = atuendo === "placas";
  const col = duro ? metal : ropa;
  const colD = duro ? metal : osc;
  return (
    <g>
      <path d={`M ${xi} 134 Q ${xi - 13 * w} 162 ${xi - 6 * w} 190`} stroke={sombra(ropa, .5)} strokeWidth={19 * w} strokeLinecap="round" fill="none" />
      <path d={`M ${xd} 134 Q ${xd + 13 * w} 162 ${xd + 6 * w} 190`} stroke={sombra(ropa, .5)} strokeWidth={19 * w} strokeLinecap="round" fill="none" />
      <path d={`M ${xi} 134 Q ${xi - 13 * w} 162 ${xi - 6 * w} 190`} stroke={col} strokeWidth={15 * w} strokeLinecap="round" fill="none" />
      <path d={`M ${xd} 134 Q ${xd + 13 * w} 162 ${xd + 6 * w} 190`} stroke={colD} strokeWidth={15 * w} strokeLinecap="round" fill="none" />
      {brazaletes && (
        <>
          <path d={`M ${xi - 10 * w} 176 q ${8 * w} 4 ${10 * w} 0`} stroke={duro ? metal : det} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d={`M ${xd + 10 * w} 176 q ${-8 * w} 4 ${-10 * w} 0`} stroke={duro ? metal : det} strokeWidth="9" strokeLinecap="round" fill="none" />
        </>
      )}
      <circle cx={xi - 6 * w} cy="194" r={8.5 * w} fill={piel} stroke={sombra(piel, .7)} strokeWidth="1" />
      <circle cx={xd + 6 * w} cy="194" r={8.5 * w} fill={piel} stroke={sombra(piel, .7)} strokeWidth="1" />
    </g>
  );
}

/* ---------- cascos, capuchas y tocados ---------- */

function Ojos({ color, sexo }: { color: string; sexo?: string }) {
  const pestanas = sexo === "f";
  return (
    <g className="ojos">
      <ellipse cx="88" cy="68" rx="6" ry="7.2" fill="#fff" />
      <ellipse cx="112" cy="68" rx="6" ry="7.2" fill="#fff" />
      <ellipse cx="89" cy="69" rx="3.6" ry="4.6" fill={color} />
      <ellipse cx="113" cy="69" rx="3.6" ry="4.6" fill={color} />
      <circle cx="90.2" cy="66.9" r="1.3" fill="#fff" />
      <circle cx="114.2" cy="66.9" r="1.3" fill="#fff" />
      <path d="M 81 58 Q 88 54.5 95 58" stroke="#1B1220" strokeWidth={sexo === "m" ? 2.8 : 2.2} strokeLinecap="round" fill="none" />
      <path d="M 105 58 Q 112 54.5 119 58" stroke="#1B1220" strokeWidth={sexo === "m" ? 2.8 : 2.2} strokeLinecap="round" fill="none" />
      {pestanas && (<>
        <path d="M 81.5 65 L 78 62.5 M 94.5 65 L 98 62.5" stroke="#1B1220" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 105.5 65 L 102 62.5 M 118.5 65 L 122 62.5" stroke="#1B1220" strokeWidth="1.6" strokeLinecap="round" />
      </>)}
    </g>
  );
}

function Vello({ tipo, color }: { tipo: string; color: string }) {
  if (tipo === "barba") return <path d="M 70 70 Q 72 104 100 106 Q 128 104 130 70 Q 125 92 100 94 Q 75 92 70 70 Z" fill={color} opacity=".92" />;
  if (tipo === "candado") return (
    <>
      <path d="M 94 90 q 6 -2 12 0 q -1 10 -6 11 q -5 -1 -6 -11 Z" fill={color} />
      <path d="M 91 80 q 9 -3 18 0" stroke={color} strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </>
  );
  if (tipo === "perilla") return <path d="M 94 92 q 6 -2 12 0 q -2 12 -6 13 q -4 -1 -6 -13 Z" fill={color} />;
  if (tipo === "bigote") return <path d="M 91 80 q 9 -4 18 0 q -4.5 5 -9 5 q -4.5 0 -9 -5 Z" fill={color} />;
  return null;
}

/* cabello dividido en dos capas para que nunca tape el rostro */
function CabelloTrasero({ estilo, color, oculto }: { estilo: string; color: string; oculto: boolean }) {
  if (oculto) return null;
  if (estilo === "largo") return <path d="M 68 52 Q 58 122 74 142 L 126 142 Q 142 122 132 52 Z" fill={sombra(color, .85)} />;
  if (estilo === "ondulado") return <path d="M 68 54 Q 58 112 72 132 Q 80 124 87 130 Q 94 122 100 130 Q 106 122 113 130 Q 120 124 128 132 Q 142 112 132 54 Z" fill={sombra(color, .85)} />;
  if (estilo === "trenzas") return (
    <>
      <path d="M 74 84 Q 64 114 70 138" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M 126 84 Q 136 114 130 138" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="70" cy="139" r="3.5" fill={sombra(color, .7)} />
      <circle cx="130" cy="139" r="3.5" fill={sombra(color, .7)} />
    </>
  );
  if (estilo === "chongo") return <circle cx="100" cy="26" r="12.5" fill={sombra(color, .88)} />;
  return null;
}

function CabelloFrontal({ estilo, color, oculto }: { estilo: string; color: string; oculto: boolean }) {
  if (oculto) return null;
  switch (estilo) {
    case "corto":     return <path d="M 69 58 Q 70 30 100 30 Q 130 30 131 58 Q 122 42 100 44 Q 78 42 69 58 Z" fill={color} />;
    case "largo":     return <path d="M 68 56 Q 68 28 100 28 Q 132 28 132 56 Q 124 40 113 43 Q 100 36 87 43 Q 76 40 68 56 Z" fill={color} />;
    case "ondulado":  return <path d="M 68 56 Q 70 28 100 28 Q 130 28 132 56 Q 125 44 117 47 Q 109 38 100 43 Q 91 38 83 47 Q 75 44 68 56 Z" fill={color} />;
    case "chongo":    return <path d="M 69 58 Q 70 32 100 32 Q 130 32 131 58 Q 122 44 100 46 Q 78 44 69 58 Z" fill={color} />;
    case "rapado":    return <path d="M 71 55 Q 72 36 100 34 Q 128 36 129 55 Q 118 46 100 46 Q 82 46 71 55 Z" fill={color} opacity=".5" />;
    case "trenzas":   return <path d="M 68 56 Q 68 28 100 28 Q 132 28 132 56 Q 122 40 100 42 Q 78 40 68 56 Z" fill={color} />;
    case "mohawk":    return (
      <>
        <path d="M 74 53 Q 82 42 100 40 Q 118 42 126 53 Q 113 46 100 48 Q 87 46 74 53 Z" fill={sombra(color, .55)} />
        <path d="M 91 46 L 94 14 L 100 36 L 106 11 L 109 46 Z" fill={color} />
      </>
    );
    default: return null;
  }
}

/* ============================================================
   UMBRA — el Archivista. Una parca, no una mascota.
   ============================================================ */
export function Umbra({ size = 260, humor = "neutral" }: { size?: number; humor?: "neutral" | "feliz" | "burlon" | "serio" }) {
  const alto = (size * 300) / 240;
  /* la mirada es lo unico vivo en toda la figura */
  const ry = humor === "feliz" ? 1.6 : humor === "burlon" ? 2.2 : humor === "serio" ? 5.2 : 3.2;
  const rx = humor === "serio" ? 8.5 : humor === "feliz" ? 6 : 7;
  const inclina = humor === "burlon" ? 7 : humor === "serio" ? -4 : 0;
  return (
    <svg viewBox="0 0 240 300" width={size} height={alto} className="umbra" aria-label="Umbra, el Archivista">
      <defs>
        <radialGradient id="umAura" cx="50%" cy="54%" r="50%">
          <stop offset="0%" stopColor="#4A1D6B" stopOpacity=".55" />
          <stop offset="45%" stopColor="#3A0F28" stopOpacity=".28" />
          <stop offset="100%" stopColor="#05030A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="umOjo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE8EC" />
          <stop offset="22%" stopColor="#FF2244" />
          <stop offset="60%" stopColor="#8B0A1E" stopOpacity=".55" />
          <stop offset="100%" stopColor="#8B0A1E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="umTela" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#170E22" />
          <stop offset="45%" stopColor="#0B0713" />
          <stop offset="100%" stopColor="#030208" />
        </linearGradient>
        <linearGradient id="umFilo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D3FA8" stopOpacity=".5" />
          <stop offset="60%" stopColor="#8B1538" stopOpacity=".22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="umHueso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B9A9C4" />
          <stop offset="100%" stopColor="#6E5C7E" />
        </linearGradient>
        <filter id="umBlur"><feGaussianBlur stdDeviation="4.5" /></filter>
        <filter id="umNiebla"><feGaussianBlur stdDeviation="11" /></filter>
        <filter id="umVacio"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      {/* aura fria y opresiva */}
      <ellipse className="aura" cx="120" cy="152" rx="86" ry="138" fill="url(#umAura)" />

      {/* niebla baja: la figura no toca el suelo */}
      <ellipse cx="120" cy="272" rx="50" ry="15" fill="#2A0F3E" opacity=".5" filter="url(#umNiebla)" />
      <ellipse cx="120" cy="278" rx="30" ry="9" fill="#5A1830" opacity=".35" filter="url(#umNiebla)" />

      {/* motas que suben, lentas */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} className={"chispa c" + (i % 6)} cx={74 + i * 15} cy={262 - (i % 4) * 26} r={0.9 + (i % 3) * 0.6}
          fill={i % 3 === 0 ? "#FF2244" : "#7A4FB0"} opacity=".8" />
      ))}

      {/* ---------- silueta: alta, estrecha, jirones afilados ---------- */}
      <path
        d="M 120 54
           C 108 54 102 65 99 79
           C 95 100 91 121 89 148
           C 87 179 86 212 85 242
           L 90 272 L 95 240 L 100 276 L 105 238 L 111 280 L 117 242
           L 123 278 L 129 240 L 134 274 L 140 238 L 145 270 L 151 240
           C 152 212 153 179 151 148
           C 149 121 145 100 141 79
           C 138 65 132 54 120 54 Z"
        fill="url(#umTela)"
      />
      {/* pliegues profundos */}
      <path d="M 106 90 C 101 150 99 208 100 250" stroke="#020106" strokeWidth="2.4" fill="none" opacity=".9" />
      <path d="M 134 90 C 139 150 141 208 140 250" stroke="#020106" strokeWidth="2.4" fill="none" opacity=".9" />
      <path d="M 120 100 L 120 248" stroke="#020106" strokeWidth="1.8" fill="none" opacity=".7" />
      <path d="M 113 118 C 110 170 110 214 112 246" stroke="#000" strokeWidth="1.2" fill="none" opacity=".5" />
      <path d="M 127 118 C 130 170 130 214 128 246" stroke="#000" strokeWidth="1.2" fill="none" opacity=".5" />
      {/* filo apenas iluminado, solo del lado izquierdo */}
      <path d="M 99 79 C 95 100 91 121 89 148 C 87 179 86 212 85 242" stroke="url(#umFilo)" strokeWidth="1.8" fill="none" />

      {/* brazos: mangas largas, casi sin volumen */}
      <path d="M 101 94 C 84 124 77 162 81 194" stroke="#080511" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M 139 94 C 156 124 163 162 159 194" stroke="#080511" strokeWidth="14" strokeLinecap="round" fill="none" />
      <ManoHuesuda x={81} y={198} flip={false} />
      <ManoHuesuda x={159} y={198} flip={true} />

      {/* ---------- capucha profunda ---------- */}
      <path
        d="M 120 10
           C 99 15 87 40 86 72
           C 85 90 88 103 93 112
           L 147 112
           C 152 103 155 90 154 72
           C 153 40 141 15 120 10 Z"
        fill="#120B1C"
      />
      {/* el interior es un vacio, no una cara */}
      <path
        d="M 120 26
           C 104 31 96 53 95 78
           C 94 93 98 104 103 111
           L 137 111
           C 142 104 146 93 145 78
           C 144 53 136 31 120 26 Z"
        fill="#010004"
      />
      <path d="M 120 32 C 107 37 101 56 100 78 C 99 91 102 101 106 108 L 134 108 C 138 101 141 91 140 78 C 139 56 133 37 120 32 Z"
        fill="#000" filter="url(#umVacio)" opacity=".9" />
      {/* borde del capuchon, tenue */}
      <path d="M 93 112 C 96 60 104 34 120 30 C 136 34 144 60 147 112"
        stroke="#3A2350" strokeWidth="1.6" fill="none" opacity=".8" />
      {/* punta caida hacia atras */}
      <path d="M 120 10 C 134 4 150 12 155 28 C 145 19 132 15 120 17 Z" fill="#1B1029" />
      {/* jirones del capuchon sobre los hombros */}
      <path d="M 93 106 Q 84 132 96 150 L 104 140 Q 95 126 99 108 Z" fill="#0B0713" />
      <path d="M 147 106 Q 156 132 144 150 L 136 140 Q 145 126 141 108 Z" fill="#0B0713" />

      {/* ---------- la mirada ---------- */}
      <g transform={`rotate(${inclina} 120 70)`}>
        <ellipse cx="110" cy="70" rx="13" ry="8" fill="url(#umOjo)" filter="url(#umBlur)" opacity=".95" />
        <ellipse cx="130" cy="70" rx="13" ry="8" fill="url(#umOjo)" filter="url(#umBlur)" opacity=".95" />
        <g className="ojosUmbra">
          <ellipse cx="110" cy="70" rx={rx} ry={ry} fill="#FF2244" />
          <ellipse cx="130" cy="70" rx={rx} ry={ry} fill="#FF2244" />
          <ellipse cx="110" cy="70" rx={rx * 0.45} ry={ry * 0.5} fill="#FFD9DE" opacity=".9" />
          <ellipse cx="130" cy="70" rx={rx * 0.45} ry={ry * 0.5} fill="#FFD9DE" opacity=".9" />
        </g>
        {/* rastro de luz que deja la mirada */}
        <path d="M 101 76 Q 110 80 119 76" stroke="#8B0A1E" strokeWidth="1.2" fill="none" opacity=".45" />
        <path d="M 121 76 Q 130 80 139 76" stroke="#8B0A1E" strokeWidth="1.2" fill="none" opacity=".45" />
      </g>

      {/* broche: un sello viejo, no un adorno brillante */}
      <circle cx="120" cy="120" r="5.5" fill="#2A1A10" stroke="#7A5A28" strokeWidth="1.2" />
      <circle cx="120" cy="120" r="1.8" fill="#8B0A1E" />
    </svg>
  );
}

/* mano descarnada: dedos finos que asoman de la manga, sin bloques solidos */
function ManoHuesuda({ x, y, flip }: { x: number; y: number; flip: boolean }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} 1)`}>
      {/* boca de la manga, oscura, por delante de la muneca */}
      <path d="M -8 -6 q 8 -3 16 0 q -1 7 -3 9 q -5 2 -10 0 q -2 -2 -3 -9 Z" fill="#080511" />
      {/* tres dedos largos, apenas iluminados */}
      <path d="M -4.5 2 q -1.5 6 -0.5 11" stroke="#7E6C90" strokeWidth="1.9" strokeLinecap="round" fill="none" />
      <path d="M 0 3 q 0 7 0.5 12" stroke="#8B7A9C" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 4.5 2 q 1.5 6 0.5 10" stroke="#7E6C90" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* nudillos, puntos minimos */}
      <circle cx="-5" cy="7" r="1" fill="#A594B2" opacity=".55" />
      <circle cx="0.3" cy="8.5" r="1" fill="#A594B2" opacity=".55" />
      <circle cx="5" cy="7" r=".9" fill="#A594B2" opacity=".55" />
      {/* sombra que devuelve la mano a la penumbra */}
      <ellipse cx="0" cy="9" rx="8" ry="7" fill="#05030A" opacity=".45" />
    </g>
  );
}

/* ---------- utilidades de color ---------- */
function sombra(hex: string, f = 0.68): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }