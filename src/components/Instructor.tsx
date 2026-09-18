import { useMemo, useState } from "react";
import { REINOS, EJERCICIOS, porN, reinoDe, rangoDe } from "../game/mundo";
import { LECCIONES } from "../game/lecciones";

/* ============================================================
   PANEL DE INSTRUCTOR
   Lee los .json que exportan los alumnos (boton Respaldo) y arma
   la vista del grupo. No hay servidor: todo se procesa aqui.
   ============================================================ */

interface Alumno {
  nombre: string;
  xp: number;
  resueltos: number[];
  lecciones: string[];
  reinos: string[];
  intentos: Record<number, number>;
  pistas: Record<number, number>;
  soluciones: number[];
  fecha: string;
}

function leer(texto: string, archivo: string): Alumno | null {
  try {
    const d = JSON.parse(texto);
    const pr = d.progreso;
    if (!pr || typeof pr.xp !== "number") return null;
    return {
      nombre: d.personaje?.nombre || archivo.replace(/\.json$/i, ""),
      xp: pr.xp,
      resueltos: pr.resueltos || [],
      lecciones: pr.leccionesHechas || [],
      reinos: pr.reinosConquistados || [],
      intentos: pr.intentos || {},
      pistas: pr.pistasVistas || {},
      soluciones: pr.solucionesVistas || [],
      fecha: d.fecha || ""
    };
  } catch { return null; }
}

export function PanelInstructor({ onCerrar }: { onCerrar: () => void }) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [error, setError] = useState("");
  const [vista, setVista] = useState<"grupo" | "temas" | "atorones">("grupo");

  function cargar(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files || []);
    if (!fs.length) return;
    let malos = 0;
    const acc: Alumno[] = [];
    let pendientes = fs.length;
    fs.forEach((f) => {
      const r = new FileReader();
      r.onload = () => {
        const a = leer(String(r.result), f.name);
        if (a) acc.push(a); else malos++;
        if (--pendientes === 0) {
          setAlumnos(acc.sort((x, y) => y.xp - x.xp));
          setError(malos ? `${malos} archivo${malos > 1 ? "s" : ""} no se pudo leer.` : "");
        }
      };
      r.readAsText(f);
    });
  }

  const total = EJERCICIOS.length;

  /* --- por tema: cuantos del grupo resolvieron cada reino --- */
  const porReino = useMemo(() => REINOS.map((r) => {
    const conLeccion = alumnos.filter((a) => a.lecciones.includes(r.id)).length;
    const hechos = alumnos.length
      ? Math.round(alumnos.reduce((s, a) => s + r.niveles.filter((n) => a.resueltos.includes(n)).length / r.niveles.length, 0) / alumnos.length * 100)
      : 0;
    return { r, conLeccion, pct: hechos };
  }), [alumnos]);

  /* --- ejercicios que mas cuestan al grupo --- */
  const atorones = useMemo(() => {
    const filas = EJERCICIOS.map((e) => {
      const lo = alumnos.filter((a) => a.intentos[e.n]);
      const intentos = lo.reduce((s, a) => s + (a.intentos[e.n] || 0), 0);
      const resueltos = alumnos.filter((a) => a.resueltos.includes(e.n)).length;
      const pistas = alumnos.reduce((s, a) => s + (a.pistas[e.n] || 0), 0);
      const soluciones = alumnos.filter((a) => a.soluciones.includes(e.n)).length;
      const ratio = resueltos ? intentos / resueltos : intentos;
      return { e, intentos, resueltos, pistas, soluciones, ratio };
    }).filter((f) => f.intentos > 0);
    return filas.sort((a, b) => b.ratio - a.ratio).slice(0, 12);
  }, [alumnos]);

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="box" style={{ maxWidth: 940 }}>
        <div className="top">
          <h3>Panel del instructor</h3>
          {alumnos.length > 0 && <span className="pill">{alumnos.length} alumno{alumnos.length > 1 ? "s" : ""}</span>}
          <span className="sp" />
          <button className="btn gh peq" onClick={onCerrar}>Cerrar <kbd>Esc</kbd></button>
        </div>

        <div className="body">
          {alumnos.length === 0 ? (
            <div className="pi-vacio">
              <p>Pide a tus alumnos que entren al mapa, pulsen <b>Respaldo</b> y te manden el archivo
                <code>.json</code> que descarguen. Aqui puedes cargar todos de una vez.</p>
              <label className="btn go grande">
                Cargar archivos de alumnos
                <input type="file" accept="application/json,.json" multiple hidden onChange={cargar} />
              </label>
              <p className="nota-inline" style={{ display: "block", marginTop: 14 }}>
                Nada sale de tu equipo: los archivos se leen aqui mismo, en el navegador.
              </p>
            </div>
          ) : (
            <>
              <div className="pi-tabs">
                {([["grupo", "Grupo"], ["temas", "Por tema"], ["atorones", "Donde se atoran"]] as [typeof vista, string][]).map(([id, t]) => (
                  <button key={id} className={"tab-c " + (vista === id ? "on" : "")} onClick={() => setVista(id)}>{t}</button>
                ))}
                <span className="sp" />
                <label className="btn gh peq">
                  Cargar mas
                  <input type="file" accept="application/json,.json" multiple hidden onChange={cargar} />
                </label>
              </div>
              {error && <div className="msg err" style={{ marginBottom: 12 }}>{error}</div>}

              {vista === "grupo" && (
                <table className="pi-tabla">
                  <thead><tr><th>Alumno</th><th>Rango</th><th>XP</th><th>Desafios</th><th>Lecciones</th><th>Reinos</th><th>Ayuda pedida</th></tr></thead>
                  <tbody>
                    {alumnos.map((a) => {
                      const pct = Math.round(a.resueltos.length / total * 100);
                      const ayuda = Object.values(a.pistas).reduce((s: number, v) => s + (v as number), 0) + a.soluciones.length * 3;
                      return (
                        <tr key={a.nombre}>
                          <td className="pi-n">{a.nombre}</td>
                          <td className="pi-rango">{rangoDe(a.xp).titulo}</td>
                          <td className="num">{a.xp}</td>
                          <td>
                            <div className="pi-barra"><i style={{ width: pct + "%" }} /></div>
                            <span className="pi-min">{a.resueltos.length} / {total}</span>
                          </td>
                          <td className="num">{a.lecciones.length} / {LECCIONES.length}</td>
                          <td className="num">{a.reinos.length} / {REINOS.length}</td>
                          <td className={"num " + (ayuda > 25 ? "alto" : ayuda > 10 ? "medio" : "")}>{ayuda}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {vista === "temas" && (
                <div className="pi-temas">
                  {porReino.map(({ r, conLeccion, pct }) => (
                    <div key={r.id} className="pi-tema" style={{ ["--rc" as string]: r.color }}>
                      <span className="pi-ico">{r.icono}</span>
                      <div className="pi-tema-txt">
                        <span className="pi-tema-n">{r.nombre}</span>
                        <span className="pi-min">leccion leida por {conLeccion} de {alumnos.length}</span>
                      </div>
                      <div className="pi-barra ancha"><i style={{ width: pct + "%" }} /></div>
                      <span className="num">{pct}%</span>
                    </div>
                  ))}
                  <p className="mnote">El porcentaje es el avance promedio del grupo en los desafios de ese reino.</p>
                </div>
              )}

              {vista === "atorones" && (
                <>
                  <p className="ayuda-tab">Ordenado por intentos necesarios para resolverlo. Los de arriba son los que mas cuestan.</p>
                  <table className="pi-tabla">
                    <thead><tr><th>#</th><th>Desafio</th><th>Reino</th><th>Intentos</th><th>Lo resolvieron</th><th>Pistas</th><th>Vieron solucion</th></tr></thead>
                    <tbody>
                      {atorones.map((f) => (
                        <tr key={f.e.n} className={f.ratio >= 3 ? "duro" : ""}>
                          <td className="num">{f.e.n}</td>
                          <td className="pi-n">{porN(f.e.n).titulo}</td>
                          <td className="pi-min">{reinoDe(f.e.n).nombre}</td>
                          <td className="num">{f.intentos}</td>
                          <td className="num">{f.resueltos} / {alumnos.length}</td>
                          <td className="num">{f.pistas}</td>
                          <td className="num">{f.soluciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {atorones.length === 0 && <p className="pi-min">Todavia nadie ha intentado nada.</p>}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
