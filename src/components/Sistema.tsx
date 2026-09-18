import { useEffect, useRef, useState } from "react";
import { onGuardado, exportarProgreso, importarProgreso } from "../game/store";

/* ============================================================
   PANTALLA DE CARGA — se ve una vez, al arrancar
   ============================================================ */
const FRASES = [
  "Abriendo el Archivo",
  "Despertando a Umbra",
  "Contando filas",
  "Ordenando por precio, descendente",
  "Comprobando que nada sea NULL",
  "Afilando los JOIN"
];

export function Cargando({ onListo }: { onListo: () => void }) {
  const [pct, setPct] = useState(0);
  const [frase, setFrase] = useState(0);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(100, v + 6 + Math.random() * 12);
      setPct(v);
      setFrase(Math.min(FRASES.length - 1, Math.floor(v / (100 / FRASES.length))));
      if (v >= 100) {
        clearInterval(t);
        setSaliendo(true);
        setTimeout(onListo, 480);
      }
    }, 110);
    return () => clearInterval(t);
  }, [onListo]);

  return (
    <div className={"cargando" + (saliendo ? " sale" : "")}>
      <div className="carga-centro">
        <svg viewBox="0 0 120 120" width="112" height="112" className="carga-sello" aria-hidden="true">
          <circle cx="60" cy="60" r="46" fill="none" stroke="#2A1C3C" strokeWidth="3" />
          <circle cx="60" cy="60" r="46" fill="none" stroke="url(#cg)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 289} 289`} transform="rotate(-90 60 60)" />
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" /><stop offset="60%" stopColor="#E0338A" /><stop offset="100%" stopColor="#FF3B5C" />
            </linearGradient>
          </defs>
          <g className="carga-runa">
            <path d="M 60 32 L 78 60 L 60 88 L 42 60 Z" fill="none" stroke="#B794F6" strokeWidth="2" opacity=".8" />
            <circle cx="60" cy="60" r="7" fill="#E0338A" opacity=".9" />
          </g>
        </svg>
        <p className="carga-titulo">SQL Quest</p>
        <p className="carga-frase" key={frase}>{FRASES[frase]}…</p>
        <div className="carga-barra"><i style={{ width: pct + "%" }} /></div>
      </div>
    </div>
  );
}

/* ============================================================
   AVISO DE GUARDADO — aparece solo cuando algo se guarda
   ============================================================ */
export function AvisoGuardado() {
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);
  const primera = useRef(true);

  useEffect(() => {
    const quitar = onGuardado(() => {
      if (primera.current) { primera.current = false; return; }
      setVisible(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), 1700);
    });
    return () => { quitar(); };
  }, []);

  return <div className={"aviso-guardado" + (visible ? " on" : "")} aria-live="polite">progreso guardado</div>;
}

/* ============================================================
   RESPALDO — exportar e importar el progreso
   ============================================================ */
export function Respaldo({ onCerrar }: { onCerrar: () => void }) {
  const [msg, setMsg] = useState<{ ok: boolean; txt: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function descargar() {
    const blob = new Blob([exportarProgreso()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sql-quest-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, txt: "Archivo descargado. Guardalo donde no se te pierda." });
  }

  function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const res = importarProgreso(String(r.result));
      setMsg({ ok: res.ok, txt: res.msg });
      if (res.ok) setTimeout(onCerrar, 1400);
    };
    r.readAsText(f);
  }

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="box" style={{ maxWidth: 520 }}>
        <div className="top"><h3>Respaldo del progreso</h3><span className="sp" />
          <button className="btn gh peq" onClick={onCerrar}>Cerrar <kbd>Esc</kbd></button></div>
        <div className="body">
          <p style={{ margin: "0 0 16px", color: "var(--dim)", fontSize: 14.5 }}>
            Tu avance se guarda solo, en este navegador. Si cambias de equipo, borras los datos del sitio
            o usas una ventana de incognito, se pierde. Descarga un archivo y lo recuperas donde quieras.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn go" onClick={descargar}>Descargar mi progreso</button>
            <button className="btn gh" onClick={() => input.current?.click()}>Restaurar desde archivo</button>
            <input ref={input} type="file" accept="application/json,.json" hidden onChange={subir} />
          </div>
          {msg && <div className={"msg " + (msg.ok ? "ok" : "err")} style={{ marginTop: 16 }}>{msg.txt}</div>}
          <p className="nota-inline" style={{ display: "block", marginTop: 16 }}>
            Restaurar reemplaza por completo el avance actual.
          </p>
        </div>
      </div>
    </div>
  );
}
