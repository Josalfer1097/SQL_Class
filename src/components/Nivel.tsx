import { useEffect, useMemo, useRef, useState } from "react";
import ENG from "../engine/engine.js";
import SEED from "../engine/seed.js";
import REV from "../engine/revisor.js";
import FMT from "../engine/formatter.js";
import { Editor, Tabla, pintar, type EsquemaVivo } from "./Editor";
import { Avatar, Umbra } from "./Personajes";
import { Burbuja } from "./Pantallas";
import { acciones, useJuego, nivelDesbloqueado, type Progreso } from "../game/store";
const hecho0 = (p: Progreso, n: number) => p.resueltos.includes(n);
import { EJERCICIOS, porN, reinoDe, esJefe, UMBRA, frase, COSTO_PISTA, COSTO_SOLUCION } from "../game/mundo";

REV.setEjercicios(EJERCICIOS);

type DB = { today: string; tables: Record<string, { cols: string[]; meta: Record<string, any>; rows: Record<string, any>[]; constraints: any[] }> };
type Resultado = { command: string; cols?: string[]; rows?: Record<string, any>[]; count: number | null };
type Mejora = { t: "grave" | "riesgo" | "estilo"; txt: string };
type Revision = {
  ok: boolean; error: { message: string; hint?: string | null } | null; detalle?: string; mejoras: Mejora[];
  resultado?: { cols: string[]; rows: Record<string, any>[]; count: number }; esperado?: { cols: string[]; rows: Record<string, any>[]; count: number };
  diff?: { faltan: string[]; sobran: string[]; nFaltan: number; nSobran: number }; cambios?: string[]; cambiosEsperados?: string[];
};

function clonar(db: DB): DB {
  const o: DB = { today: db.today, tables: {} };
  Object.keys(db.tables).forEach((n) => {
    const t = db.tables[n];
    o.tables[n] = { cols: t.cols.slice(), meta: JSON.parse(JSON.stringify(t.meta)), constraints: (t.constraints || []).slice(), rows: t.rows.map((r) => ({ ...r })) };
  });
  return o;
}
function esquemaDe(db: DB): EsquemaVivo {
  const o: EsquemaVivo = {};
  Object.keys(db.tables).forEach((n) => { o[n] = db.tables[n].cols.map((c) => ({ c, type: (db.tables[n].meta[c] || {}).type || "" })); });
  return o;
}
const muta = (sql: string) => /^\s*(update|delete|insert|alter|with\b[\s\S]*?\)\s*(update|delete|insert))/i.test(sql.replace(/--[^\n]*/g, " ").trim());
function tablaTocada(sql: string) { const m = /\b(?:update|delete\s+from|insert\s+into|alter\s+table)\s+([a-z_][a-z0-9_]*)/i.exec(sql.replace(/--[^\n]*/g, " ")); return m ? m[1].toLowerCase() : null; }

export function Nivel() {
  const j = useJuego();
  const n = j.nivelActual!;
  const e = porN(n), reino = reinoDe(n), jefe = esJefe(n);
  const p = j.progreso;

  const [sql, setSql] = useState<string>(p.sqlGuardado[n] || "");
  const [db, setDb] = useState<DB>(() => REV.baseDe(e) as DB);
  const [pila, setPila] = useState<DB[]>([]);
  const [pane, setPane] = useState<"res" | "rev" | "msg">("res");
  const [res, setRes] = useState<Resultado | null>(null);
  const [errRun, setErrRun] = useState<{ message: string; hint?: string | null } | null>(null);
  const [vista, setVista] = useState<{ titulo: string; cols: string[]; rows: Record<string, any>[] } | null>(null);
  const [rev, setRev] = useState<Revision | null>(null);
  const [habla, setHabla] = useState<{ txt: string; humor: "neutral" | "feliz" | "burlon" | "serio" }>({ txt: jefe ? frase(UMBRA.jefeIntro) : reino.intro, humor: jefe ? "serio" : "burlon" });
  const [gano, setGano] = useState<{ xp: number; reino: string | null } | null>(null);
  const [modelo, setModelo] = useState(false);
  const [status, setStatus] = useState("");
  const [fx, setFx] = useState<{ tipo: "ok" | "mal" | "run" | null; k: number }>({ tipo: null, k: 0 });
  const [escribiendo, setEscribiendo] = useState(false);
  const escRef = useRef<number | null>(null);
  const disparar = (tipo: "ok" | "mal" | "run") => setFx((f) => ({ tipo, k: f.k + 1 }));
  const pistasAbiertas = hecho0(p, n) ? 3 : (p.pistasVistas[n] || 0);
  const [verSol, setVerSol] = useState(p.solucionesVistas.includes(n) || p.resueltos.includes(n));
  const guardaRef = useRef<number | null>(null);

  const esquema = useMemo(() => esquemaDe(db), [db]);
  const original = useMemo(() => esquemaDe(SEED.construirDB() as DB), []);
  const hecho = p.resueltos.includes(n);

  // guardar lo escrito con un pequeno retardo
  useEffect(() => {
    if (guardaRef.current) window.clearTimeout(guardaRef.current);
    guardaRef.current = window.setTimeout(() => acciones.guardarSql(n, sql), 400);
  }, [sql, n]);

  /* mientras escribes, Umbra te mira: se queda seria y la escena vibra apenas */
  useEffect(() => {
    if (!sql) return;
    setEscribiendo(true);
    if (escRef.current) window.clearTimeout(escRef.current);
    escRef.current = window.setTimeout(() => setEscribiendo(false), 900);
    return () => { if (escRef.current) window.clearTimeout(escRef.current); };
  }, [sql]);

  /* ---------- ejecutar ---------- */
  function ejecutar() {
    if (!sql.trim()) { setStatus("escribe algo primero"); disparar("mal"); return; }
    disparar("run");
    const t0 = performance.now();
    const base = db;
    const tabla = tablaTocada(sql);
    let ids: any[] | null = null;
    if (tabla && /^\s*update\b/i.test(sql.trim())) {
      const cond = /\bwhere\b([\s\S]+)$/i.exec(sql.replace(/--[^\n]*/g, " ").replace(/;\s*$/, ""));
      const al = /\bupdate\s+[a-z_]+\s+(?:as\s+)?([a-z][a-z0-9_]*)/i.exec(sql);
      if (cond) {
        try {
          const q = `SELECT ${al && al[1] !== "set" ? al[1] + "." : ""}id AS id FROM ${tabla}${al && al[1] !== "set" ? " " + al[1] : ""} WHERE ${cond[1].trim()} LIMIT 200;`;
          const rr = ENG.execute(q, base) as Resultado[]; ids = (rr[rr.length - 1].rows || []).map((r) => r.id);
        } catch { ids = null; }
      }
    }
    const snapshot = muta(sql) ? clonar(base) : null;
    let out: Resultado[];
    try { out = ENG.execute(sql, base) as Resultado[]; }
    catch (err: any) {
      setErrRun({ message: err.message, hint: err.hint }); setRes(null); setVista(null);
      setStatus("fallo en " + (performance.now() - t0).toFixed(1) + " ms"); setPane("msg");
      setHabla({ txt: frase(UMBRA.error), humor: "burlon" }); disparar("mal");
      return;
    }
    const ms = (performance.now() - t0).toFixed(1);
    const last = out[out.length - 1];
    setErrRun(null); setRes(last);
    if (snapshot) { setPila((pl) => [...pl.slice(-24), snapshot]); setDb({ ...base }); }
    if (last.command !== "SELECT" && tabla && base.tables[tabla]) {
      try {
        let q: string, titulo: string;
        if (ids && ids.length) { q = `SELECT * FROM ${tabla} WHERE id IN (${ids.join(",")}) LIMIT 15;`; titulo = ids.length === 1 ? "asi quedo la fila que cambio" : `asi quedaron las ${ids.length} filas que cambiaron`; }
        else if (ids && !ids.length) { q = ""; titulo = ""; }
        else { const tot = base.tables[tabla].rows.length; q = `SELECT * FROM ${tabla} LIMIT 15;`; titulo = `asi quedo ${tabla}` + (tot > 15 ? ` · primeras 15 de ${tot}` : ""); }
        if (q) { const v = ENG.execute(q, base) as Resultado[]; const vr = v[v.length - 1]; setVista({ titulo, cols: vr.cols || [], rows: vr.rows || [] }); }
        else setVista({ titulo: "ninguna fila cumplia el WHERE: la tabla quedo igual", cols: [], rows: [] });
      } catch { setVista(null); }
    } else setVista(null);
    setStatus("ejecutado en " + ms + " ms"); setPane("res");
  }

  function deshacer() { if (!pila.length) return; const prev = pila[pila.length - 1]; setPila(pila.slice(0, -1)); setDb(prev); setVista(null); setStatus("cambio revertido"); }
  function restaurar() { setDb(REV.baseDe(e) as DB); setPila([]); setVista(null); setStatus("base restaurada"); }

  /* ---------- revisar ---------- */
  function revisar() {
    if (!sql.trim()) { setStatus("escribe algo primero"); return; }
    const r = REV.revisar(sql, e) as Revision;
    acciones.intento(n);
    setRev(r); setPane("rev");
    if (r.error) { setHabla({ txt: frase(UMBRA.error), humor: "burlon" }); setStatus("no corrio"); disparar("mal"); return; }
    if (r.ok) {
      const g = acciones.resolver(n);
      setGano(g.primeraVez ? { xp: g.xp, reino: g.reinoConquistado } : null);
      setHabla({ txt: g.reinoConquistado ? reino.victoria : frase(r.mejoras.length ? UMBRA.acierto : UMBRA.aciertoLimpio), humor: "feliz" });
      setStatus("resuelto"); setVerSol(true); disparar("ok");
    } else { setHabla({ txt: frase(UMBRA.fallo), humor: "burlon" }); setStatus("revisado"); disparar("mal"); }
  }

  function formatear() { try { const f = FMT.formatear(sql); if (f !== sql) { setSql(f); setStatus("reescrito con el formato del curso"); } } catch { /* nada */ } }

  function pista() {
    if (jefe && !hecho) { setHabla({ txt: "En un jefe no hay pistas. Ni por XP. Ni por carino.", humor: "serio" }); return; }
    if (pistasAbiertas >= 3) { setHabla({ txt: frase(UMBRA.sinPistas), humor: "burlon" }); setPane("rev"); return; }
    const abierta = acciones.pedirPista(n);
    if (abierta < 0) { setHabla({ txt: frase(UMBRA.sinXp), humor: "serio" }); return; }
    setPane("rev");
    setHabla({ txt: frase([UMBRA.pista1, UMBRA.pista2, UMBRA.pista3][abierta - 1]), humor: "burlon" });
  }
  function solucion() {
    if (verSol) return;
    if (jefe && !hecho) { setHabla({ txt: "La solucion del jefe no se vende. Se conquista.", humor: "serio" }); return; }
    if (acciones.pedirSolucion(n)) { setVerSol(true); setPane("rev"); setHabla({ txt: frase(UMBRA.solucion), humor: "burlon" }); }
    else setHabla({ txt: frase(UMBRA.sinXp), humor: "serio" });
  }

  const idx = reino.niveles.indexOf(n);
  const siguiente = reino.niveles[idx + 1] ?? null;
  const puedeSeguir = siguiente !== null && nivelDesbloqueado(siguiente, j.progreso);

  return (
    <div className={"pantalla nivel" + (escribiendo ? " escribiendo" : "") + (fx.tipo === "mal" ? " sacude" : "") + (fx.tipo === "ok" ? " celebra" : "")} key={fx.k + (fx.tipo || "")} style={{ ["--rc" as string]: reino.color }}>
      <header className="nivel-top">
        <button className="btn gh peq" onClick={() => acciones.volverAlMapa()}>← Mapa</button>
        <span className="reino-tag">{reino.icono} {reino.nombre}</span>
        <span className="sp" />
        <span className="pill xp"><b>{p.xp}</b> XP</span>
        {pila.length > 0 && <span className="pill tocada">base con {pila.length} cambio{pila.length > 1 ? "s" : ""}</span>}
        <button className={"btn gh peq " + (pila.length ? "tocado" : "")} onClick={() => setModelo(true)}>Modelo <kbd>Ctrl+M</kbd></button>
      </header>

      <div className="nivel-grid">
        {/* ---------- lateral: personaje, maestro y esquema ---------- */}
        <aside className="nivel-lado">
          <div className={"escena" + (escribiendo ? " atento" : "") + (fx.tipo === "ok" ? " feliz" : "") + (fx.tipo === "mal" ? " nope" : "")}>
            {j.personaje && <div className="jugador"><Avatar p={j.personaje} size={120} /></div>}
            <div className="maestro"><Umbra size={150} humor={habla.humor} /></div>
          </div>
          <Burbuja texto={habla.txt} />
          <div className="esquema">
            <h5>Esquema</h5>
            {Object.keys(esquema).map((t) => (
              <details key={t} open={t === "productos"}>
                <summary>{t} <small>({db.tables[t].rows.length})</small>
                  <button className="peek" onClick={(ev) => { ev.preventDefault(); setSql(`SELECT *\n  FROM ${t}\n LIMIT 10;`); }}>ver</button>
                </summary>
                {esquema[t].map((c) => (
                  <div key={c.c} className={"col " + (!original[t]?.some((x) => x.c === c.c) ? "nueva" : "")} onClick={() => setSql((s) => s + (s && !/\s$/.test(s) ? " " : "") + c.c)}>
                    <span>{c.c}{c.c === "id" ? " PK" : /_id$/.test(c.c) ? " FK" : ""}</span><span className="ty">{c.type}</span>
                  </div>
                ))}
              </details>
            ))}
          </div>
        </aside>

        {/* ---------- centro: desafio + IDE ---------- */}
        <section className="nivel-centro">
          <div className="brief">
            <div className="brief-head">
              <span className={"chip " + (jefe ? "jefe" : "")}>{jefe ? "☠ jefe del reino" : `desafio ${idx + 1} de ${reino.niveles.length}`}</span>
              <span className="chip tema">{e.tema}</span>
              <span className="chip bloque">{e.bloque}</span>
              {hecho && <span className="chip hecho">✓ superado</span>}
            </div>
            <h2>{e.titulo}</h2>
            <p>{e.pide}</p>
            {e.cadena && <div className="cadenanota">Este paso parte del estado que dejaron los pasos anteriores. Abre <b>Modelo</b> para ver como va quedando la base.</div>}
            {e.tips && <ul className="tips">{e.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
          </div>

          <Editor value={sql} onChange={setSql} onRun={ejecutar} onCheck={revisar} onFormat={formatear} esquema={esquema} />

          <div className="bar">
            <button className="btn go" onClick={ejecutar}>Ejecutar <kbd>Ctrl+Enter</kbd></button>
            <button className="btn gh" onClick={revisar}>Revisar <kbd>Ctrl+K</kbd></button>
            <button className="btn gh" onClick={formatear}>Formato <kbd>Ctrl+L</kbd></button>
            <button className="btn warm" onClick={pista} disabled={hecho || pistasAbiertas >= 3}>
              {hecho ? "Pistas abiertas" : pistasAbiertas >= 3 ? "Sin mas pistas" : `Pista ${pistasAbiertas + 1} de 3 · ${COSTO_PISTA[pistasAbiertas]} XP`}
            </button>
            <button className="btn warm" onClick={solucion} disabled={verSol}>{verSol ? "Solucion vista" : `Solucion · ${COSTO_SOLUCION} XP`}</button>
            {pila.length > 0 && <><button className="btn gh peq mag" onClick={deshacer}>↶ deshacer</button><button className="btn gh peq mag" onClick={restaurar}>⟲ restaurar</button></>}
            <span className="sp" />
            <span className="status">{status}</span>
          </div>

          <div className="out">
            <div className="tabs">
              <button className={"tab " + (pane === "res" ? "on" : "")} onClick={() => setPane("res")}>Resultado {res && <span className="badge ok">{res.command === "SELECT" ? res.count : res.command}</span>}{errRun && <span className="badge bad">error</span>}</button>
              <button className={"tab " + (pane === "rev" ? "on" : "")} onClick={() => setPane("rev")}>Revision {rev && <span className={"badge " + (rev.ok ? "ok" : "bad")}>{rev.ok ? "ok" : "revisar"}</span>}</button>
              <button className={"tab " + (pane === "msg" ? "on" : "")} onClick={() => setPane("msg")}>Mensajes</button>
            </div>
            <div className="panes">
              {pane === "res" && (
                <div className="pane">
                  {!res && !errRun && <div className="vacio">Ejecuta una consulta para ver el resultado. La base de este desafio es tuya: lo que cambies se queda hasta que restaures.</div>}
                  {errRun && <div className="vacio">La consulta no se ejecuto. Mira la pestana Mensajes.</div>}
                  {res && res.command === "SELECT" && <Tabla cols={res.cols || []} rows={res.rows || []} />}
                  {res && res.command !== "SELECT" && (<>
                    <div className="msg ok"><b>{res.command}</b> · {res.count === null ? "ejecutado" : `${res.count} fila${res.count === 1 ? "" : "s"} afectada${res.count === 1 ? "" : "s"}`}</div>
                    {vista && (vista.cols.length ? <div className="despues"><div className="cab" dangerouslySetInnerHTML={{ __html: vista.titulo }} /><Tabla cols={vista.cols} rows={vista.rows} max={15} /></div> : <div className="msg info">{vista.titulo}</div>)}
                  </>)}
                </div>
              )}
              {pane === "rev" && (
                <div className="pane">
                  {!rev && !pistasAbiertas && !verSol && <div className="vacio">Pulsa Revisar y Umbra te dira si el reporte es el que pedia. Y como esta escrito.</div>}
                  {pistasAbiertas > 0 && !hecho && (
                    <div className="pistas">
                      {e.pistas.slice(0, pistasAbiertas).map((t, i) => (
                        <div key={i} className="note riesgo pista-anim" style={{ animationDelay: i * 60 + "ms" }}>
                          <span className="lbl">pista {i + 1}</span><p>{t}</p>
                        </div>
                      ))}
                      {pistasAbiertas < 3 && <p className="mas-pistas">Quedan {3 - pistasAbiertas} pistas. La siguiente cuesta {COSTO_PISTA[pistasAbiertas]} XP y es mas concreta.</p>}
                    </div>
                  )}
                  {hecho && <div className="pistas">{e.pistas.map((t, i) => (<div key={i} className="note estilo"><span className="lbl">pista {i + 1}</span><p>{t}</p></div>))}</div>}
                  {verSol && !hecho && <div className="note estilo"><span className="lbl">solucion</span><p>Asi se resuelve. Escribela tu: copiar no deja callo.</p></div>}
                  {verSol && !hecho && <div className="sol"><pre dangerouslySetInnerHTML={{ __html: pintar(e.sol) }} /><button className="btn gh peq" onClick={() => setSql(e.sol)}>Copiar al editor</button></div>}
                  {rev && <PanelRevision rev={rev} ej={e} gano={gano} siguiente={puedeSeguir ? siguiente : null} />}
                </div>
              )}
              {pane === "msg" && (
                <div className="pane">
                  {errRun ? <div className="msg err"><b>ERROR:</b> {errRun.message}{errRun.hint && <span className="hint">{errRun.hint}</span>}</div>
                    : res ? <div className="msg ok"><b>{res.command}</b> {res.count !== null ? res.count : ""}</div>
                    : <div className="msg info">Listo. Lo que ejecutes se queda en la base de este desafio; usa deshacer o restaurar para volver atras. La revision siempre se hace sobre una copia limpia.</div>}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {fx.tipo === "ok" && <Confeti key={fx.k} />}
      {modelo && <Modelo db={db} original={original} onClose={() => setModelo(false)} />}
      <AtajosGlobales onModelo={() => setModelo((m) => !m)} onCerrar={() => setModelo(false)} onRun={ejecutar} onCheck={revisar} onFormat={formatear} />
    </div>
  );
}

/* ---------- lluvia de chispas al acertar ---------- */
function Confeti() {
  const trozos = Array.from({ length: 26 }, (_, i) => ({
    i, x: 8 + Math.random() * 84, d: Math.random() * 420, dur: 1100 + Math.random() * 900,
    c: ["#FFB05C", "#2DD4A7", "#E0338A", "#B794F6", "#7CD5FF"][i % 5], r: Math.random() * 360
  }));
  return (
    <div className="confeti" aria-hidden="true">
      {trozos.map((t) => (
        <i key={t.i} style={{ left: t.x + "%", background: t.c, animationDelay: t.d + "ms", animationDuration: t.dur + "ms", ["--r" as string]: t.r + "deg" }} />
      ))}
    </div>
  );
}

/* ---------- panel de revision ---------- */
function PanelRevision({ rev, ej, gano, siguiente }: { rev: Revision; ej: ReturnType<typeof porN>; gano: { xp: number; reino: string | null } | null; siguiente: number | null }) {
  const orden = { grave: 0, riesgo: 1, estilo: 2 };
  const mejoras = [...(rev.mejoras || [])].sort((a, b) => orden[a.t] - orden[b.t]);
  return (<>
    {rev.error ? (
      <div className="verdict no"><span className="ico">!</span><div><h4>La consulta no corre</h4><p>{rev.error.message}</p>{rev.error.hint && <p className="hint">{rev.error.hint}</p>}</div></div>
    ) : rev.ok ? (<>
      <div className="verdict good"><span className="ico">✓</span><div><h4>{mejoras.length ? "Correcto" : "Correcto, y bien escrito"}</h4>
        <p>{ej.check.tipo === "rows" ? `El resultado coincide: ${rev.resultado?.count} fila${rev.resultado?.count === 1 ? "" : "s"}.` : `La tabla ${ej.check.tabla} quedo exactamente como se esperaba.`}</p></div>
        {gano && <div className="xpgana">+{gano.xp} XP</div>}
      </div>
      {gano?.reino && <div className="conq">⚑ Reino conquistado. La siguiente puerta acaba de abrirse.</div>}
      {ej.check.tipo === "state" && rev.cambios && rev.cambios.length > 0 && <div className="diffbox"><h6>lo que tu sentencia cambio</h6>{rev.cambios.map((c, i) => <div key={i} className="diffl fal"><span className="sg">·</span><span className="v">{c}</span></div>)}</div>}
      <div className="learn"><h5>Lo que acabas de practicar</h5><p>{ej.aprende}</p>{ej.reto && <div className="reto"><b>Sigue tu:</b> {ej.reto}</div>}</div>
      {siguiente && <button className="btn go" onClick={() => acciones.abrirNivel(siguiente)}>Siguiente desafio →</button>}
      {!siguiente && <button className="btn go" onClick={() => acciones.volverAlMapa()}>Volver al mapa</button>}
    </>) : (
      <div className="verdict no"><span className="ico">×</span><div><h4>Todavia no</h4><p>{rev.detalle || "El resultado no coincide."}</p></div></div>
    )}
    {mejoras.length > 0 && <div className="notes">{mejoras.map((m, i) => <div key={i} className={"note " + m.t}><span className="lbl">{m.t === "grave" ? "importante" : m.t === "riesgo" ? "cuidado" : "estilo"}</span><p>{m.txt}</p></div>)}</div>}
    {!rev.ok && !rev.error && rev.diff && (rev.diff.faltan.length > 0 || rev.diff.sobran.length > 0) && (
      <div className="diffbox"><h6>diferencia con el resultado esperado</h6>
        {rev.diff.faltan.map((f, i) => <div key={"f" + i} className="diffl fal"><span className="sg">+</span><span className="v">{f} · deberia salir y no sale</span></div>)}
        {rev.diff.sobran.map((f, i) => <div key={"s" + i} className="diffl sob"><span className="sg">−</span><span className="v">{f} · sale y no deberia</span></div>)}
      </div>
    )}
    {!rev.ok && !rev.error && ej.check.tipo === "rows" && rev.resultado && rev.esperado && (
      <div className="cmpwrap">
        <div className="cmp"><h6>tu resultado · {rev.resultado.count} filas</h6><Tabla cols={rev.resultado.cols} rows={rev.resultado.rows} max={8} /></div>
        <div className="cmp"><h6>se esperaba · {rev.esperado.count} filas</h6><Tabla cols={rev.esperado.cols} rows={rev.esperado.rows} max={8} /></div>
      </div>
    )}
    {!rev.ok && !rev.error && ej.check.tipo === "state" && (
      <div className="cmpwrap">
        <div className="cmp"><h6>lo que hizo tu sentencia</h6><div className="cmp-txt">{(rev.cambios && rev.cambios.length ? rev.cambios : ["no cambio nada"]).map((c, i) => <div key={i}>{c}</div>)}</div></div>
        <div className="cmp"><h6>lo que se esperaba</h6><div className="cmp-txt">{(rev.cambiosEsperados || []).map((c, i) => <div key={i}>{c}</div>)}</div></div>
      </div>
    )}
  </>);
}

/* ---------- modelo de la base ---------- */
const REL = [["empleados.sucursal_id", "sucursales.id"], ["ventas.producto_id", "productos.id"], ["ventas.empleado_id", "empleados.id"]];
function Modelo({ db, original, onClose }: { db: DB; original: EsquemaVivo; onClose: () => void }) {
  let cambios = 0;
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="box">
        <div className="top"><h3>Modelo de la base</h3><span className="sp" /><button className="btn gh peq" onClick={onClose}>Cerrar <kbd>Esc</kbd></button></div>
        <div className="body">
          <div className="erd">
            {Object.keys(db.tables).map((n) => {
              const t = db.tables[n]; const orig = original[n];
              const nuevas = t.cols.filter((c) => !orig || !orig.some((x) => x.c === c));
              const tocada = nuevas.length > 0 || (t.constraints || []).length > (n === "productos" ? 3 : n === "empleados" ? 3 : n === "ventas" ? 4 : 0);
              if (tocada) cambios++;
              return (
                <div key={n} className={"ent " + (tocada ? "tocada" : "")}>
                  <h4>{n}<span className="cnt">{t.rows.length} filas</span></h4>
                  {t.cols.map((c) => { const m = t.meta[c] || {}; return (
                    <div key={c} className={"f " + (nuevas.includes(c) ? "nueva" : "")}><span className="nm">{c}</span>{c === "id" ? <span className="bk">PK</span> : /_id$/.test(c) ? <span className="bk fk">FK</span> : null}<span className="ty">{m.type}{m.notnull ? " NN" : ""}</span></div>
                  ); })}
                  {(t.constraints || []).length > 0 && <div className="cons">{t.constraints.map((k: any, i: number) => <div key={i}>{(k.name || k.t) + " · " + String(k.t).toUpperCase()}</div>)}</div>}
                </div>
              );
            })}
          </div>
          <div className="rels"><h5>Relaciones</h5>{REL.map((r) => <div key={r[0]} className="rel">{r[0]}<span className="ar">──▶</span>{r[1]}</div>)}</div>
          <div className="mnote">{cambios ? <><b>Esta vista refleja tu base de trabajo.</b> Las columnas en verde no existian en la base original.</> : <><b>La base esta en su estado original.</b> Cuando ejecutes un ALTER o un UPDATE, los cambios se reflejan aqui.</>}</div>
        </div>
      </div>
    </div>
  );
}

function AtajosGlobales({ onModelo, onCerrar, onRun, onCheck, onFormat }: { onModelo: () => void; onCerrar: () => void; onRun: () => void; onCheck: () => void; onFormat: () => void }) {
  const ref = useRef({ onModelo, onCerrar, onRun, onCheck, onFormat });
  ref.current = { onModelo, onCerrar, onRun, onCheck, onFormat };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const f = ref.current;
      if ((e.ctrlKey || e.metaKey) && (e.key === "m" || e.key === "M")) { e.preventDefault(); f.onModelo(); return; }
      if (e.key === "Escape") { f.onCerrar(); return; }
      const enEditor = (e.target as HTMLElement)?.tagName === "TEXTAREA";
      if (enEditor) return; // el editor ya maneja sus atajos
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); f.onRun(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); f.onCheck(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "l" || e.key === "L")) { e.preventDefault(); f.onFormat(); }
    };
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h);
  }, []);
  return null;
}