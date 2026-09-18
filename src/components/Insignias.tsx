import { REINOS } from "../game/mundo";

/* ============================================================
   INSIGNIAS — una por reino. Bloqueadas se ven en silueta.
   ============================================================ */
export function Insignia({ reino, ganada, size = 84 }: { reino: string; ganada: boolean; size?: number }) {
  const r = REINOS.find((x) => x.id === reino);
  const c = r?.color || "#8B5CF6";
  const id = "bg" + reino;
  return (
    <svg viewBox="0 0 100 112" width={size} height={(size * 112) / 100}
      className={"insignia " + (ganada ? "ganada" : "bloqueada")} aria-label={r?.nombre}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity=".95" />
          <stop offset="100%" stopColor={c} stopOpacity=".45" />
        </linearGradient>
        <radialGradient id={id + "b"} cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".28" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* escudo */}
      <path d="M 50 4 L 92 20 V 58 C 92 82 72 100 50 108 C 28 100 8 82 8 58 V 20 Z"
        fill={ganada ? `url(#${id})` : "#1A1126"} stroke={ganada ? c : "#2A1C3C"} strokeWidth="2.5" />
      <path d="M 50 12 L 85 25 V 57 C 85 77 68 93 50 100 C 32 93 15 77 15 57 V 25 Z"
        fill="#0A0710" opacity={ganada ? ".42" : ".8"} />
      {ganada && <path d="M 50 4 L 92 20 V 58 C 92 82 72 100 50 108 C 28 100 8 82 8 58 V 20 Z" fill={`url(#${id}b)`} />}

      {/* emblema propio de cada reino */}
      <g className="emblema" fill="none" stroke={ganada ? "#fff" : "#3A2A50"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={ganada ? ".95" : ".6"}>
        {reino === "umbral" && <><path d="M 34 42 h 32 M 34 54 h 32 M 34 66 h 20" /><path d="M 30 34 v 44" /></>}
        {reino === "pantano" && <><path d="M 28 48 q 11 -10 22 0 t 22 0" /><path d="M 28 62 q 11 -10 22 0 t 22 0" /><circle cx="50" cy="34" r="4" fill={ganada ? "#fff" : "#3A2A50"} /></>}
        {reino === "torre" && <><path d="M 50 30 L 70 70 H 30 Z" /><path d="M 40 58 h 20" /></>}
        {reino === "puente" && <><path d="M 26 62 q 24 -34 48 0" /><path d="M 26 62 h 48" /><path d="M 38 62 v -12 M 50 62 v -18 M 62 62 v -12" /></>}
        {reino === "catacumbas" && <><path d="M 50 28 L 70 50 L 50 72 L 30 50 Z" /><path d="M 50 40 L 60 50 L 50 60 L 40 50 Z" /></>}
        {reino === "forja" && <><path d="M 34 66 L 58 42" /><path d="M 52 30 l 18 18 l -10 10 l -18 -18 Z" /></>}
        {reino === "templo" && <><path d="M 50 28 a 22 22 0 1 1 -15 6" /><path d="M 34 24 l 2 12 l 12 -2" /></>}
        {reino === "lealtad" && <><circle cx="38" cy="44" r="10" /><circle cx="60" cy="60" r="10" /><path d="M 45 51 l 8 2" /></>}
        {reino === "cima" && <><path d="M 30 68 L 46 40 L 58 56 L 70 36" /><circle cx="70" cy="34" r="4" fill={ganada ? "#fff" : "#3A2A50"} /></>}
        {reino === "vacio" && <><circle cx="50" cy="50" r="18" /><path d="M 36 64 L 64 36" /></>}
      </g>

      {!ganada && (
        <g opacity=".85">
          <rect x="41" y="58" width="18" height="15" rx="3" fill="#2A1C3C" />
          <path d="M 44 58 v -5 a 6 6 0 0 1 12 0 v 5" stroke="#2A1C3C" strokeWidth="3" fill="none" />
        </g>
      )}
      {ganada && <g className="brillo"><circle cx="78" cy="22" r="3" fill="#fff" opacity=".9" /></g>}
    </svg>
  );
}

/* ---------- vitrina: todas las insignias juntas ---------- */
export function Vitrina({ ganadas, onCerrar }: { ganadas: string[]; onCerrar: () => void }) {
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="box" style={{ maxWidth: 780 }}>
        <div className="top">
          <h3>Insignias</h3>
          <span className="pill">{ganadas.length} de {REINOS.length}</span>
          <span className="sp" />
          <button className="btn gh peq" onClick={onCerrar}>Cerrar <kbd>Esc</kbd></button>
        </div>
        <div className="body">
          <div className="vitrina">
            {REINOS.map((r, i) => {
              const g = ganadas.includes(r.id);
              return (
                <div key={r.id} className={"vit-item " + (g ? "on" : "")} style={{ ["--rc" as string]: r.color, animationDelay: i * 45 + "ms" }}>
                  <Insignia reino={r.id} ganada={g} size={90} />
                  <span className="vit-n">{r.nombre}</span>
                  <span className="vit-d">{g ? "conquistado" : "sellado"}</span>
                </div>
              );
            })}
          </div>
          <p className="mnote" style={{ marginTop: 18 }}>
            Cada insignia se gana al derrotar al jefe de su reino. Las que siguen con candado ni siquiera
            saben que existes.
          </p>
        </div>
      </div>
    </div>
  );
}
