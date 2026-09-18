import { useSyncExternalStore } from "react";
import { REINOS, esJefe, reinoDe, porN, COSTO_PISTA, COSTO_SOLUCION } from "./mundo";
import { LECCIONES } from "./lecciones";
const LECCIONES_XP: Record<string, number> = Object.fromEntries(LECCIONES.map((l) => [l.reino, l.xp]));

/* ---------- personaje ---------- */
export type Silueta = "a" | "b";                       // a: ancha, b: estilizada
export type Atuendo = "asesino" | "sombra" | "explorador" | "erudito" | "guardia" | "arcano" | "tunica";
export type Capucha = "abajo" | "arriba";

export interface Personaje {
  nombre: string;
  silueta: Silueta;
  piel: string;
  cabello: string;
  colorCabello: string;
  ojos: string;
  /* atuendo */
  atuendo: Atuendo;
  ropa: string;        // color principal de la prenda
  detalle: string;     // fajin, correas, forro
  capa: string;        // color de la capa (o "ninguna")
  capucha: Capucha;
  hombrera: boolean;
  brazaletes: boolean;
  /* rostro */
  accesorio: "ninguno" | "lentes" | "diadema" | "cicatriz" | "antifaz";
  vello: "ninguno" | "barba" | "candado" | "bigote";
}

export const PIELES = ["#F6D7C3", "#E8B896", "#C8895E", "#9C6240", "#6B3F2A", "#4A2B1C"];
export const CABELLOS = ["corto", "largo", "chongo", "rapado", "trenzas", "mohawk", "ondulado"] as const;
export const COLORES_CABELLO = ["#1B1220", "#4A2C1A", "#8B5A2B", "#D9A441", "#E8E3D6", "#8B5CF6", "#2DD4A7", "#FF3B5C"];
export const COLORES_OJOS = ["#3B2A1E", "#2F6F9E", "#3F8F5A", "#8B5CF6", "#FF3B5C", "#FFB05C", "#9AA7B4"];
export const COLORES_ROPA = ["#E8E3D6", "#8B5CF6", "#2457C5", "#148F62", "#B3520B", "#D9483B", "#1B1220", "#E0338A", "#5A6472"];
export const COLORES_CAPA = ["ninguna", "#7A1F2B", "#1B3A5C", "#2A4A2E", "#4A2C5E", "#1B1220", "#8B6B2B"];

export const ATUENDOS: { id: Atuendo; nombre: string; nota: string }[] = [
  { id: "asesino", nombre: "Asesino", nota: "Tunica cruzada, fajin con hebilla, correas al pecho y hoja oculta en el antebrazo." },
  { id: "sombra", nombre: "Sombra", nota: "Version nocturna: peto acolchado, doble correa en X, bufanda y dagas al cinto." },
  { id: "explorador", nombre: "Explorador", nota: "Chaqueta con solapas, doble cinturon, cantimplora y bolsas de campo." },
  { id: "erudito", nombre: "Erudito", nota: "Toga larga con estola bordada, cuello alto y medallon del Archivo." },
  { id: "arcano", nombre: "Arcano", nota: "Tunica con runas, cinturon de sellos y orbe suspendido al costado." },
  { id: "guardia", nombre: "Guardia", nota: "Peto con remaches, hombreras de placa y faldon segmentado." },
  { id: "tunica", nombre: "Tunica", nota: "La del aprendiz. Simple, y a veces eso basta." }
];

export const personajeDefault = (): Personaje => ({
  nombre: "", silueta: "b", piel: PIELES[1], cabello: "corto", colorCabello: COLORES_CABELLO[0],
  ojos: COLORES_OJOS[0], atuendo: "asesino", ropa: COLORES_ROPA[0], detalle: COLORES_ROPA[4],
  capa: COLORES_CAPA[1], capucha: "arriba", hombrera: true, brazaletes: true,
  accesorio: "ninguno", vello: "ninguno"
});

/* rellena los campos que falten en personajes guardados con versiones anteriores */
export function normalizar(p: Partial<Personaje> | null): Personaje | null {
  if (!p) return null;
  const d = personajeDefault();
  return { ...d, ...p, nombre: p.nombre ?? "" } as Personaje;
}

/* ---------- progreso ---------- */
export interface Progreso {
  xp: number;
  resueltos: number[];               // n de ejercicios resueltos
  pistasVistas: Record<number, number>;   // ejercicio -> cuantas pistas se abrieron (0..3)
  solucionesVistas: number[];
  intentos: Record<number, number>;
  sqlGuardado: Record<number, string>;
  reinosConquistados: string[];
  leccionesHechas: string[];          // reinos cuya leccion ya se leyo
}

export interface Estado {
  pantalla: "intro" | "creador" | "mapa" | "nivel" | "leccion";
  personaje: Personaje | null;
  progreso: Progreso;
  nivelActual: number | null;
  reinoActual: string | null;
}

const CLAVE = "sql_quest_v1";

const progresoInicial = (): Progreso => ({
  xp: 0, resueltos: [], pistasVistas: {}, solucionesVistas: [], intentos: {}, sqlGuardado: {}, reinosConquistados: [], leccionesHechas: []
});

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
      const d = JSON.parse(raw) as Estado;
      if (d && d.progreso) return { ...d, progreso: { ...progresoInicial(), ...d.progreso }, personaje: normalizar(d.personaje), pantalla: d.personaje ? "mapa" : "intro", nivelActual: null };
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
  abrirLeccion(reino: string) { set({ reinoActual: reino, pantalla: "leccion" }); },
  completarLeccion(reino: string): number {
    const p = estado.progreso;
    if (p.leccionesHechas.includes(reino)) return 0;
    const l = LECCIONES_XP[reino] || 60;
    setProgreso({ xp: p.xp + l, leccionesHechas: [...p.leccionesHechas, reino] });
    return l;
  },
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
    const usadas = p.pistasVistas[n] || 0;
    if (p.solucionesVistas.includes(n)) xp = Math.round(xp * 0.35);
    else if (usadas) xp = Math.round(xp * [1, 0.85, 0.7, 0.55][Math.min(usadas, 3)]);
    if ((p.intentos[n] || 0) <= 1) xp += 10;   // bonus por primer intento
    const resueltos = [...p.resueltos, n];
    const conquistado = r.niveles.every((x) => resueltos.includes(x)) && !p.reinosConquistados.includes(r.id) ? r.id : null;
    setProgreso({
      xp: p.xp + xp, resueltos,
      reinosConquistados: conquistado ? [...p.reinosConquistados, conquistado] : p.reinosConquistados
    });
    return { xp, reinoConquistado: conquistado, primeraVez: true };
  },
  /* abre la siguiente pista del ejercicio. Devuelve el indice abierto, o -1 si no alcanza el XP */
  pedirPista(n: number): number {
    const p = estado.progreso;
    const usadas = p.pistasVistas[n] || 0;
    if (p.resueltos.includes(n)) return 3;
    if (usadas >= 3) return 3;
    const costo = COSTO_PISTA[usadas];
    if (p.xp < costo) return -1;
    setProgreso({ xp: p.xp - costo, pistasVistas: { ...p.pistasVistas, [n]: usadas + 1 } });
    return usadas + 1;
  },
  pedirSolucion(n: number): boolean {
    const p = estado.progreso;
    if (p.solucionesVistas.includes(n) || p.resueltos.includes(n)) return true;
    if (p.xp < COSTO_SOLUCION) return false;
    setProgreso({ xp: p.xp - COSTO_SOLUCION, solucionesVistas: [...p.solucionesVistas, n] });
    return true;
  },
  pistasUsadas(n: number) { return estado.progreso.pistasVistas[n] || 0; },
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
  if (!p.leccionesHechas.includes(r.id)) return false;   // primero la leccion
  const i = r.niveles.indexOf(n);
  if (i === 0) return true;
  // dentro del reino, se avanza en orden; el jefe exige todos los anteriores
  if (esJefe(n)) return r.niveles.slice(0, -1).every((x) => p.resueltos.includes(x));
  return p.resueltos.includes(r.niveles[i - 1]);
}
export const totalNiveles = () => REINOS.reduce((a, r) => a + r.niveles.length, 0);
export { porN };