import { useSyncExternalStore } from "react";
import { REINOS, esJefe, reinoDe, porN, COSTO_PISTA, COSTO_SOLUCION } from "./mundo";

/* ---------- personaje ---------- */
export type Silueta = "a" | "b";   // a: complexion ancha, b: complexion estilizada
export interface Personaje {
  nombre: string;
  silueta: Silueta;
  piel: string;
  cabello: string;   // estilo
  colorCabello: string;
  ojos: string;
  ropa: string;
  detalle: string;   // color secundario / capa
  accesorio: "ninguno" | "capucha" | "lentes" | "diadema" | "cicatriz";
}

export const PIELES = ["#F6D7C3", "#E8B896", "#C8895E", "#9C6240", "#6B3F2A"];
export const CABELLOS = ["corto", "largo", "chongo", "rapado", "trenzas", "mohawk"] as const;
export const COLORES_CABELLO = ["#1B1220", "#4A2C1A", "#8B5A2B", "#D9A441", "#E8E3D6", "#8B5CF6", "#2DD4A7", "#FF3B5C"];
export const COLORES_OJOS = ["#3B2A1E", "#2F6F9E", "#3F8F5A", "#8B5CF6", "#FF3B5C", "#FFB05C"];
export const COLORES_ROPA = ["#8B5CF6", "#2457C5", "#148F62", "#B3520B", "#D9483B", "#1B1220", "#E0338A", "#6A5786"];

export const personajeDefault = (): Personaje => ({
  nombre: "", silueta: "b", piel: PIELES[1], cabello: "corto", colorCabello: COLORES_CABELLO[0],
  ojos: COLORES_OJOS[0], ropa: COLORES_ROPA[0], detalle: COLORES_ROPA[3], accesorio: "ninguno"
});

/* ---------- progreso ---------- */
export interface Progreso {
  xp: number;
  resueltos: number[];               // n de ejercicios resueltos
  pistasVistas: number[];
  solucionesVistas: number[];
  intentos: Record<number, number>;
  sqlGuardado: Record<number, string>;
  reinosConquistados: string[];
}

export interface Estado {
  pantalla: "intro" | "creador" | "mapa" | "nivel";
  personaje: Personaje | null;
  progreso: Progreso;
  nivelActual: number | null;
  reinoActual: string | null;
}

const CLAVE = "sql_quest_v1";

const progresoInicial = (): Progreso => ({
  xp: 0, resueltos: [], pistasVistas: [], solucionesVistas: [], intentos: {}, sqlGuardado: {}, reinosConquistados: []
});

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
      const d = JSON.parse(raw) as Estado;
      if (d && d.progreso) return { ...d, pantalla: d.personaje ? "mapa" : "intro", nivelActual: null };
    }
  } catch { /* sin almacenamiento: se juega sin guardar */ }
  return { pantalla: "intro", personaje: null, progreso: progresoInicial(), nivelActual: null, reinoActual: null };
}

let estado: Estado = cargar();
const oyentes = new Set<() => void>();

function emitir() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* ignorar */ }
  oyentes.forEach((f) => f());
}
function set(parcial: Partial<Estado>) { estado = { ...estado, ...parcial }; emitir(); }
function setProgreso(parcial: Partial<Progreso>) { set({ progreso: { ...estado.progreso, ...parcial } }); }

export function useJuego() {
  return useSyncExternalStore((cb) => { oyentes.add(cb); return () => oyentes.delete(cb); }, () => estado);
}

/* ---------- acciones ---------- */
export const acciones = {
  irA(pantalla: Estado["pantalla"]) { set({ pantalla }); },
  crearPersonaje(p: Personaje) { set({ personaje: p, pantalla: "mapa" }); },
  editarPersonaje() { set({ pantalla: "creador" }); },
  abrirNivel(n: number) { set({ nivelActual: n, reinoActual: reinoDe(n).id, pantalla: "nivel" }); },
  volverAlMapa() { set({ pantalla: "mapa", nivelActual: null }); },
  guardarSql(n: number, sql: string) {
    const sqlGuardado = { ...estado.progreso.sqlGuardado, [n]: sql };
    estado = { ...estado, progreso: { ...estado.progreso, sqlGuardado } };
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* ignorar */ }
  },
  intento(n: number) {
    const intentos = { ...estado.progreso.intentos, [n]: (estado.progreso.intentos[n] || 0) + 1 };
    setProgreso({ intentos });
  },
  /* devuelve el XP ganado (0 si ya estaba resuelto) y si se conquisto el reino */
  resolver(n: number): { xp: number; reinoConquistado: string | null; primeraVez: boolean } {
    const p = estado.progreso;
    if (p.resueltos.includes(n)) return { xp: 0, reinoConquistado: null, primeraVez: false };
    const r = reinoDe(n);
    let xp = esJefe(n) ? r.xpJefe : r.xpNivel;
    if (p.solucionesVistas.includes(n)) xp = Math.round(xp * 0.4);
    else if (p.pistasVistas.includes(n)) xp = Math.round(xp * 0.8);
    if ((p.intentos[n] || 0) <= 1) xp += 10;   // bonus por primer intento
    const resueltos = [...p.resueltos, n];
    const conquistado = r.niveles.every((x) => resueltos.includes(x)) && !p.reinosConquistados.includes(r.id) ? r.id : null;
    setProgreso({
      xp: p.xp + xp, resueltos,
      reinosConquistados: conquistado ? [...p.reinosConquistados, conquistado] : p.reinosConquistados
    });
    return { xp, reinoConquistado: conquistado, primeraVez: true };
  },
  pedirPista(n: number): boolean {
    const p = estado.progreso;
    if (p.pistasVistas.includes(n) || p.resueltos.includes(n)) return true;
    if (p.xp < COSTO_PISTA) return false;
    setProgreso({ xp: p.xp - COSTO_PISTA, pistasVistas: [...p.pistasVistas, n] });
    return true;
  },
  pedirSolucion(n: number): boolean {
    const p = estado.progreso;
    if (p.solucionesVistas.includes(n) || p.resueltos.includes(n)) return true;
    if (p.xp < COSTO_SOLUCION) return false;
    setProgreso({ xp: p.xp - COSTO_SOLUCION, solucionesVistas: [...p.solucionesVistas, n] });
    return true;
  },
  reiniciarTodo() {
    estado = { pantalla: "intro", personaje: null, progreso: progresoInicial(), nivelActual: null, reinoActual: null };
    try { localStorage.removeItem(CLAVE); } catch { /* ignorar */ }
    oyentes.forEach((f) => f());
  }
};

/* ---------- consultas de estado ---------- */
export function reinoDesbloqueado(id: string, p: Progreso): boolean {
  const i = REINOS.findIndex((r) => r.id === id);
  if (i === 0) return true;
  const anterior = REINOS[i - 1];
  // el reino se abre cuando el jefe del anterior cayo
  const jefe = anterior.niveles[anterior.niveles.length - 1];
  return p.resueltos.includes(jefe);
}
export function nivelDesbloqueado(n: number, p: Progreso): boolean {
  const r = reinoDe(n);
  if (!reinoDesbloqueado(r.id, p)) return false;
  const i = r.niveles.indexOf(n);
  if (i === 0) return true;
  // dentro del reino, se avanza en orden; el jefe exige todos los anteriores
  if (esJefe(n)) return r.niveles.slice(0, -1).every((x) => p.resueltos.includes(x));
  return p.resueltos.includes(r.niveles[i - 1]);
}
export const totalNiveles = () => REINOS.reduce((a, r) => a + r.niveles.length, 0);
export { porN };
