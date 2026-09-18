import { useSyncExternalStore } from "react";
import { REINOS, esJefe, reinoDe, porN, COSTO_PISTA, COSTO_SOLUCION } from "./mundo";
import { LECCIONES } from "./lecciones";
const LECCIONES_XP: Record<string, number> = Object.fromEntries(LECCIONES.map((l) => [l.reino, l.xp]));

/* ---------- personaje ---------- */
export type Sexo = "f" | "m" | "x";                     // femenino, masculino, andromorfo
export type Complexion = "esbelta" | "media" | "ancha";
export type Atuendo =
  | "asesino" | "sombra" | "explorador" | "erudito" | "arcano" | "guardia" | "tunica"
  | "parca" | "diablo" | "placas" | "real" | "nomada"
  | "sigilo" | "espectro" | "ornamental" | "susanoo";
export type Cabeza =
  | "ninguna" | "capucha" | "capuchaPico" | "yelmo" | "celada" | "corona" | "diadema"
  | "sombrero" | "turbante" | "cuernos" | "calavera"
  | "capuchaSigilo" | "yelmoEspectro" | "tocadoOrnamental" | "coronaSusanoo";
export type Rostro = "ninguno" | "lentes" | "monoculo" | "antifaz" | "mascaraMedia" | "respirador" | "velo";

export interface Personaje {
  nombre: string;
  sexo: Sexo;
  complexion: Complexion;
  altura: number;            // 0.92 a 1.08
  piel: string;
  cabello: string;
  colorCabello: string;
  ojos: string;
  vello: "ninguno" | "barba" | "candado" | "bigote" | "perilla";
  atuendo: Atuendo;
  cabeza: Cabeza;
  rostro: Rostro;
  ropa: string;
  detalle: string;
  capa: string;
  hombrera: boolean;
  brazaletes: boolean;
}

export const PIELES = ["#F6D7C3", "#E8B896", "#D1A07A", "#C8895E", "#9C6240", "#6B3F2A", "#4A2B1C", "#8FA8B8"];
export const CABELLOS = ["corto", "largo", "chongo", "rapado", "trenzas", "mohawk", "ondulado", "coleta", "afro"] as const;
export const COLORES_CABELLO = ["#1B1220", "#3A2418", "#6B4423", "#A9763C", "#D9A441", "#E8E3D6", "#9AA7B4", "#8B5CF6", "#2DD4A7", "#FF3B5C", "#E0338A"];
export const COLORES_OJOS = ["#3B2A1E", "#5C4033", "#2F6F9E", "#3F8F5A", "#8B5CF6", "#FF3B5C", "#FFB05C", "#9AA7B4", "#C9A6F5"];
export const COLORES_ROPA = ["#E8E3D6", "#C9C3B6", "#8B5CF6", "#5B3FA8", "#2457C5", "#1B3A5C", "#148F62", "#2A4A2E", "#B3520B", "#7A1F2B", "#D9483B", "#1B1220", "#3A3140", "#E0338A", "#5A6472", "#D9A441"];
export const COLORES_CAPA = ["ninguna", "#7A1F2B", "#1B3A5C", "#2A4A2E", "#4A2C5E", "#1B1220", "#8B6B2B", "#5A1030", "#3A3140"];

export const SEXOS: { id: Sexo; nombre: string }[] = [
  { id: "f", nombre: "Femenino" }, { id: "m", nombre: "Masculino" }, { id: "x", nombre: "Andromorfo" }
];

export const ATUENDOS: { id: Atuendo; nombre: string; nota: string }[] = [
  { id: "sigilo",     nombre: "Sigilo",     nota: "Traje ajustado gris oscuro, mascara que cubre media cara y arnes de correas." },
  { id: "espectro",   nombre: "Espectro",   nota: "Armadura blindada con cuernos, placas en espiral y ojos encendidos." },
  { id: "ornamental", nombre: "Ornamental", nota: "Peto grabado, hombreras de placa y plumas en el tocado." },
  { id: "susanoo",    nombre: "Susanoo",    nota: "Aura espectral, bruma negra y una silueta de guerrero que te envuelve." },
  { id: "asesino",    nombre: "Asesino",    nota: "Tunica cruzada, fajin con hebilla y hoja oculta en el antebrazo." },
  { id: "sombra",     nombre: "Sombra",     nota: "Peto acolchado, correas en X, bufanda y dagas al cinto." },
  { id: "parca",      nombre: "Parca",      nota: "Sudario deshilachado y costillas grabadas. El uniforme de Umbra." },
  { id: "diablo",     nombre: "Infernal",   nota: "Placas al rojo vivo, grietas de brasa y cinturon de fuego." },
  { id: "explorador", nombre: "Explorador", nota: "Chaqueta con solapas, doble cinturon, cantimplora y bolsas." },
  { id: "nomada",     nombre: "Nomada",     nota: "Capas de tela ligera, fajin cruzado y cuerda al hombro." },
  { id: "erudito",    nombre: "Erudito",    nota: "Toga larga con estola bordada y medallon del Archivo." },
  { id: "arcano",     nombre: "Arcano",     nota: "Tunica con runas, cinturon de sellos y orbe suspendido." },
  { id: "guardia",    nombre: "Guardia",    nota: "Peto remachado y faldon segmentado." },
  { id: "placas",     nombre: "Coraza",     nota: "Armadura pesada de placas con gola y escarcelas." },
  { id: "real",       nombre: "Heraldo",    nota: "Jubon con galones dorados, banda y broche real." },
  { id: "tunica",     nombre: "Tunica",     nota: "La del aprendiz. Simple, y a veces eso basta." }
];

export const CABEZAS: { id: Cabeza; nombre: string }[] = [
  { id: "ninguna", nombre: "Nada" }, { id: "capucha", nombre: "Capucha" }, { id: "capuchaPico", nombre: "Capucha en pico" },
  { id: "yelmo", nombre: "Yelmo" }, { id: "celada", nombre: "Celada" }, { id: "corona", nombre: "Corona" },
  { id: "diadema", nombre: "Diadema" }, { id: "sombrero", nombre: "Sombrero" }, { id: "turbante", nombre: "Turbante" },
  { id: "cuernos", nombre: "Cuernos" }, { id: "calavera", nombre: "Calavera" },
  { id: "capuchaSigilo", nombre: "Capucha de sigilo" }, { id: "yelmoEspectro", nombre: "Yelmo espectral" },
  { id: "tocadoOrnamental", nombre: "Tocado de plumas" }, { id: "coronaSusanoo", nombre: "Corona espectral" }
];

export const ROSTROS: { id: Rostro; nombre: string }[] = [
  { id: "ninguno", nombre: "Nada" }, { id: "lentes", nombre: "Anteojos" }, { id: "monoculo", nombre: "Monoculo" },
  { id: "antifaz", nombre: "Antifaz" }, { id: "mascaraMedia", nombre: "Media mascara" },
  { id: "respirador", nombre: "Respirador" }, { id: "velo", nombre: "Velo" }
];

/* conjuntos armados, al estilo de los trajes de Tears of the Kingdom */
export interface Conjunto { id: string; nombre: string; nota: string; p: Partial<Personaje> }
export const CONJUNTOS: Conjunto[] = [
  { id: "credo", nombre: "Credo del Umbral", nota: "Sigilo puro: blanco hueso, capucha en pico y hoja oculta.",
    p: { atuendo: "asesino", cabeza: "capuchaPico", rostro: "ninguno", ropa: "#E8E3D6", detalle: "#7A1F2B", capa: "#7A1F2B", hombrera: true, brazaletes: true } },
  { id: "nocturno", nombre: "Manto Nocturno", nota: "Para moverse sin que las tablas se enteren.",
    p: { atuendo: "sombra", cabeza: "capucha", rostro: "mascaraMedia", ropa: "#1B1220", detalle: "#E0338A", capa: "#1B1220", hombrera: false, brazaletes: true } },
  { id: "segador", nombre: "Segador de Datos", nota: "El uniforme de Umbra. Nadie te va a pedir explicaciones.",
    p: { atuendo: "parca", cabeza: "capuchaPico", rostro: "velo", ropa: "#120B1C", detalle: "#3A3140", capa: "#1B1220", hombrera: false, brazaletes: false } },
  { id: "brasa", nombre: "Forja Infernal", nota: "Placas al rojo. Discreto no es.",
    p: { atuendo: "diablo", cabeza: "cuernos", rostro: "ninguno", ropa: "#3A1410", detalle: "#D9483B", capa: "#5A1030", hombrera: true, brazaletes: true } },
  { id: "archivista", nombre: "Togado del Archivo", nota: "Para quien prefiere que lo tomen en serio.",
    p: { atuendo: "erudito", cabeza: "ninguna", rostro: "lentes", ropa: "#2457C5", detalle: "#D9A441", capa: "ninguna", hombrera: false, brazaletes: false } },
  { id: "runas", nombre: "Circulo Arcano", nota: "Runas, sellos y un orbe que nadie sabe para que sirve.",
    p: { atuendo: "arcano", cabeza: "capucha", rostro: "ninguno", ropa: "#4A2C5E", detalle: "#D9A441", capa: "#4A2C5E", hombrera: false, brazaletes: true } },
  { id: "muralla", nombre: "Muralla de Hierro", nota: "Coraza completa. Lento, pero nada te toca.",
    p: { atuendo: "placas", cabeza: "celada", rostro: "ninguno", ropa: "#5A6472", detalle: "#D9A441", capa: "#1B3A5C", hombrera: true, brazaletes: true } },
  { id: "camino", nombre: "Polvo del Camino", nota: "Cantimplora, bolsas y tierra en las botas.",
    p: { atuendo: "explorador", cabeza: "sombrero", rostro: "ninguno", ropa: "#B3520B", detalle: "#3A2418", capa: "ninguna", hombrera: false, brazaletes: true } },
  { id: "duna", nombre: "Hijo de la Duna", nota: "Tela ligera y velo contra la arena.",
    p: { atuendo: "nomada", cabeza: "turbante", rostro: "velo", ropa: "#C9C3B6", detalle: "#8B6B2B", capa: "#8B6B2B", hombrera: false, brazaletes: true } },
  { id: "nocturnoSigilo", nombre: "Sombra Nocturna", nota: "Traje ajustado y media mascara. Nadie te ve venir.",
    p: { atuendo: "sigilo", cabeza: "capuchaSigilo", rostro: "mascaraMedia", ropa: "#3A3140", detalle: "#1B1220", capa: "ninguna", hombrera: false, brazaletes: true } },
  { id: "espectral", nombre: "Blindaje Espectral", nota: "Cuernos, espirales y dos brasas donde deberia haber ojos.",
    p: { atuendo: "espectro", cabeza: "yelmoEspectro", rostro: "ninguno", ropa: "#4A2C5E", detalle: "#9B7FBF", capa: "#2A1A3E", hombrera: true, brazaletes: true } },
  { id: "ceremonial", nombre: "Guardia Ceremonial", nota: "Peto grabado, plumas y oro. Para cuando hay que impresionar.",
    p: { atuendo: "ornamental", cabeza: "tocadoOrnamental", rostro: "ninguno", ropa: "#C9C3B6", detalle: "#D9A441", capa: "#1B3A5C", hombrera: true, brazaletes: true } },
  { id: "susanooSet", nombre: "Manifestacion", nota: "El aura se vuelve visible. La bruma te sigue a donde vayas.",
    p: { atuendo: "susanoo", cabeza: "coronaSusanoo", rostro: "ninguno", ropa: "#1B1028", detalle: "#8B5CF6", capa: "ninguna", hombrera: true, brazaletes: true } },
  { id: "corte", nombre: "Heraldo de la Corte", nota: "Galones dorados y corona. Por si hay que dar ordenes.",
    p: { atuendo: "real", cabeza: "corona", rostro: "ninguno", ropa: "#5B3FA8", detalle: "#D9A441", capa: "#5A1030", hombrera: true, brazaletes: false } }
];

export const personajeDefault = (): Personaje => ({
  nombre: "", sexo: "x", complexion: "media", altura: 1,
  piel: PIELES[1], cabello: "corto", colorCabello: COLORES_CABELLO[0], ojos: COLORES_OJOS[0], vello: "ninguno",
  atuendo: "asesino", cabeza: "capuchaPico", rostro: "ninguno",
  ropa: COLORES_ROPA[0], detalle: COLORES_ROPA[9], capa: COLORES_CAPA[1],
  hombrera: true, brazaletes: true
});

/* rellena lo que falte en personajes guardados con versiones anteriores */
export function normalizar(p: (Partial<Personaje> & { silueta?: string; accesorio?: string; capucha?: string }) | null): Personaje | null {
  if (!p) return null;
  const d = personajeDefault();
  const o = { ...d, ...p } as Personaje;
  if (p.silueta) o.complexion = p.silueta === "a" ? "ancha" : "esbelta";
  if (p.capucha === "arriba" && !p.cabeza) o.cabeza = "capuchaPico";
  if (p.capucha === "abajo" && !p.cabeza) o.cabeza = "ninguna";
  if (p.accesorio && !p.rostro) {
    o.rostro = p.accesorio === "lentes" ? "lentes" : p.accesorio === "antifaz" ? "antifaz" : "ninguno";
    if (p.accesorio === "diadema") o.cabeza = "diadema";
  }
  o.nombre = p.nombre ?? "";
  return o;
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

let guardadoEn = 0;
const oyentesGuardado = new Set<(t: number) => void>();
export function onGuardado(f: (t: number) => void) { oyentesGuardado.add(f); return () => oyentesGuardado.delete(f); }
export function ultimoGuardado() { return guardadoEn; }

function emitir() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    guardadoEn = Date.now();
    oyentesGuardado.forEach((f) => f(guardadoEn));
  } catch { /* sin almacenamiento: se juega sin guardar */ }
  oyentes.forEach((f) => f());
}

/* ---------- exportar e importar progreso ---------- */
export function exportarProgreso(): string {
  return JSON.stringify({ v: 1, fecha: new Date().toISOString(), personaje: estado.personaje, progreso: estado.progreso }, null, 2);
}
export function importarProgreso(texto: string): { ok: boolean; msg: string } {
  try {
    const d = JSON.parse(texto);
    if (!d || !d.progreso || typeof d.progreso.xp !== "number") return { ok: false, msg: "El archivo no tiene el formato esperado." };
    estado = {
      ...estado,
      personaje: normalizar(d.personaje),
      progreso: { ...progresoInicial(), ...d.progreso },
      pantalla: d.personaje ? "mapa" : "intro",
      nivelActual: null
    };
    emitir();
    return { ok: true, msg: `Progreso restaurado: ${d.progreso.xp} XP y ${(d.progreso.resueltos || []).length} desafios.` };
  } catch {
    return { ok: false, msg: "No pude leer ese archivo. Revisa que sea el .json que exportaste." };
  }
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