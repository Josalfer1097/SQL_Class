import { useMemo, useState } from "react";
import ENG from "../engine/engine.js";
import SEED from "../engine/seed.js";
import REV from "../engine/revisor.js";
import { Editor, Tabla, pintar, type EsquemaVivo } from "./Editor";
import { Umbra } from "./Personajes";
import { Burbuja } from "./Pantallas";
import { acciones, useJuego } from "../game/store";
import { leccionDe, type Bloque, type Paso } from "../game/lecciones";
import { REINOS, UMBRA, frase, EJERCICIOS } from "../game/mundo";

type Res = { command: string; cols?: string[]; rows?: Record<string, unknown>[]; count: number | null };

/* consola pequeña que aparece dentro de cada ejemplo */
function MiniConsola({ sql, explica }: { sql: string; explica?: string }) {
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [corriendo, setCorriendo] = useState(false);

  function correr() {
    setCorriendo(true);
    try {
      const out = ENG.execute(sql, SEED.construirDB()) as Res[];
      setRes(out[out.length - 1]); setErr(null);
    } catch (e) { setErr((e as Error).message); setRes(null); }
    setTimeout(() => setCorriendo(false), 380);
  }

  return (
    <div className="ejemplo">
      <div className="ejemplo-cab">
        <span>ejemplo</span>
        <span className="sp" />
        <button className={"btn go peq " + (corriendo ? "busy" : "")} onClick={correr}>
          {res || err ? "Ejecutar otra vez" : "Ejecutar"}
        </button>
      </div>
      <pre className="ejemplo-sql" dangerouslySetInnerHTML={{ __html: pintar(sql) }} />
      {explica && <p className="ejemplo-explica">{explica}</p>}
      {err && <div className="msg err"><b>ERROR:</b> {err}</div>}
      {res && res.command === "SELECT" && (
        <div className="ejemplo-res">
          <Tabla cols={res.cols || []} rows={res.rows || []} max={8} />
          <div className="rowinfo">{res.count} {res.count === 1 ? "fila" : "filas"}</div>
        </div>
      )}
      {res && res.command !== "SELECT" && (
        <div className="msg ok"><b>{res.command}</b> · {res.count === null ? "ejecutado" : `${res.count} filas afectadas`}</div>
      )}
    </div>
  );
}

/* mini reto dentro de la leccion */
function Prueba({ pide, sol, pista, onResuelto }: { pide: string; sol: string; pista: string; onResuelto: () => void }) {
  const [sql, setSql] = useState("");
  const [estado, setEstado] = useState<"sin" | "mal" | "bien">("sin");
  const [verPista, setVerPista] = useState(false);
  const [detalle, setDetalle] = useState("");
  const esquema: EsquemaVivo = useMemo(() => {
    const db = SEED.construirDB() as { tables: Record<string, { cols: string[]; meta: Record<string, { type?: string }> }> };
    const o: EsquemaVivo = {};
    Object.keys(db.tables).forEach((n) => { o[n] = db.tables[n].cols.map((c) => ({ c, type: db.tables[n].meta[c]?.type || "" })); });
    return o;
  }, []);

  function revisar() {
    if (!sql.trim()) return;
    /* el tipo de comprobacion depende de la sentencia: un ALTER o un UPDATE
       se verifican por el estado de la tabla, no por las filas devueltas */
    const m = /^\s*(?:alter\s+table|update|delete\s+from|insert\s+into)\s+([a-z_]+)/i.exec(sol.trim());
    const check = m
      ? { tipo: "state" as const, tabla: m[1].toLowerCase() }
      : { tipo: "rows" as const, ordered: /order\s+by/i.test(sol) };
    const ej = { n: -1, dif: "leccion", tema: "SELECT", titulo: "prueba", bloque: "leccion", pide, pistas: [pista], sol, check, aprende: "" };
    /* el revisor guarda una lista global que usan los pasos encadenados;
       la prestamos un momento y la devolvemos intacta */
    REV.setEjercicios([ej]);
    const r = REV.revisar(sql, ej) as { ok: boolean; error: { message: string } | null; detalle?: string };
    REV.setEjercicios(EJERCICIOS);
    if (r.ok && !r.error) { setEstado("bien"); onResuelto(); }
    else { setEstado("mal"); setDetalle(r.error ? r.error.message : (r.detalle || "El resultado no coincide.")); }
  }

  return (
    <div className={"pruebita " + estado}>
      <div className="pruebita-cab"><span className="lbl">pruébalo tú</span><p>{pide}</p></div>
      <Editor value={sql} onChange={setSql} onRun={revisar} onCheck={revisar} onFormat={() => { }} esquema={esquema}
        placeholder="-- Escribe aqui y pulsa Comprobar" />
      <div className="pruebita-bar">
        <button className="btn go peq" onClick={revisar}>Comprobar</button>
        {!verPista && estado !== "bien" && <button className="btn warm peq" onClick={() => setVerPista(true)}>Pista (gratis aqui)</button>}
        <span className="sp" />
        {estado === "bien" && <span className="ok-txt">✓ correcto</span>}
        {estado === "mal" && <span className="mal-txt">{detalle}</span>}
      </div>
      {verPista && estado !== "bien" && <div className="note riesgo"><span className="lbl">pista</span><p>{pista}</p></div>}
    </div>
  );
}

function BloqueVista({ b, onPrueba }: { b: Bloque; onPrueba: () => void }) {
  switch (b.t) {
    case "texto": return <p className="lec-texto">{b.txt}</p>;
    case "nota": return (
      <div className={"lec-nota " + b.tono}>
        <span className="lbl">{b.tono === "ojo" ? "ojo con esto" : b.tono === "regla" ? "regla de oro" : "dato"}</span>
        <p>{b.txt}</p>
      </div>
    );
    case "codigo": return <MiniConsola sql={b.sql} explica={b.explica} />;
    case "tabla": return (
      <div className="lec-tabla">
        <table>
          <thead><tr>{b.cab.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{b.filas.map((f, i) => <tr key={i}>{f.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    case "prueba": return <Prueba pide={b.pide} sol={b.sol} pista={b.pista} onResuelto={onPrueba} />;
  }
}

export function LeccionView() {
  const j = useJuego();
  const reinoId = j.reinoActual!;
  const leccion = leccionDe(reinoId)!;
  const reino = REINOS.find((r) => r.id === reinoId)!;
  const yaHecha = j.progreso.leccionesHechas.includes(reinoId);
  const [i, setI] = useState(0);
  const [pruebasOk, setPruebasOk] = useState<Set<number>>(new Set());
  const [fin, setFin] = useState(false);
  const [xpGanado, setXpGanado] = useState(0);

  const paso: Paso = leccion.pasos[i];
  const ultimo = i === leccion.pasos.length - 1;
  const tienePrueba = paso.bloques.some((b) => b.t === "prueba");
  const pruebaHecha = pruebasOk.has(i);
  const puedeAvanzar = !tienePrueba || pruebaHecha || yaHecha;

  function siguiente() {
    if (ultimo) {
      const g = acciones.completarLeccion(reinoId);
      setXpGanado(g);
      setFin(true);
      return;
    }
    setI(i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (fin) {
    return (
      <div className="pantalla leccion" style={{ ["--rc" as string]: reino.color }}>
        <div className="lec-fin">
          <Umbra size={190} humor="feliz" />
          <h2>Leccion completada</h2>
          <p className="lec-fin-txt">{yaHecha ? "Ya la habias leido, asi que esta vez va sin XP. Repasar nunca sobra." : `Ahora si, a los desafios de ${reino.nombre}.`}</p>
          {xpGanado > 0 && <div className="xpgana grande">+{xpGanado} XP</div>}
          <div className="lec-fin-bar">
            <button className="btn go grande" onClick={() => acciones.volverAlMapa()}>Ir a los desafios</button>
            <button className="btn gh" onClick={() => { setFin(false); setI(0); }}>Volver a leerla</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pantalla leccion" style={{ ["--rc" as string]: reino.color }}>
      <header className="lec-top">
        <button className="btn gh peq" onClick={() => acciones.volverAlMapa()}>← Mapa</button>
        <span className="reino-tag">{reino.icono} {reino.nombre}</span>
        <span className="sp" />
        <span className="lec-cuenta">paso {i + 1} de {leccion.pasos.length}</span>
      </header>
      <div className="lec-barra"><i style={{ width: ((i + 1) / leccion.pasos.length) * 100 + "%" }} /></div>

      <div className="lec-cuerpo">
        <div className="lec-cab">
          <p className="eyebrow">Leccion · {leccion.titulo}</p>
          <h1>{paso.titulo}</h1>
          {i === 0 && (
            <div className="lec-intro">
              <Umbra size={110} humor="burlon" />
              <Burbuja texto={leccion.intro} />
            </div>
          )}
        </div>

        <div className="lec-bloques">
          {paso.bloques.map((b, k) => (
            <div key={k} className="lec-bloque" style={{ animationDelay: k * 70 + "ms" }}>
              <BloqueVista b={b} onPrueba={() => setPruebasOk((s) => new Set(s).add(i))} />
            </div>
          ))}
        </div>

        <div className="lec-nav">
          {i > 0 && <button className="btn gh" onClick={() => { setI(i - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>← Anterior</button>}
          <span className="sp" />
          {!puedeAvanzar && <span className="lec-aviso">Resuelve la prueba para seguir. O pide la pista, que aqui es gratis.</span>}
          <button className="btn go" onClick={siguiente} disabled={!puedeAvanzar}>
            {ultimo ? "Terminar leccion" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function frasesUmbra() { return frase(UMBRA.saludos); }