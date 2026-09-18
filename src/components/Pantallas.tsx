import { useState } from "react";
import { Avatar, Umbra } from "./Personajes";
import { acciones, useJuego, personajeDefault, PIELES, CABELLOS, COLORES_CABELLO, COLORES_OJOS, COLORES_ROPA, reinoDesbloqueado, nivelDesbloqueado, totalNiveles, type Personaje } from "../game/store";
import { REINOS, RANGOS, rangoDe, siguienteRango, porN, esJefe, UMBRA, frase } from "../game/mundo";

/* ---------- burbuja de dialogo ---------- */
export function Burbuja({ texto, quien = UMBRA.nombre, lado = "izq" }: { texto: string; quien?: string; lado?: "izq" | "der" }) {
  return (
    <div className={"burbuja " + lado}>
      <span className="quien">{quien}</span>
      <p>{texto}</p>
    </div>
  );
}

/* ============================================================
   INTRO
   ============================================================ */
export function Intro() {
  const [saludo] = useState(() => frase(UMBRA.saludos));
  return (
    <div className="pantalla intro">
      <div className="intro-grid">
        <div className="intro-texto">
          <p className="eyebrow">El Archivo de Umbra</p>
          <h1 className="titulo-epico">SQL<span>Quest</span></h1>
          <p className="lede">Un mundo dividido en nueve reinos. Cada uno guarda una parte del idioma con el que se habla a los datos. Un maestro encapuchado, un motor SQL de verdad corriendo en tu navegador, y ninguna forma de romper nada que no se pueda deshacer.</p>
          <ul className="lista-intro">
            <li><b>9 reinos</b>, de leer una tabla a funciones de ventana.</li>
            <li><b>48 desafios</b> con revision que te dice que fallo, no solo que fallo.</li>
            <li><b>XP y rangos</b>: las pistas cuestan, los aciertos pagan.</li>
          </ul>
          <button className="btn go grande" onClick={() => acciones.irA("creador")}>Crear mi personaje</button>
        </div>
        <div className="intro-maestro">
          <Umbra size={300} humor="burlon" />
          <Burbuja texto={saludo} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CREADOR DE PERSONAJE
   ============================================================ */
export function Creador() {
  const j = useJuego();
  const [p, setP] = useState<Personaje>(j.personaje || personajeDefault());
  const [err, setErr] = useState("");
  const up = (k: keyof Personaje, v: Personaje[keyof Personaje]) => setP((prev) => ({ ...prev, [k]: v } as Personaje));

  function listo() {
    if (!p.nombre.trim()) { setErr("Un nombre. Hasta las tablas tienen uno."); return; }
    acciones.crearPersonaje({ ...p, nombre: p.nombre.trim() });
  }

  return (
    <div className="pantalla creador">
      <div className="creador-grid">
        <div className="creador-preview">
          <div className="pedestal"><Avatar p={p} size={260} /></div>
          <div className="nombre-preview">{p.nombre || "Sin nombre"}</div>
          <div className="rango-preview">{RANGOS[0].titulo}</div>
        </div>
        <div className="creador-form">
          <p className="eyebrow">Tu aprendiz</p>
          <h2>Forja a quien va a hablar con las tablas</h2>

          <label className="campo">
            <span>Nombre</span>
            <input value={p.nombre} maxLength={18} placeholder="Como te llama la base de datos" onChange={(e) => { up("nombre", e.target.value); setErr(""); }} />
          </label>

          <Opcion titulo="Silueta">
            <button className={"chip-op " + (p.silueta === "a" ? "on" : "")} onClick={() => up("silueta", "a")}>Ancha</button>
            <button className={"chip-op " + (p.silueta === "b" ? "on" : "")} onClick={() => up("silueta", "b")}>Estilizada</button>
          </Opcion>
          <Opcion titulo="Piel">{PIELES.map((c) => <Swatch key={c} c={c} on={p.piel === c} onClick={() => up("piel", c)} />)}</Opcion>
          <Opcion titulo="Cabello">{CABELLOS.map((c) => <button key={c} className={"chip-op " + (p.cabello === c ? "on" : "")} onClick={() => up("cabello", c)}>{c}</button>)}</Opcion>
          <Opcion titulo="Color de cabello">{COLORES_CABELLO.map((c) => <Swatch key={c} c={c} on={p.colorCabello === c} onClick={() => up("colorCabello", c)} />)}</Opcion>
          <Opcion titulo="Ojos">{COLORES_OJOS.map((c) => <Swatch key={c} c={c} on={p.ojos === c} onClick={() => up("ojos", c)} />)}</Opcion>
          <Opcion titulo="Tunica">{COLORES_ROPA.map((c) => <Swatch key={c} c={c} on={p.ropa === c} onClick={() => up("ropa", c)} />)}</Opcion>
          <Opcion titulo="Capa y cinturon">{COLORES_ROPA.map((c) => <Swatch key={"d" + c} c={c} on={p.detalle === c} onClick={() => up("detalle", c)} />)}</Opcion>
          <Opcion titulo="Detalle">
            {(["ninguno", "capucha", "lentes", "diadema", "cicatriz"] as const).map((a) => (
              <button key={a} className={"chip-op " + (p.accesorio === a ? "on" : "")} onClick={() => up("accesorio", a)}>{a}</button>
            ))}
          </Opcion>

          {err && <p className="error-inline">{err}</p>}
          <div className="acciones-creador">
            <button className="btn go grande" onClick={listo}>{j.personaje ? "Guardar cambios" : "Entrar al Archivo"}</button>
            {j.personaje && <button className="btn gh" onClick={() => acciones.irA("mapa")}>Cancelar</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Opcion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return <div className="opcion"><span className="op-titulo">{titulo}</span><div className="op-items">{children}</div></div>;
}
function Swatch({ c, on, onClick }: { c: string; on: boolean; onClick: () => void }) {
  return <button className={"swatch " + (on ? "on" : "")} style={{ background: c }} onClick={onClick} aria-label={c} />;
}

/* ============================================================
   MAPA DEL MUNDO
   ============================================================ */
export function Mapa() {
  const j = useJuego();
  const p = j.progreso;
  const rango = rangoDe(p.xp), sig = siguienteRango(p.xp);
  const pct = sig ? Math.round(((p.xp - rango.min) / (sig.min - rango.min)) * 100) : 100;
  const [abierto, setAbierto] = useState<string | null>(REINOS.find((r) => reinoDesbloqueado(r.id, p) && !p.reinosConquistados.includes(r.id))?.id || REINOS[0].id);
  const reino = REINOS.find((r) => r.id === abierto)!;
  const desbl = reinoDesbloqueado(reino.id, p);

  return (
    <div className="pantalla mapa">
      <header className="hud">
        <div className="hud-avatar" onClick={() => acciones.editarPersonaje()} title="Editar personaje">
          {j.personaje && <Avatar p={j.personaje} size={64} animado={false} />}
        </div>
        <div className="hud-datos">
          <div className="hud-nombre">{j.personaje?.nombre}</div>
          <div className="hud-rango">{rango.titulo}</div>
          <div className="xpbar" title={sig ? `${p.xp} / ${sig.min} XP para ${sig.titulo}` : "Rango maximo"}>
            <i style={{ width: pct + "%" }} />
          </div>
        </div>
        <div className="hud-stats">
          <span><b>{p.xp}</b> XP</span>
          <span><b>{p.resueltos.length}</b> / {totalNiveles()} desafios</span>
          <span><b>{p.reinosConquistados.length}</b> / {REINOS.length} reinos</span>
        </div>
        <button className="btn gh peq" onClick={() => { if (confirm("Se borra todo el progreso y el personaje. Seguro?")) acciones.reiniciarTodo(); }}>Reiniciar</button>
      </header>

      <div className="mapa-grid">
        <nav className="reinos">
          {REINOS.map((r, i) => {
            const ok = reinoDesbloqueado(r.id, p);
            const conq = p.reinosConquistados.includes(r.id);
            const hechos = r.niveles.filter((n) => p.resueltos.includes(n)).length;
            return (
              <button key={r.id} className={"reino " + (abierto === r.id ? "cur " : "") + (conq ? "conq " : "") + (ok ? "" : "lock")}
                style={{ ["--rc" as string]: r.color }} onClick={() => setAbierto(r.id)}>
                <span className="reino-ico">{ok ? r.icono : "🔒"}</span>
                <span className="reino-txt">
                  <span className="reino-n">{i + 1}. {r.nombre}</span>
                  <span className="reino-p">{conq ? "conquistado" : ok ? `${hechos} / ${r.niveles.length}` : "sellado"}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <section className="reino-detalle" style={{ ["--rc" as string]: reino.color }}>
          <div className="reino-cab">
            <span className="reino-ico grande">{reino.icono}</span>
            <div>
              <p className="eyebrow">{desbl ? (p.reinosConquistados.includes(reino.id) ? "Reino conquistado" : "Reino abierto") : "Reino sellado"}</p>
              <h2>{reino.nombre}</h2>
              <p className="lema">"{reino.lema}"</p>
            </div>
          </div>
          <p className="reino-desc">{reino.descripcion}</p>

          <div className="dialogo-mapa">
            <Umbra size={130} humor={desbl ? "burlon" : "serio"} />
            <Burbuja texto={desbl ? (p.reinosConquistados.includes(reino.id) ? reino.victoria : reino.intro) : "Este reino esta sellado. Derrota al jefe del reino anterior y la puerta se abre sola. Es magia, o burocracia; nunca supe cual."} />
          </div>

          <div className="niveles">
            {reino.niveles.map((n, i) => {
              const e = porN(n), hecho = p.resueltos.includes(n), abiertoN = nivelDesbloqueado(n, p), jefe = esJefe(n);
              return (
                <button key={n} className={"nivelbtn " + (hecho ? "hecho " : "") + (jefe ? "jefe " : "") + (abiertoN ? "" : "lock")} disabled={!abiertoN} onClick={() => acciones.abrirNivel(n)}>
                  <span className="nivel-num">{jefe ? "☠" : hecho ? "✓" : i + 1}</span>
                  <span className="nivel-txt">
                    <span className="nivel-t">{e.titulo}</span>
                    <span className="nivel-b">{e.bloque} · {jefe ? reino.xpJefe : reino.xpNivel} XP</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
