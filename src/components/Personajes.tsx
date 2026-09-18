import type { Personaje } from "../game/store";

/* ============================================================
   AVATAR DEL JUGADOR — SVG por capas
   ============================================================ */
export function Avatar({ p, size = 220, animado = true }: { p: Personaje; size?: number; animado?: boolean }) {
  const ancho = p.silueta === "a" ? 1 : 0.86;
  const oscuro = sombra(p.ropa);
  const detOsc = sombra(p.detalle);
  const id = "av" + Math.abs(hash(JSON.stringify(p))).toString(36);
  return (
    <svg viewBox="0 0 200 270" width={size} height={(size * 270) / 200} className={animado ? "avatar flota" : "avatar"} aria-label={p.nombre || "personaje"}>
      <defs>
        <radialGradient id={id + "g"} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={p.ropa} stopOpacity=".35" />
          <stop offset="100%" stopColor={p.ropa} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* aura suave */}
      <ellipse cx="100" cy="150" rx="86" ry="110" fill={`url(#${id}g)`} />
      {/* sombra al piso */}
      <ellipse cx="100" cy="258" rx={46 * ancho} ry="7" fill="#000" opacity=".35" />

      {/* capa (detalle) detras del cuerpo */}
      <path d={`M ${100 - 46 * ancho} 128 Q 100 118 ${100 + 46 * ancho} 128 L ${100 + 52 * ancho} 236 Q 100 244 ${100 - 52 * ancho} 236 Z`} fill={detOsc} />

      {/* piernas */}
      <rect x={100 - 26 * ancho} y="196" width={22 * ancho} height="52" rx="8" fill={oscuro} />
      <rect x={100 + 4 * ancho} y="196" width={22 * ancho} height="52" rx="8" fill={oscuro} />
      <rect x={100 - 28 * ancho} y="240" width={26 * ancho} height="14" rx="6" fill="#1B1220" />
      <rect x={100 + 2 * ancho} y="240" width={26 * ancho} height="14" rx="6" fill="#1B1220" />

      {/* torso / tunica */}
      <path d={`M ${100 - 42 * ancho} 130 Q 100 116 ${100 + 42 * ancho} 130 L ${100 + 38 * ancho} 204 Q 100 212 ${100 - 38 * ancho} 204 Z`} fill={p.ropa} />
      {/* cinturon */}
      <rect x={100 - 38 * ancho} y="176" width={76 * ancho} height="9" rx="4" fill={p.detalle} />
      <rect x={100 - 6} y="174" width="12" height="13" rx="3" fill="#FFB05C" />
      {/* pliegue central */}
      <path d={`M 100 132 L 100 176`} stroke={oscuro} strokeWidth="3" strokeLinecap="round" />

      {/* brazos */}
      <path d={`M ${100 - 42 * ancho} 136 Q ${100 - 62 * ancho} 168 ${100 - 52 * ancho} 200`} stroke={p.ropa} strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d={`M ${100 + 42 * ancho} 136 Q ${100 + 62 * ancho} 168 ${100 + 52 * ancho} 200`} stroke={p.ropa} strokeWidth="18" strokeLinecap="round" fill="none" />
      <circle cx={100 - 52 * ancho} cy="204" r="9" fill={p.piel} />
      <circle cx={100 + 52 * ancho} cy="204" r="9" fill={p.piel} />

      {/* cuello y cabeza */}
      <rect x="90" y="106" width="20" height="24" rx="6" fill={sombra(p.piel)} />
      <ellipse cx="100" cy="76" rx="40" ry="44" fill={p.piel} />
      {/* orejas */}
      <ellipse cx="60" cy="80" rx="7" ry="10" fill={p.piel} />
      <ellipse cx="140" cy="80" rx="7" ry="10" fill={p.piel} />

      {/* cabello detras (largo / trenzas) */}
      {p.cabello === "largo" && <path d="M 58 62 Q 50 130 66 148 L 134 148 Q 150 130 142 62 Z" fill={p.colorCabello} />}
      {p.cabello === "trenzas" && (<>
        <path d="M 66 96 Q 56 128 62 150" stroke={p.colorCabello} strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M 134 96 Q 144 128 138 150" stroke={p.colorCabello} strokeWidth="11" strokeLinecap="round" fill="none" />
      </>)}

      {/* cara */}
      <Ojos color={p.ojos} />
      <path d="M 88 96 Q 100 104 112 96" stroke={sombra(p.piel)} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="80" cy="90" r="5" fill="#FF7A9A" opacity=".35" />
      <circle cx="120" cy="90" r="5" fill="#FF7A9A" opacity=".35" />
      {p.accesorio === "cicatriz" && <path d="M 112 60 L 124 84" stroke={sombra(p.piel)} strokeWidth="2.5" strokeLinecap="round" />}

      {/* cabello frente */}
      <Cabello estilo={p.cabello} color={p.colorCabello} />

      {/* accesorios */}
      {p.accesorio === "lentes" && (<>
        <circle cx="84" cy="78" r="11" fill="none" stroke="#1B1220" strokeWidth="2.5" />
        <circle cx="116" cy="78" r="11" fill="none" stroke="#1B1220" strokeWidth="2.5" />
        <path d="M 95 78 L 105 78" stroke="#1B1220" strokeWidth="2.5" />
      </>)}
      {p.accesorio === "diadema" && <path d="M 62 58 Q 100 40 138 58" stroke={p.detalle} strokeWidth="6" strokeLinecap="round" fill="none" />}
      {p.accesorio === "capucha" && (<>
        <path d="M 52 84 Q 52 22 100 20 Q 148 22 148 84 Q 130 40 100 38 Q 70 40 52 84 Z" fill={oscuro} />
        <path d="M 52 84 Q 100 58 148 84 L 146 130 Q 100 118 54 130 Z" fill={p.ropa} opacity=".92" />
      </>)}
    </svg>
  );
}

function Ojos({ color }: { color: string }) {
  return (
    <g className="ojos">
      <ellipse cx="84" cy="78" rx="7" ry="9" fill="#fff" />
      <ellipse cx="116" cy="78" rx="7" ry="9" fill="#fff" />
      <ellipse cx="85" cy="79" rx="4.2" ry="5.5" fill={color} />
      <ellipse cx="117" cy="79" rx="4.2" ry="5.5" fill={color} />
      <circle cx="86.5" cy="76.5" r="1.4" fill="#fff" />
      <circle cx="118.5" cy="76.5" r="1.4" fill="#fff" />
      <path d="M 75 68 Q 84 64 93 68" stroke="#1B1220" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 107 68 Q 116 64 125 68" stroke="#1B1220" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Cabello({ estilo, color }: { estilo: string; color: string }) {
  switch (estilo) {
    case "corto": return <path d="M 58 70 Q 60 30 100 30 Q 140 30 142 70 Q 128 46 100 48 Q 72 46 58 70 Z" fill={color} />;
    case "largo": return <path d="M 58 72 Q 58 28 100 28 Q 142 28 142 72 Q 130 44 100 46 Q 70 44 58 72 Z" fill={color} />;
    case "chongo": return (<>
      <path d="M 58 70 Q 60 32 100 32 Q 140 32 142 70 Q 128 48 100 50 Q 72 48 58 70 Z" fill={color} />
      <circle cx="100" cy="30" r="15" fill={color} />
      <circle cx="100" cy="30" r="15" fill="none" stroke={sombra(color)} strokeWidth="2" />
    </>);
    case "rapado": return <path d="M 60 66 Q 62 40 100 38 Q 138 40 140 66 Q 126 54 100 54 Q 74 54 60 66 Z" fill={color} opacity=".55" />;
    case "trenzas": return <path d="M 58 72 Q 58 28 100 28 Q 142 28 142 72 Q 130 44 100 46 Q 70 44 58 72 Z" fill={color} />;
    case "mohawk": return (<>
      <path d="M 66 62 Q 76 46 100 44 Q 124 46 134 62 Q 116 54 100 56 Q 84 54 66 62 Z" fill={sombra(color)} opacity=".5" />
      <path d="M 88 52 L 92 14 L 100 40 L 108 10 L 112 52 Z" fill={color} />
    </>);
    default: return null;
  }
}

/* ============================================================
   UMBRA — el Maestro encapuchado
   ============================================================ */
export function Umbra({ size = 260, humor = "neutral" }: { size?: number; humor?: "neutral" | "feliz" | "burlon" | "serio" }) {
  const alto = (size * 300) / 240;
  return (
    <svg viewBox="0 0 240 300" width={size} height={alto} className="umbra" aria-label="Umbra, el Archivista">
      <defs>
        <radialGradient id="umAura" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".55" />
          <stop offset="55%" stopColor="#E0338A" stopOpacity=".18" />
          <stop offset="100%" stopColor="#0A0710" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="umOjo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD6DC" />
          <stop offset="35%" stopColor="#FF3B5C" />
          <stop offset="100%" stopColor="#FF3B5C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="umTela" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1C3C" />
          <stop offset="100%" stopColor="#0E0916" />
        </linearGradient>
        <filter id="umBlur"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {/* aura */}
      <ellipse className="aura" cx="120" cy="165" rx="112" ry="130" fill="url(#umAura)" />
      {/* particulas */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} className={"chispa c" + i} cx={70 + i * 20} cy={250 - (i % 3) * 40} r={2 + (i % 2)} fill={i % 2 ? "#FF3B5C" : "#B794F6"} />
      ))}
      {/* tunica */}
      <path d="M 120 62 C 70 62 52 140 46 250 L 194 250 C 188 140 170 62 120 62 Z" fill="url(#umTela)" />
      <path d="M 120 70 C 90 70 76 150 72 246 L 168 246 C 164 150 150 70 120 70 Z" fill="#150E20" opacity=".9" />
      {/* borde luminoso de la tunica */}
      <path d="M 52 250 Q 120 236 188 250" stroke="#8B5CF6" strokeWidth="2" opacity=".55" fill="none" />
      {/* mangas y manos flotantes */}
      <path d="M 68 150 Q 40 190 58 218" stroke="#1B1226" strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d="M 172 150 Q 200 190 182 218" stroke="#1B1226" strokeWidth="26" strokeLinecap="round" fill="none" />
      <ellipse cx="56" cy="224" rx="10" ry="7" fill="#C9A6F5" opacity=".8" />
      <ellipse cx="184" cy="224" rx="10" ry="7" fill="#C9A6F5" opacity=".8" />
      {/* capucha */}
      <path d="M 120 34 C 78 34 62 74 62 112 L 178 112 C 178 74 162 34 120 34 Z" fill="#221733" />
      <path d="M 120 44 C 90 44 78 76 78 108 L 162 108 C 162 76 150 44 120 44 Z" fill="#0A0710" />
      {/* rostro en sombra: solo ojos */}
      <ellipse cx="104" cy="88" rx="12" ry="8" fill="url(#umOjo)" filter="url(#umBlur)" opacity=".9" />
      <ellipse cx="136" cy="88" rx="12" ry="8" fill="url(#umOjo)" filter="url(#umBlur)" opacity=".9" />
      <g className="ojosUmbra">
        <ellipse cx="104" cy="88" rx={humor === "serio" ? 6 : 5.5} ry={humor === "feliz" ? 2.6 : humor === "burlon" ? 3.4 : 4} fill="#FF3B5C" />
        <ellipse cx="136" cy="88" rx={humor === "serio" ? 6 : 5.5} ry={humor === "feliz" ? 2.6 : humor === "burlon" ? 4.4 : 4} fill="#FF3B5C" />
        <circle cx="105.5" cy="86.5" r="1.3" fill="#fff" opacity=".9" />
        <circle cx="137.5" cy="86.5" r="1.3" fill="#fff" opacity=".9" />
      </g>
      {/* sonrisa apenas visible cuando esta burlon */}
      {humor === "burlon" && <path d="M 110 104 Q 122 110 134 102" stroke="#FF7A9A" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".7" />}
      {/* broche */}
      <circle cx="120" cy="124" r="6" fill="#FFB05C" />
      <circle cx="120" cy="124" r="2.5" fill="#FF3B5C" />
    </svg>
  );
}

/* ---------- utilidades de color ---------- */
function sombra(hex: string, f = 0.68): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
