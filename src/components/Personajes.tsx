import type { Personaje } from "../game/store";

/* ============================================================
   AVATAR DEL JUGADOR — SVG por capas, en este orden:
   aura · sombra · capa · piernas · cabello trasero · torso · atuendo
   · brazos · cabeza · rostro · cabello frontal · capucha · accesorios
   ============================================================ */
export function Avatar({ p, size = 220, animado = true }: { p: Personaje; size?: number; animado?: boolean }) {
  const w = p.silueta === "a" ? 1 : 0.86;            // factor de anchura
  const osc = sombra(p.ropa);
  const det = p.detalle;
  const detOsc = sombra(p.detalle);
  const capuchaArriba = p.capucha === "arriba" && p.atuendo !== "guardia";
  const id = "av" + Math.abs(hash(JSON.stringify(p))).toString(36);
  const conCapa = p.capa !== "ninguna";

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
      </defs>

      <ellipse cx="100" cy="150" rx="86" ry="110" fill={`url(#${id}g)`} />
      <ellipse cx="100" cy="257" rx={44 * w} ry="7" fill="#000" opacity=".38" />

      {/* ---------- capa, detras de todo ---------- */}
      {conCapa && (
        <>
          <path d={`M ${100 - 40 * w} 122 Q 100 114 ${100 + 40 * w} 122 L ${100 + 54 * w} 244 Q 100 252 ${100 - 54 * w} 244 Z`} fill={sombra(p.capa, .8)} />
          <path d={`M ${100 - 40 * w} 122 Q 100 130 ${100 + 40 * w} 122 L ${100 + 46 * w} 200 Q 100 194 ${100 - 46 * w} 200 Z`} fill={p.capa} opacity=".55" />
        </>
      )}

      {/* ---------- piernas y botas ---------- */}
      <rect x={100 - 25 * w} y="192" width={21 * w} height="50" rx="7" fill={detOsc} />
      <rect x={100 + 4 * w} y="192" width={21 * w} height="50" rx="7" fill={detOsc} />
      <path d={`M ${100 - 29 * w} 230 h ${27 * w} v 18 a 4 4 0 0 1 -4 4 h ${-19 * w} a 4 4 0 0 1 -4 -4 Z`} fill="#231A2E" />
      <path d={`M ${100 + 2 * w} 230 h ${27 * w} v 18 a 4 4 0 0 1 -4 4 h ${-19 * w} a 4 4 0 0 1 -4 -4 Z`} fill="#231A2E" />
      <rect x={100 - 29 * w} y="229" width={27 * w} height="4.5" rx="2" fill={det} />
      <rect x={100 + 2 * w} y="229" width={27 * w} height="4.5" rx="2" fill={det} />

      {/* ---------- cabello por detras ---------- */}
      <CabelloTrasero estilo={p.cabello} color={p.colorCabello} oculto={capuchaArriba} />

      {/* ---------- torso y atuendo ---------- */}
      <Atuendo tipo={p.atuendo} w={w} ropa={p.ropa} osc={osc} det={det} detOsc={detOsc} grad={`url(#${id}t)`} />

      {/* ---------- brazos pegados al cuerpo ---------- */}
      <Brazos w={w} ropa={p.ropa} osc={osc} piel={p.piel} det={det} brazaletes={p.brazaletes} />

      {(p.atuendo === "asesino" || p.atuendo === "sombra") && p.brazaletes && <HojaOculta x={100 - 46 * w} y={186} w={w} det={p.detalle} />}

      {/* ---------- hombreras ---------- */}
      {p.hombrera && (
        <>
          <path d={`M ${100 - 47 * w} 116 q ${-11 * w} 14 ${-4 * w} 28 q ${15 * w} 5 ${23 * w} -6 Z`} fill={det} />
          <path d={`M ${100 + 47 * w} 116 q ${11 * w} 14 ${4 * w} 28 q ${-15 * w} 5 ${-23 * w} -6 Z`} fill={detOsc} />
          <path d={`M ${100 - 47 * w} 124 q ${-7 * w} 9 ${-3 * w} 17`} stroke={detOsc} strokeWidth="1.6" fill="none" />
          <path d={`M ${100 + 47 * w} 124 q ${7 * w} 9 ${3 * w} 17`} stroke={det} strokeWidth="1.6" fill="none" opacity=".5" />
        </>
      )}

      {/* ---------- cabeza ---------- */}
      <rect x="92" y="96" width="16" height="20" rx="5" fill={sombra(p.piel, .82)} />
      <ellipse cx="100" cy="66" rx="32" ry="35" fill={p.piel} />
      <ellipse cx="69" cy="70" rx="5.5" ry="7.5" fill={p.piel} />
      <ellipse cx="131" cy="70" rx="5.5" ry="7.5" fill={p.piel} />

      {/* ---------- rostro ---------- */}
      <Ojos color={p.ojos} />
      <path d="M 97 74 q 3 3 6 0" stroke={sombra(p.piel, .8)} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 91 84 Q 100 91 109 84" stroke={sombra(p.piel, .72)} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="83" cy="79" r="4.2" fill="#FF7A9A" opacity=".3" />
      <circle cx="117" cy="79" r="4.2" fill="#FF7A9A" opacity=".3" />
      <Vello tipo={p.vello} color={p.colorCabello} />
      {p.accesorio === "cicatriz" && <path d="M 112 52 L 120 72" stroke={sombra(p.piel, .68)} strokeWidth="2.2" strokeLinecap="round" />}

      {/* ---------- cabello frontal: nunca tapa los ojos ---------- */}
      <CabelloFrontal estilo={p.cabello} color={p.colorCabello} oculto={capuchaArriba} />

      {/* ---------- capucha por encima de todo ---------- */}
      {capuchaArriba && <Capucha tipo={p.atuendo} ropa={p.ropa} osc={osc} det={det} w={w} />}

      {/* ---------- accesorios del rostro ---------- */}
      {p.accesorio === "lentes" && (
        <g>
          <circle cx="88" cy="68" r="9" fill="#0A0710" opacity=".18" />
          <circle cx="112" cy="68" r="9" fill="#0A0710" opacity=".18" />
          <circle cx="88" cy="68" r="9" fill="none" stroke="#2A2035" strokeWidth="2.2" />
          <circle cx="112" cy="68" r="9" fill="none" stroke="#2A2035" strokeWidth="2.2" />
          <path d="M 97 68 L 103 68" stroke="#2A2035" strokeWidth="2.2" />
        </g>
      )}
      {p.accesorio === "diadema" && (
        <>
          <path d="M 72 50 Q 100 36 128 50" stroke={det} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <circle cx="100" cy="41" r="4" fill="#FFB05C" />
        </>
      )}
      {p.accesorio === "antifaz" && <path d="M 73 62 Q 100 55 127 62 L 125 76 Q 100 70 75 76 Z" fill="#1B1220" opacity=".88" />}
    </svg>
  );
}

/* ---------- atuendos ---------- */
function Atuendo({ tipo, w, ropa, osc, det, detOsc, grad }:
  { tipo: string; w: number; ropa: string; osc: string; det: string; detOsc: string; grad: string }) {
  const torso = `M ${100 - 40 * w} 114 Q 100 104 ${100 + 40 * w} 114 L ${100 + 36 * w} 196 Q 100 204 ${100 - 36 * w} 196 Z`;
  const L = (k: number) => 100 - k * w, R = (k: number) => 100 + k * w;

  switch (tipo) {
    /* ---- ASESINO: tunica cruzada, fajin con hebilla, correas y hoja oculta ---- */
    case "asesino":
      return (
        <g>
          <path d={torso} fill={grad} />
          {/* solapa cruzada */}
          <path d={`M ${L(40)} 114 Q 100 104 ${R(40)} 114 L ${R(26)} 142 L ${L(14)} 196 L ${L(36)} 196 Z`} fill={osc} opacity=".5" />
          <path d={`M ${R(40)} 116 L ${R(26)} 144 L ${L(14)} 196`} stroke={det} strokeWidth="3.2" fill="none" />
          <path d={`M ${R(36)} 116 L ${R(22)} 144 L ${L(18)} 196`} stroke={detOsc} strokeWidth="1.4" fill="none" opacity=".7" />
          {/* fajin con vuelta */}
          <path d={`M ${L(37)} 160 h ${74 * w} v 18 h ${-74 * w} Z`} fill={det} />
          <path d={`M ${L(37)} 175 h ${74 * w} v 5 h ${-74 * w} Z`} fill={detOsc} />
          <path d={`M ${R(28)} 160 l ${8 * w} 22 l ${-13 * w} -4 Z`} fill={detOsc} />
          {/* correa al pecho con hebilla */}
          <path d={`M ${L(33)} 124 L ${R(29)} 166`} stroke={detOsc} strokeWidth="7.5" strokeLinecap="round" />
          <path d={`M ${L(33)} 124 L ${R(29)} 166`} stroke={det} strokeWidth="3" strokeLinecap="round" opacity=".5" />
          <circle cx={L(2)} cy={146} r="6" fill="#FFB05C" />
          <path d={`M ${L(2) - 3} 146 h 6 M ${L(2)} 143 v 6`} stroke={osc} strokeWidth="1.4" />
          {/* faldones */}
          <path d={`M ${L(30)} 184 L ${L(25)} 216 L ${L(9)} 190 Z`} fill={osc} />
          <path d={`M ${R(30)} 184 L ${R(25)} 216 L ${R(9)} 190 Z`} fill={osc} />
          <path d={`M ${L(30)} 184 L ${L(25)} 216`} stroke={det} strokeWidth="1.6" opacity=".6" />
        </g>
      );

    /* ---- SOMBRA: peto acolchado, correas en X, bufanda y dagas ---- */
    case "sombra":
      return (
        <g>
          <path d={torso} fill={grad} />
          <path d={`M ${L(32)} 120 Q 100 112 ${R(32)} 120 L ${R(28)} 170 Q 100 178 ${L(28)} 170 Z`} fill={osc} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${L(30)} ${130 + i * 13} Q 100 ${136 + i * 13} ${R(30)} ${130 + i * 13}`} stroke={detOsc} strokeWidth="2" fill="none" opacity=".8" />
          ))}
          {/* correas en X */}
          <path d={`M ${L(34)} 120 L ${R(30)} 172`} stroke={det} strokeWidth="6" strokeLinecap="round" />
          <path d={`M ${R(34)} 120 L ${L(30)} 172`} stroke={detOsc} strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="146" r="6.5" fill={det} />
          <circle cx="100" cy="146" r="2.6" fill="#FFB05C" />
          {/* bufanda al cuello */}
          <path d={`M ${L(22)} 110 Q 100 122 ${R(22)} 110 L ${R(18)} 100 Q 100 110 ${L(18)} 100 Z`} fill={det} />
          <path d={`M ${R(16)} 112 q ${10 * w} 16 ${4 * w} 34 q ${-8 * w} -10 ${-12 * w} -22 Z`} fill={detOsc} />
          {/* cinturon con dagas */}
          <rect x={L(37)} y="168" width={74 * w} height="10" rx="3" fill={detOsc} />
          <path d={`M ${L(30)} 178 l 0 16 l ${4 * w} -4 l ${4 * w} 4 l 0 -16 Z`} fill="#9AA7B4" />
          <path d={`M ${R(22)} 178 l 0 16 l ${4 * w} -4 l ${4 * w} 4 l 0 -16 Z`} fill="#9AA7B4" />
        </g>
      );

    /* ---- EXPLORADOR: chaqueta con solapas, doble cinturon y equipo ---- */
    case "explorador":
      return (
        <g>
          <path d={torso} fill={grad} />
          {/* solapas */}
          <path d={`M ${L(40)} 114 Q 100 106 ${R(40)} 114 L ${R(30)} 138 Q 100 128 ${L(30)} 138 Z`} fill={det} />
          <path d={`M ${L(14)} 116 L ${L(4)} 152 L 100 130 Z`} fill={detOsc} />
          <path d={`M ${R(14)} 116 L ${R(4)} 152 L 100 130 Z`} fill={detOsc} />
          <path d="M 100 130 L 100 164" stroke={osc} strokeWidth="3" />
          {/* botones */}
          {[0, 1, 2].map((i) => <circle key={i} cx="100" cy={138 + i * 11} r="2.6" fill={det} />)}
          {/* doble cinturon */}
          <rect x={L(37)} y="158" width={74 * w} height="9" rx="3" fill={detOsc} />
          <rect x={L(37)} y="172" width={74 * w} height="7" rx="3" fill={det} />
          <rect x={100 - 7} y="156" width="14" height="13" rx="3" fill="#FFB05C" />
          {/* bolsas y cantimplora */}
          <rect x={L(45)} y="166" width={14 * w} height="18" rx="4" fill={detOsc} />
          <rect x={L(45)} y="166" width={14 * w} height="5" rx="2" fill={det} />
          <ellipse cx={R(38)} cy="176" rx={8 * w} ry="10" fill={detOsc} />
          <rect x={R(35)} y="164" width={6 * w} height="5" rx="2" fill={det} />
        </g>
      );

    /* ---- ERUDITO: toga, estola bordada, cuello alto y medallon ---- */
    case "erudito":
      return (
        <g>
          <path d={`M ${L(42)} 114 Q 100 102 ${R(42)} 114 L ${R(40)} 208 Q 100 218 ${L(40)} 208 Z`} fill={grad} />
          <path d={`M ${L(20)} 108 Q 100 124 ${R(20)} 108 L ${R(16)} 96 Q 100 108 ${L(16)} 96 Z`} fill={det} />
          {/* estolas */}
          <path d={`M ${L(15)} 112 L ${L(19)} 204 L ${L(8)} 204 L ${L(6)} 114 Z`} fill={det} />
          <path d={`M ${R(15)} 112 L ${R(19)} 204 L ${R(8)} 204 L ${R(6)} 114 Z`} fill={det} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={L(13)} cy={132 + i * 18} r="2.4" fill={detOsc} />
              <circle cx={R(13)} cy={132 + i * 18} r="2.4" fill={detOsc} />
            </g>
          ))}
          {/* medallon */}
          <path d="M 100 118 L 100 132" stroke={detOsc} strokeWidth="2" />
          <circle cx="100" cy="138" r="7" fill="#FFB05C" />
          <circle cx="100" cy="138" r="3" fill={osc} />
          <path d={`M ${L(40)} 188 Q 100 198 ${R(40)} 188`} stroke={detOsc} strokeWidth="4" fill="none" />
        </g>
      );

    /* ---- ARCANO: runas, cinturon de sellos y orbe ---- */
    case "arcano":
      return (
        <g>
          <path d={`M ${L(41)} 114 Q 100 103 ${R(41)} 114 L ${R(38)} 206 Q 100 216 ${L(38)} 206 Z`} fill={grad} />
          {/* borde rúnico */}
          <path d={`M ${L(41)} 122 Q 100 112 ${R(41)} 122`} stroke={det} strokeWidth="3" fill="none" />
          {[0, 1, 2, 3, 4].map((i) => (
            <text key={i} x={L(30) - 2 + i * 15 * w} y="136" fontSize="9" fill={det} opacity=".85" fontFamily="monospace">
              {["◇", "△", "◎", "▽", "✦"][i]}
            </text>
          ))}
          <path d="M 100 140 L 100 176" stroke={osc} strokeWidth="3" />
          {/* cinturon de sellos */}
          <rect x={L(37)} y="168" width={74 * w} height="11" rx="4" fill={detOsc} />
          {[0, 1, 2].map((i) => <circle key={i} cx={L(18) + i * 18 * w} cy="173.5" r="3.4" fill="#FFB05C" opacity=".9" />)}
          {/* orbe suspendido */}
          <circle cx={R(36)} cy="186" r={9 * w} fill={det} opacity=".35" />
          <circle cx={R(36)} cy="186" r={5.5 * w} fill="#B794F6" />
          <circle cx={R(36)} cy="186" r={2.4 * w} fill="#FFF" opacity=".85" />
          <path d={`M ${R(36)} 170 L ${R(36)} 178`} stroke={detOsc} strokeWidth="1.6" />
          <path d={`M ${L(30)} 192 L ${L(26)} 212 L ${L(12)} 196 Z`} fill={osc} />
        </g>
      );

    /* ---- GUARDIA: peto remachado y faldon segmentado ---- */
    case "guardia":
      return (
        <g>
          <path d={torso} fill={grad} />
          <path d={`M ${L(34)} 118 Q 100 108 ${R(34)} 118 L ${R(28)} 162 Q 100 172 ${L(28)} 162 Z`} fill={det} />
          <path d="M 100 112 L 100 166" stroke={detOsc} strokeWidth="2.5" />
          <path d={`M ${L(26)} 132 Q 100 142 ${R(26)} 132`} stroke={detOsc} strokeWidth="2.5" fill="none" />
          <path d={`M ${L(24)} 148 Q 100 158 ${R(24)} 148`} stroke={detOsc} strokeWidth="2.5" fill="none" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={L(26) + i * 6} cy="124" r="1.8" fill={detOsc} />
              <circle cx={R(26) - i * 6} cy="124" r="1.8" fill={detOsc} />
            </g>
          ))}
          <rect x={L(37)} y="160" width={74 * w} height="10" rx="3" fill={detOsc} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={L(34) + i * 17 * w} y="170" width={15 * w} height="28" rx="4" fill={i % 2 ? detOsc : det} />
          ))}
        </g>
      );

    /* ---- TUNICA ---- */
    default:
      return (
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

/* ---------- brazos: manga, antebrazo y mano pegados ---------- */
function Brazos({ w, ropa, osc, piel, det, brazaletes }:
  { w: number; ropa: string; osc: string; piel: string; det: string; brazaletes: boolean }) {
  const xi = 100 - 40 * w, xd = 100 + 40 * w;
  return (
    <g>
      <path d={`M ${xi} 134 Q ${xi - 13 * w} 162 ${xi - 6 * w} 190`} stroke={sombra(ropa, .5)} strokeWidth={19 * w} strokeLinecap="round" fill="none" />
      <path d={`M ${xd} 134 Q ${xd + 13 * w} 162 ${xd + 6 * w} 190`} stroke={sombra(ropa, .5)} strokeWidth={19 * w} strokeLinecap="round" fill="none" />
      <path d={`M ${xi} 134 Q ${xi - 13 * w} 162 ${xi - 6 * w} 190`} stroke={ropa} strokeWidth={15 * w} strokeLinecap="round" fill="none" />
      <path d={`M ${xd} 134 Q ${xd + 13 * w} 162 ${xd + 6 * w} 190`} stroke={osc} strokeWidth={15 * w} strokeLinecap="round" fill="none" />
      {brazaletes && (
        <>
          <path d={`M ${xi - 10 * w} 176 q ${8 * w} 4 ${10 * w} 0`} stroke={det} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d={`M ${xd + 10 * w} 176 q ${-8 * w} 4 ${-10 * w} 0`} stroke={det} strokeWidth="9" strokeLinecap="round" fill="none" />
        </>
      )}
      <circle cx={xi - 6 * w} cy="194" r={8.5 * w} fill={piel} stroke={sombra(piel, .7)} strokeWidth="1" />
      <circle cx={xd + 6 * w} cy="194" r={8.5 * w} fill={piel} stroke={sombra(piel, .7)} strokeWidth="1" />
    </g>
  );
}

/* ---------- capucha puesta: enmarca el rostro sin taparlo ---------- */
function Capucha({ tipo, ropa, osc, det, w }: { tipo: string; ropa: string; osc: string; det: string; w: number }) {
  const pico = tipo === "asesino" || tipo === "erudito";
  return (
    <g>
      {/* volumen exterior de la capucha, abierto en el frente */}
      <path d={pico
        ? "M 100 12 Q 62 24 62 78 Q 64 92 70 96 Q 66 50 82 40 Q 91 33 100 33 Q 109 33 118 40 Q 134 50 130 96 Q 136 92 138 78 Q 138 24 100 12 Z"
        : "M 100 18 Q 64 30 64 78 Q 66 92 72 96 Q 68 52 84 43 Q 92 38 100 38 Q 108 38 116 43 Q 132 52 128 96 Q 134 92 136 78 Q 136 30 100 18 Z"}
        fill={ropa} />
      {/* pano que cae sobre la espalda, detras de los hombros */}
      <path d={`M 66 84 Q 58 108 ${100 - 40 * w} 128 L ${100 - 26 * w} 124 Q 70 106 74 84 Z`} fill={osc} />
      <path d={`M 134 84 Q 142 108 ${100 + 40 * w} 128 L ${100 + 26 * w} 124 Q 130 106 126 84 Z`} fill={osc} />
      {/* interior en sombra sobre la frente */}
      <path d="M 72 70 Q 72 42 100 38 Q 128 42 128 70 Q 120 48 100 46 Q 80 48 72 70 Z" fill="#0A0710" opacity=".5" />
      {/* filo del borde */}
      <path d={pico ? "M 70 96 Q 66 50 82 40 Q 91 33 100 33 Q 109 33 118 40 Q 134 50 130 96" : "M 72 96 Q 68 52 84 43 Q 92 38 100 38 Q 108 38 116 43 Q 132 52 128 96"}
        stroke={det} strokeWidth="2.4" fill="none" opacity=".85" />
      {/* pico caido hacia adelante */}
      {pico && <path d="M 100 12 Q 116 20 112 40 Q 106 27 96 25 Z" fill={det} />}
    </g>
  );
}

function Ojos({ color }: { color: string }) {
  return (
    <g className="ojos">
      <ellipse cx="88" cy="68" rx="6" ry="7.2" fill="#fff" />
      <ellipse cx="112" cy="68" rx="6" ry="7.2" fill="#fff" />
      <ellipse cx="89" cy="69" rx="3.6" ry="4.6" fill={color} />
      <ellipse cx="113" cy="69" rx="3.6" ry="4.6" fill={color} />
      <circle cx="90.2" cy="66.9" r="1.3" fill="#fff" />
      <circle cx="114.2" cy="66.9" r="1.3" fill="#fff" />
      <path d="M 81 58 Q 88 54.5 95 58" stroke="#1B1220" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 105 58 Q 112 54.5 119 58" stroke="#1B1220" strokeWidth="2.2" strokeLinecap="round" fill="none" />
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