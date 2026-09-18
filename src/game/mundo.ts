import BASE from "./ejercicios_base.js";
import CADENA from "./ejercicios_cadena.js";
import AVANZADO from "./ejercicios_avanzado.js";

export type Check = { tipo: "rows"; ordered?: boolean } | { tipo: "state"; tabla: string; constraints?: boolean };
export interface Ejercicio {
  n: number; dif: string; tema: "SELECT" | "UPDATE" | "ALTER"; titulo: string; bloque: string;
  pide: string; tips?: string[]; pista: string; sol: string; check: Check;
  aprende: string; reto?: string; cadena?: string; paso?: number;
}

export const EJERCICIOS: Ejercicio[] = ([] as Ejercicio[]).concat(BASE as Ejercicio[], CADENA as Ejercicio[], AVANZADO as Ejercicio[]);
export const porN = (n: number) => EJERCICIOS.find((e) => e.n === n)!;

export interface Reino {
  id: string;
  nombre: string;
  lema: string;
  descripcion: string;
  color: string;      // acento del reino
  icono: string;      // emoji/glyph simple para el mapa
  niveles: number[];  // n de ejercicios, en orden; el ultimo es el jefe
  xpNivel: number;
  xpJefe: number;
  intro: string;      // lo que dice Umbra al entrar
  victoria: string;   // lo que dice Umbra al conquistar el reino
}

export const REINOS: Reino[] = [
  {
    id: "umbral", nombre: "El Umbral", lema: "Donde todo el que sabe leer, empieza a leer datos.",
    descripcion: "SELECT, columnas, orden y limites. Las primeras palabras del idioma.",
    color: "#7DB4FF", icono: "⌂", niveles: [1, 2, 6, 13], xpNivel: 40, xpJefe: 90,
    intro: "Bienvenido al Umbral. Aqui nadie te pide gran cosa: leer una tabla y no tirarla. Sorprenderias cuanta gente falla en lo segundo.",
    victoria: "Ya sabes leer. No te emociones: los libros de esta biblioteca muerden."
  },
  {
    id: "pantano", nombre: "El Pantano de los Filtros", lema: "Cada condicion es una piedra sobre el lodo. Pisa mal y te hundes.",
    descripcion: "WHERE, BETWEEN, IN, LIKE, IS NULL y la logica de AND y OR.",
    color: "#4FC1A0", icono: "≈", niveles: [3, 9, 7, 8, 10], xpNivel: 50, xpJefe: 110,
    intro: "El Pantano. Aqui aprendes a decir 'estas si, estas no'. La mayoria confunde el NULL con una piedra. No lo es: es niebla.",
    victoria: "Filtras como alguien que ya se cayo al lodo un par de veces. Es la unica forma de aprender."
  },
  {
    id: "torre", nombre: "La Torre de Agregacion", lema: "Muchas filas suben; una sola baja.",
    descripcion: "COUNT, SUM, AVG, GROUP BY y HAVING: resumir sin mentir.",
    color: "#FFB05C", icono: "▲", niveles: [4, 5, 11, 12, 22], xpNivel: 60, xpJefe: 130,
    intro: "La Torre. Subes con cien filas y bajas con una. Si bajas con cien, no entendiste la torre.",
    victoria: "Agrupas, cuentas, sumas. Y ya sabes que WHERE y HAVING no son la misma puerta."
  },
  {
    id: "puente", nombre: "El Puente de las Uniones", lema: "Dos orillas, un camino. Pero el LEFT JOIN cruza aunque no haya otra orilla.",
    descripcion: "INNER JOIN, LEFT JOIN, y la trampa que degrada uno en otro.",
    color: "#B794F6", icono: "⌒", niveles: [21, 23, 25], xpNivel: 80, xpJefe: 160,
    intro: "El Puente. Une lo que esta separado. El truco no es unir: es decidir que pasa con lo que no tiene pareja.",
    victoria: "Cruzaste el Puente con todos, incluidos los que no tenian con quien ir. Eso es un LEFT JOIN bien hecho."
  },
  {
    id: "catacumbas", nombre: "Las Catacumbas", lema: "Una consulta dentro de otra. Y dentro de esa, otra.",
    descripcion: "Subconsultas escalares, EXISTS, NOT EXISTS y CASE.",
    color: "#E0338A", icono: "◈", niveles: [24, 26, 27], xpNivel: 90, xpJefe: 180,
    intro: "Las Catacumbas. Consultas que viven dentro de consultas. Baja con cuidado: NOT IN esta enterrado aqui, y no fue por accidente.",
    victoria: "Saliste de las Catacumbas sin usar NOT IN. Mi respeto, que no es poco."
  },
  {
    id: "forja", nombre: "La Forja", lema: "Aqui no se cambian datos. Se cambia el molde.",
    descripcion: "ALTER TABLE: columnas, tipos, defaults y restricciones.",
    color: "#FF7A59", icono: "⚒", niveles: [17, 18, 19, 20], xpNivel: 70, xpJefe: 150,
    intro: "La Forja. Todo lo que hagas aqui cambia la forma de la tabla, no su contenido. Y algunos golpes no se pueden deshacer.",
    victoria: "Forjaste columnas y restricciones sin quemar la tabla. En produccion eso se llama martes tranquilo."
  },
  {
    id: "templo", nombre: "El Templo del Cambio", lema: "Todo UPDATE nace como SELECT. Quien olvida el WHERE, olvida la tabla.",
    descripcion: "UPDATE con expresiones, subconsultas, CASE y condiciones defensivas.",
    color: "#FF3B5C", icono: "⟳", niveles: [14, 15, 16, 28, 29, 30], xpNivel: 80, xpJefe: 170,
    intro: "El Templo. Aqui se cambian los datos de verdad. Te doy un consejo gratis, que es raro en mi: escribe el SELECT primero.",
    victoria: "Modificaste datos sin destruir nada. Hay gerentes de sistemas que no pueden decir lo mismo."
  },
  {
    id: "lealtad", nombre: "La Cadena de Lealtad", lema: "Diez pasos. Cada uno pisa sobre el anterior.",
    descripcion: "Una migracion completa: abrir columna, medir, proteger, cargar, verificar, clasificar y reportar.",
    color: "#C9A6F5", icono: "⛓", niveles: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], xpNivel: 90, xpJefe: 250,
    intro: "La Cadena. Diez eslabones, y cada uno depende del anterior. Asi se hace una migracion real: no hay un solo hechizo, hay diez pequenos.",
    victoria: "Completaste una migracion de principio a fin. Ya puedes decir que has hecho SQL de verdad, no solo consultas bonitas."
  },
  {
    id: "cima", nombre: "La Cima de las Ventanas", lema: "Desde aqui ves cada fila y, al mismo tiempo, el conjunto entero.",
    descripcion: "CTE, ROW_NUMBER, RANK, agregados con OVER, acumulados y porcentajes.",
    color: "#7CD5FF", icono: "✦", niveles: [41, 42, 43, 44, 45, 46, 47, 48], xpNivel: 120, xpJefe: 320,
    intro: "La Cima. Pocos llegan. Aqui una fila conoce a sus vecinas sin dejar de ser ella misma. Se llama ventana, y cambia como piensas el SQL.",
    victoria: "Llegaste a la Cima. Ya no necesitas un maestro encapuchado. Aunque, seamos honestos, me vas a extranar."
  }
];

export const reinoDe = (n: number) => REINOS.find((r) => r.niveles.includes(n))!;
export const esJefe = (n: number) => reinoDe(n).niveles[reinoDe(n).niveles.length - 1] === n;

/* ---------- rangos por XP ---------- */
export const RANGOS: { min: number; titulo: string }[] = [
  { min: 0, titulo: "Aprendiz de Consultas" },
  { min: 200, titulo: "Lector de Tablas" },
  { min: 500, titulo: "Filtrador del Pantano" },
  { min: 900, titulo: "Agregador de la Torre" },
  { min: 1400, titulo: "Cruzador de Puentes" },
  { min: 2000, titulo: "Explorador de Catacumbas" },
  { min: 2600, titulo: "Herrero de Esquemas" },
  { min: 3300, titulo: "Guardian del Templo" },
  { min: 4000, titulo: "Portador de la Cadena" },
  { min: 4800, titulo: "Archivista de las Ventanas" }
];
export const rangoDe = (xp: number) => [...RANGOS].reverse().find((r) => xp >= r.min)!;
export const siguienteRango = (xp: number) => RANGOS.find((r) => r.min > xp) || null;

/* ---------- costos ---------- */
export const COSTO_PISTA = 10;
export const COSTO_SOLUCION = 40;

/* ---------- frases del Maestro ---------- */
export const UMBRA = {
  nombre: "Umbra",
  titulo: "Archivista del Umbral",
  saludos: [
    "Ah. Otro que quiere hablar con las tablas. Pasa, pasa. No muerden. Yo si, pero poco.",
    "Llegas tarde. No, no habia hora. Igual llegas tarde.",
    "Bienvenido al Archivo. Aqui los datos no se pierden; se olvidan, que es peor."
  ],
  acierto: [
    "Correcto. No te acostumbres, pero correcto.",
    "Bien. Casi como si supieras lo que haces.",
    "Exacto. Anotare esto en el registro de cosas que no esperaba.",
    "Impecable. Voy a fingir que no estoy impresionado.",
    "Eso. Justo eso. Sigue asi y me quedo sin sarcasmo, que seria una tragedia."
  ],
  aciertoLimpio: [
    "Correcto y bien escrito. Dos cosas a la vez. Estoy... conmovido, dentro de lo que cabe.",
    "Ni una nota que hacerte. Desconfio, pero acepto."
  ],
  fallo: [
    "No. Pero no es la peor forma de equivocarse que he visto hoy.",
    "Casi. Y 'casi' en SQL es exactamente igual a 'no'.",
    "Mmm. La base te esta diciendo algo. Escuchala; yo ya la escuche.",
    "Eso no era. Pero tampoco borraste nada, asi que vamos bien.",
    "Fallaste. Bienvenido al club; tiene millones de miembros."
  ],
  error: [
    "Eso ni siquiera corrio. La sintaxis es lo minimo que te pido, y ya ves.",
    "El motor te escupio un error. Leelo: los errores son cartas de amor con mala ortografia.",
    "No compila, no ejecuta, no existe. Pero todo se arregla."
  ],
  pista: [
    "Te doy una pista. Cobro poco, pero cobro.",
    "Esta bien. Una pista. No se la cuentes a nadie.",
    "Pista concedida. Mi reputacion de maestro cruel se resiente."
  ],
  solucion: [
    "Aqui tienes la solucion. Escribela tu, no la copies: copiar no deja callo en los dedos.",
    "Toma. Y luego cierrala y hazla de memoria, o no cuenta."
  ],
  jefeIntro: [
    "Este es el jefe del reino. No hay pista barata aqui.",
    "Ultimo desafio de esta tierra. Si lo pasas, te dejo cruzar. Si no, tambien, pero con menos dignidad."
  ],
  sinXp: [
    "No te alcanza el XP para eso. Resuelve algo primero y despues me pides favores."
  ]
};

export const frase = (lista: string[]) => lista[Math.floor(Math.random() * lista.length)];
