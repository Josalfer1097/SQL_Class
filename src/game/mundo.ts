import BASE from "./ejercicios_base.js";
import CADENA from "./ejercicios_cadena.js";
import AVANZADO from "./ejercicios_avanzado.js";
import VACIO from "./ejercicios_vacio.js";
export type Check = { tipo: "rows"; ordered?: boolean } | { tipo: "state"; tabla: string; constraints?: boolean };
export interface Ejercicio {
  n: number; dif: string; tema: "SELECT" | "UPDATE" | "ALTER"; titulo: string; bloque: string;
  pide: string; tips?: string[]; pistas: string[]; sol: string; check: Check;
  aprende: string; reto?: string; cadena?: string; paso?: number;
}

export const EJERCICIOS: Ejercicio[] = ([] as Ejercicio[]).concat(BASE as Ejercicio[], CADENA as Ejercicio[], AVANZADO as Ejercicio[], VACIO as Ejercicio[]);
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
  },
  {
    id: "vacio", nombre: "El Vacio", lema: "Cualquiera sabe hacer un SELECT. Se necesita verdadera precision para un DELETE.",
    descripcion: "DELETE, TRUNCATE y las catastrofes de olvidar el WHERE.",
    color: "#A0AEC0", icono: "∅", niveles: [49, 50, 51, 52], xpNivel: 130, xpJefe: 350,
    intro: "El Vacio. Al fin llegas a la destruccion. Borrar es el mayor poder que tendras; usalo mal y te quedaras sin trabajo antes del almuerzo.",
    victoria: "Vaciaste lo que debias y dejaste lo demas intacto. Casi pareces un profesional. Casi."
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
export const COSTO_PISTA = [8, 16, 28];   // cada pista siguiente cuesta mas
export const COSTO_SOLUCION = 55;

/* ---------- frases del Maestro ---------- */
export const UMBRA = {
  nombre: "Umbra",
  titulo: "Archivista del Umbral",
  saludos: [
    "Otro que viene a hablar con las tablas. Adelante. Ellas no muerden.",
    "Llegas tarde. No habia hora, pero llegas tarde.",
    "Bienvenido al Archivo. Aqui los datos no se pierden: se olvidan, que es considerablemente peor.",
    "Pasa. Toca lo que quieras. Total, lo unico irreversible aqui es el ridiculo."
  ],
  acierto: [
    "Correcto. Tomo nota, por si vuelve a ocurrir.",
    "Bien. Casi como si supieras lo que estabas haciendo.",
    "Exacto. Lo anoto en el registro de cosas que no vi venir.",
    "Funciona. Y ademas era lo que te pedi, que es un detalle que mucha gente pasa por alto.",
    "Correcto. Empiezo a sospechar que esto no fue suerte.",
    "Eso era. Sigue asi y me voy a quedar sin material."
  ],
  aciertoLimpio: [
    "Correcto y bien escrito. Dos cosas a la vez. No sabria decir cual me sorprende mas.",
    "Ni una nota que hacerte. Voy a revisarlo otra vez, por costumbre.",
    "Impecable. Es la clase de consulta que uno puede dejar en produccion y dormir."
  ],
  fallo: [
    "No. Pero he visto formas peores de equivocarse, y algunas esta misma semana.",
    "Casi. Y en SQL, casi es un sinonimo elegante de no.",
    "La base te esta diciendo algo. Yo ya lo escuche; te toca a ti.",
    "Eso no era. Lo bueno es que no borraste nada, que era mi principal preocupacion.",
    "Fallaste. Es normal: este idioma tiene la costumbre de parecer obvio hasta que lo escribes.",
    "No es eso. Pero vas en una direccion; solo que no es esta."
  ],
  error: [
    "Eso ni siquiera llego a correr. La sintaxis es el requisito minimo, y hoy no lo cumplimos.",
    "El motor te devolvio un error. Leelo con calma: son cartas de amor mal redactadas.",
    "No compila, no ejecuta, no existe. Los tres estados del SQL apresurado.",
    "Hay un error ahi. Y a diferencia de mi, el motor te esta diciendo exactamente donde."
  ],
  pista1: [
    "Te empujo en la direccion correcta. Nada mas que eso.",
    "Una idea, no una respuesta. Cobro poco, pero cobro.",
    "Ahi va la primera. Sigue siendo tu turno de pensar."
  ],
  pista2: [
    "Segunda pista. Ahora si te digo que herramienta buscar.",
    "Esta cuesta mas, y con razon: ya es medio camino andado.",
    "Te nombro las piezas. Armarlas continua siendo trabajo tuyo."
  ],
  pista3: [
    "Ultima pista, y es la cara. Te doy la forma con huecos; los huecos son asunto tuyo.",
    "Hasta aqui llega mi generosidad, que nunca fue muy lejos.",
    "Te dejo el molde. Si tambien quieres el contenido, eso ya se llama solucion y tiene otro precio."
  ],
  sinPistas: [
    "Ya no hay mas pistas. Tres alcanzan para cualquiera, y sospecho que para ti tambien.",
    "Se acabaron. Lo siguiente que puedo abrirte es la solucion completa, y no sale barata."
  ],
  solucion: [
    "Aqui tienes. Escribela tu, no la copies: copiar no deja callo en los dedos.",
    "Toma. Y despues cierrala y hazla de memoria, o no cuenta.",
    "La solucion. Mirarla ensena bastante menos de lo que uno cree."
  ],
  jefeIntro: [
    "Este es el jefe del reino. Aqui no vendo pistas, ni por XP ni por insistencia.",
    "Ultimo desafio de esta tierra. Si lo pasas, cruzas. Si no, tambien, pero con menos elegancia.",
    "El jefe. Todo lo que aprendiste en este reino cabe en esta consulta."
  ],
  sinXp: [
    "No te alcanza el XP. Resuelve algo primero y despues volvemos a negociar.",
    "Con ese saldo no. El conocimiento es gratis; las pistas, no tanto."
  ]
};

export const frase = (lista: string[]) => lista[Math.floor(Math.random() * lista.length)];