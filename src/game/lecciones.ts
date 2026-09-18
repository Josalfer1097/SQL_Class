/* ============================================================
   LECCIONES — la parte de enseñanza, antes de los desafios.
   Cada reino tiene una leccion dividida en pasos cortos.
   Tipos de bloque:
     texto   — explicacion en prosa
     nota    — aviso, trampa o regla de oro
     codigo  — ejemplo que el alumno puede EJECUTAR en el momento
     tabla   — comparacion de dos o tres cosas
     prueba  — mini reto dentro de la leccion, con respuesta esperada
   ============================================================ */

export type Bloque =
  | { t: "texto"; txt: string }
  | { t: "nota"; tono: "ojo" | "regla" | "dato"; txt: string }
  | { t: "codigo"; sql: string; explica?: string }
  | { t: "tabla"; cab: string[]; filas: string[][] }
  | { t: "prueba"; pide: string; sol: string; pista: string };

export interface Paso { titulo: string; bloques: Bloque[] }
export interface Leccion { reino: string; titulo: string; intro: string; xp: number; pasos: Paso[] }

export const LECCIONES: Leccion[] = [
/* ============================ 1. EL UMBRAL ============================ */
{
  reino: "umbral", titulo: "Leer una tabla", xp: 60,
  intro: "Antes de pedirle nada raro a la base, hay que saber mirarla. Aqui aprendes a traer columnas y a decidir en que orden salen.",
  pasos: [
    { titulo: "Una tabla es una hoja de calculo con reglas", bloques: [
      { t: "texto", txt: "Una tabla tiene columnas (los campos) y filas (los registros). La tabla productos del Archivo tiene 24 filas y ocho columnas: id, sku, nombre, categoria, descripcion, precio, stock y descontinuado." },
      { t: "texto", txt: "Para ver que hay dentro, se usa SELECT. Ejecuta esto y mira el resultado:" },
      { t: "codigo", sql: "SELECT *\n  FROM productos\n LIMIT 5;", explica: "El asterisco trae todas las columnas. LIMIT 5 corta en cinco filas para no ahogarte." },
      { t: "nota", tono: "ojo", txt: "SELECT * sirve para curiosear, no para un reporte. El dia que alguien agregue una columna, tu reporte cambia solo sin que nadie lo pida." }
    ]},
    { titulo: "Pide solo lo que necesitas", bloques: [
      { t: "texto", txt: "En vez del asterisco, nombra las columnas. Se leen mejor una por linea, y asi el reporte no cambia si la tabla crece." },
      { t: "codigo", sql: "SELECT nombre,\n       precio\n  FROM productos\n LIMIT 5;" },
      { t: "texto", txt: "La convencion del curso es darle un alias corto a la tabla y usarlo en cada columna. Hoy parece de mas; cuando aparezca el segundo JOIN vas a agradecerlo." },
      { t: "codigo", sql: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n LIMIT 5;", explica: "La p es el alias. FROM productos p y despues p.nombre." }
    ]},
    { titulo: "El orden no viene de regalo", bloques: [
      { t: "texto", txt: "Sin ORDER BY, el motor devuelve las filas en el orden que le resulte mas comodo. Hoy puede parecer ordenado y manana no." },
      { t: "codigo", sql: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n ORDER BY p.precio DESC\n LIMIT 5;", explica: "DESC es de mayor a menor. ASC, al reves, y es lo que se asume si no escribes nada." },
      { t: "nota", tono: "regla", txt: "ORDER BY es la ultima operacion logica de la consulta: primero se arma el conjunto de filas, y al final se ordena." },
      { t: "prueba", pide: "Trae el sku y el stock de los productos, del que menos existencias tiene al que mas. Limita a 3 filas.",
        sol: "SELECT p.sku, p.stock FROM productos p ORDER BY p.stock ASC LIMIT 3;",
        pista: "Dos columnas, ORDER BY sobre stock en direccion ascendente, y LIMIT al final." }
    ]},
    { titulo: "Ponle nombre a lo que calculas", bloques: [
      { t: "texto", txt: "El SELECT no solo trae columnas: tambien calcula. Y a lo que calculas conviene ponerle nombre con AS, porque ese nombre es lo que vera quien lea el reporte." },
      { t: "codigo", sql: "SELECT p.nombre,\n       p.precio,\n       ROUND(p.precio * 1.16, 2) AS precio_con_iva\n  FROM productos p\n LIMIT 5;" },
      { t: "nota", tono: "dato", txt: "Sin AS, esa columna se llamaria round, que no le dice nada a nadie." }
    ]},
    { titulo: "Contar sin mirar todo", bloques: [
      { t: "texto", txt: "A veces no quieres las filas: quieres saber cuantas son. COUNT(*) devuelve un solo numero." },
      { t: "codigo", sql: "SELECT COUNT(*) AS cuantos\n  FROM productos;" },
      { t: "texto", txt: "Y DISTINCT sirve para ver que valores distintos existen en una columna, sin repetirlos." },
      { t: "codigo", sql: "SELECT DISTINCT p.categoria\n  FROM productos p\n ORDER BY p.categoria;" },
      { t: "nota", tono: "dato", txt: "Es lo primero que se corre al llegar a una tabla desconocida: cuantas filas hay y que valores toma cada columna." }
    ]},
    { titulo: "Las cuatro tablas del Archivo", bloques: [
      { t: "texto", txt: "Este mundo tiene cuatro tablas y conviene conocerlas antes de seguir." },
      { t: "tabla", cab: ["Tabla", "Filas", "Que guarda"], filas: [
        ["sucursales", "6", "nombre, ciudad y fecha de apertura"],
        ["empleados", "18", "nombre, puesto, salario y su sucursal"],
        ["productos", "24", "sku, nombre, categoria, precio y stock"],
        ["ventas", "96", "folio, producto, empleado, cantidad y total"]
      ]},
      { t: "codigo", sql: "SELECT e.nombre,\n       e.puesto,\n       e.salario\n  FROM empleados e\n ORDER BY e.salario DESC\n LIMIT 5;" },
      { t: "prueba", pide: "Muestra el nombre y la ciudad de las sucursales, ordenadas por ciudad.",
        sol: "SELECT s.nombre, s.ciudad FROM sucursales s ORDER BY s.ciudad;",
        pista: "Dos columnas de la tabla sucursales y un ORDER BY por ciudad." }
    ]}
  ]
},

/* ============================ 2. EL PANTANO ============================ */
{
  reino: "pantano", titulo: "Filtrar sin hundirse", xp: 70,
  intro: "WHERE decide que filas pasan y cuales no. Suena simple, y lo es, hasta que aparece NULL.",
  pasos: [
    { titulo: "WHERE, fila por fila", bloques: [
      { t: "texto", txt: "El motor evalua la condicion del WHERE en cada fila. Si da verdadero, la fila pasa. Si da falso, se queda fuera." },
      { t: "codigo", sql: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n WHERE p.categoria = 'Pintura';" },
      { t: "nota", tono: "ojo", txt: "Los textos van entre comillas SIMPLES. Las dobles son para nombres de columnas: si escribes \"Pintura\", PostgreSQL busca una columna llamada asi y falla." }
    ]},
    { titulo: "Rangos y listas", bloques: [
      { t: "texto", txt: "Tres atajos que se usan todo el tiempo:" },
      { t: "tabla", cab: ["Quieres", "Escribes", "Ojo con"], filas: [
        ["un rango cerrado", "precio BETWEEN 100 AND 500", "incluye los dos extremos"],
        ["varias opciones", "categoria IN ('Pintura', 'Plomeria')", "equivale a varios OR"],
        ["texto parcial", "nombre LIKE 'Taladro%'", "% es cualquier cosa, _ es un caracter"]
      ]},
      { t: "codigo", sql: "SELECT p.sku,\n       p.precio\n  FROM productos p\n WHERE p.precio BETWEEN 100 AND 500\n ORDER BY p.precio;" }
    ]},
    { titulo: "NULL no es cero ni vacio: es desconocido", bloques: [
      { t: "texto", txt: "Cuando un dato no se capturo, la celda guarda NULL. No es cero, no es cadena vacia: es la ausencia de informacion." },
      { t: "texto", txt: "Y aqui viene la trampa. Comparar algo desconocido con el signo igual no da ni verdadero ni falso: da desconocido. Y el WHERE descarta lo desconocido." },
      { t: "codigo", sql: "SELECT COUNT(*) AS con_igual\n  FROM productos p\n WHERE p.descripcion = NULL;", explica: "Devuelve 0, aunque si hay productos sin descripcion." },
      { t: "codigo", sql: "SELECT COUNT(*) AS con_is_null\n  FROM productos p\n WHERE p.descripcion IS NULL;", explica: "Este si los encuentra." },
      { t: "nota", tono: "regla", txt: "Para preguntar por la ausencia de un dato, la unica forma valida es IS NULL o IS NOT NULL." }
    ]},
    { titulo: "AND y OR no pesan igual", bloques: [
      { t: "texto", txt: "Igual que en aritmetica la multiplicacion se agrupa antes que la suma, en SQL el AND se agrupa antes que el OR. Casi nunca es lo que uno queria." },
      { t: "codigo", sql: "SELECT COUNT(*) AS sin_parentesis\n  FROM productos p\n WHERE p.categoria = 'Pintura'\n    OR p.categoria = 'Plomeria' AND p.precio > 200;", explica: "El motor lee: Pintura completa, MAS la Plomeria cara." },
      { t: "codigo", sql: "SELECT COUNT(*) AS con_parentesis\n  FROM productos p\n WHERE (p.categoria = 'Pintura' OR p.categoria = 'Plomeria')\n   AND p.precio > 200;", explica: "Ahora si: las dos categorias, y solo las caras." },
      { t: "nota", tono: "regla", txt: "Si mezclas AND y OR, pon parentesis siempre. Aunque creas que no hacen falta." },
      { t: "prueba", pide: "Cuenta los productos de la categoria 'Herramienta' que cuestan mas de 500. Llama a la columna n.",
        sol: "SELECT COUNT(*) AS n FROM productos p WHERE p.categoria = 'Herramienta' AND p.precio > 500;",
        pista: "Dos condiciones unidas con AND, y COUNT(*) con su alias." }
    ]},
    { titulo: "Negar una condicion", bloques: [
      { t: "texto", txt: "NOT invierte una condicion, y los operadores tienen su version negada." },
      { t: "tabla", cab: ["Afirmas", "Niegas"], filas: [
        ["precio > 100", "precio <= 100"],
        ["categoria = 'Pintura'", "categoria <> 'Pintura'"],
        ["precio BETWEEN 100 AND 500", "precio NOT BETWEEN 100 AND 500"],
        ["nombre LIKE 'T%'", "nombre NOT LIKE 'T%'"]
      ]},
      { t: "codigo", sql: "SELECT p.sku,\n       p.categoria\n  FROM productos p\n WHERE p.categoria <> 'Pintura'\n ORDER BY p.sku\n LIMIT 8;" },
      { t: "nota", tono: "ojo", txt: "Cuidado: si la columna tiene NULL, ni la condicion ni su negacion lo incluyen. El NULL se queda fuera de las dos." }
    ]},
    { titulo: "Fechas: tambien se comparan", bloques: [
      { t: "texto", txt: "Una fecha se compara como un numero: mayor es mas reciente. Se escribe con DATE y el formato aaaa-mm-dd." },
      { t: "codigo", sql: "SELECT s.nombre,\n       s.fecha_apertura\n  FROM sucursales s\n WHERE s.fecha_apertura >= DATE '2021-01-01'\n ORDER BY s.fecha_apertura;" },
      { t: "texto", txt: "Y EXTRACT saca una parte de la fecha, por ejemplo el anio." },
      { t: "codigo", sql: "SELECT EXTRACT(YEAR FROM v.fecha) AS anio,\n       COUNT(*)                   AS ventas\n  FROM ventas v\n GROUP BY EXTRACT(YEAR FROM v.fecha)\n ORDER BY anio;" },
      { t: "prueba", pide: "Muestra el folio y la fecha de las ventas del anio 2026, ordenadas por fecha. Limita a 5.",
        sol: "SELECT v.folio, v.fecha FROM ventas v WHERE EXTRACT(YEAR FROM v.fecha) = 2026 ORDER BY v.fecha LIMIT 5;",
        pista: "EXTRACT(YEAR FROM v.fecha) devuelve el anio; comparalo con 2026 en el WHERE." }
    ]}
  ]
},

/* ============================ 3. LA TORRE ============================ */
{
  reino: "torre", titulo: "Resumir sin mentir", xp: 80,
  intro: "Hasta ahora cada fila salia entera. Aqui muchas filas entran y una sola sale.",
  pasos: [
    { titulo: "Las cinco funciones que resumen", bloques: [
      { t: "texto", txt: "Una funcion de agregacion toma muchos valores y devuelve uno. Sin GROUP BY, colapsan la tabla entera en una sola fila." },
      { t: "codigo", sql: "SELECT COUNT(*)                 AS total,\n       ROUND(AVG(p.precio), 2) AS promedio,\n       MIN(p.precio)           AS mas_barato,\n       MAX(p.precio)           AS mas_caro,\n       SUM(p.stock)            AS piezas\n  FROM productos p;" },
      { t: "nota", tono: "ojo", txt: "COUNT(*) cuenta filas. COUNT(columna) cuenta solo los valores no nulos de esa columna. La diferencia va a importar muchisimo cuando llegues al Puente." }
    ]},
    { titulo: "GROUP BY parte la tabla en cubetas", bloques: [
      { t: "texto", txt: "Si en vez de un total general quieres uno por categoria, agrupas. El motor separa las filas en cubetas y aplica la agregacion dentro de cada una." },
      { t: "codigo", sql: "SELECT p.categoria,\n       COUNT(*)     AS n,\n       SUM(p.stock) AS piezas\n  FROM productos p\n GROUP BY p.categoria\n ORDER BY piezas DESC;" },
      { t: "nota", tono: "regla", txt: "Toda columna del SELECT que no este dentro de una agregacion tiene que aparecer en el GROUP BY. Si no, el motor no sabe cual de los valores del grupo mostrarte." }
    ]},
    { titulo: "WHERE filtra filas, HAVING filtra grupos", bloques: [
      { t: "texto", txt: "Son dos momentos distintos de la misma consulta y no son intercambiables. WHERE corre antes de agrupar; HAVING despues." },
      { t: "tabla", cab: ["Clausula", "Cuando corre", "Puede usar"], filas: [
        ["WHERE", "antes del GROUP BY", "columnas de la fila"],
        ["HAVING", "despues del GROUP BY", "COUNT, SUM, AVG, MIN, MAX"]
      ]},
      { t: "codigo", sql: "SELECT p.categoria,\n       SUM(p.stock) AS piezas\n  FROM productos p\n WHERE p.descontinuado = 0\n GROUP BY p.categoria\nHAVING SUM(p.stock) > 100\n ORDER BY piezas DESC;", explica: "descontinuado = 0 descarta filas. SUM(...) > 100 descarta categorias enteras." },
      { t: "prueba", pide: "Muestra cada categoria con su precio promedio redondeado a dos decimales (columna prom), solo de las categorias cuyo promedio pase de 300. Ordena por prom descendente.",
        sol: "SELECT p.categoria, ROUND(AVG(p.precio),2) AS prom FROM productos p GROUP BY p.categoria HAVING AVG(p.precio) > 300 ORDER BY prom DESC;",
        pista: "GROUP BY por categoria, el promedio en el SELECT con ROUND, y la condicion del promedio en HAVING." }
    ]}
  ]
},

/* ============================ 4. EL PUENTE ============================ */
{
  reino: "puente", titulo: "Unir dos tablas", xp: 90,
  intro: "Los datos viven repartidos. Un JOIN los vuelve a juntar, y la decision importante no es unir: es que hacer con lo que no tiene pareja.",
  pasos: [
    { titulo: "Llave primaria y llave foranea", bloques: [
      { t: "texto", txt: "Cada empleado guarda el id de su sucursal en la columna sucursal_id. Eso es una llave foranea: apunta a la llave primaria de otra tabla." },
      { t: "tabla", cab: ["Tabla", "Llave primaria", "Apunta a"], filas: [
        ["sucursales", "id", "—"],
        ["empleados", "id", "sucursal_id → sucursales.id"],
        ["ventas", "id", "producto_id → productos.id, empleado_id → empleados.id"]
      ]},
      { t: "nota", tono: "dato", txt: "Abre el Modelo con Ctrl+M cuando quieras ver esto dibujado." }
    ]},
    { titulo: "JOIN empareja filas", bloques: [
      { t: "texto", txt: "El ON dice como se emparejan: la llave foranea de una tabla contra la llave primaria de la otra." },
      { t: "codigo", sql: "SELECT e.nombre AS empleado,\n       s.nombre AS sucursal\n  FROM empleados  e\n  JOIN sucursales s\n    ON s.id = e.sucursal_id\n ORDER BY e.id\n LIMIT 8;" },
      { t: "nota", tono: "ojo", txt: "Relacionar las columnas equivocadas (por ejemplo e.id = s.id) produce un resultado que parece valido y no lo es. Empleado 3 con sucursal 3 no significa nada." }
    ]},
    { titulo: "LEFT JOIN conserva a los que no tienen pareja", bloques: [
      { t: "texto", txt: "JOIN a secas es INNER JOIN: solo deja las filas que encuentran pareja. Si una sucursal no tiene empleados, desaparece del reporte, que suele ser justo la que querias detectar." },
      { t: "codigo", sql: "SELECT s.nombre,\n       COUNT(e.id) AS empleados\n  FROM sucursales s\n  LEFT JOIN empleados e\n    ON e.sucursal_id = s.id\n GROUP BY s.nombre\n ORDER BY empleados;", explica: "Con LEFT JOIN aparecen todas las sucursales, incluso la que tiene 0." },
      { t: "nota", tono: "regla", txt: "En un LEFT JOIN sin pareja, las columnas de la derecha vienen en NULL. Por eso se cuenta COUNT(e.id) y no COUNT(*): el asterisco cuenta la fila igual y donde deberia decir 0 diria 1." }
    ]},
    { titulo: "La trampa que degrada el LEFT JOIN", bloques: [
      { t: "texto", txt: "Si pones una condicion sobre la tabla derecha en el WHERE, las filas sin pareja tienen NULL ahi, la comparacion da desconocido y se van. Tu LEFT JOIN se volvio INNER sin avisar." },
      { t: "codigo", sql: "SELECT s.nombre,\n       COUNT(e.id) AS activos\n  FROM sucursales s\n  LEFT JOIN empleados e\n    ON e.sucursal_id = s.id\n   AND e.activo = 1\n GROUP BY s.nombre\n ORDER BY s.nombre;", explica: "La condicion va en el ON, no en el WHERE: asi se conservan todas las sucursales." },
      { t: "prueba", pide: "Muestra el nombre de cada producto y cuantas ventas tiene (columna ventas), incluyendo los que nunca se vendieron. Ordena por ventas ascendente y limita a 5.",
        sol: "SELECT p.nombre, COUNT(v.id) AS ventas FROM productos p LEFT JOIN ventas v ON v.producto_id = p.id GROUP BY p.id, p.nombre ORDER BY ventas, p.id LIMIT 5;",
        pista: "LEFT JOIN desde productos, cuenta una columna de ventas, agrupa por producto." }
    ]},
    { titulo: "Unir tres tablas", bloques: [
      { t: "texto", txt: "Un JOIN se encadena con el siguiente. Cada ON conecta un par de tablas." },
      { t: "codigo", sql: "SELECT v.folio,\n       p.nombre AS producto,\n       e.nombre AS vendedor\n  FROM ventas    v\n  JOIN productos p ON p.id = v.producto_id\n  JOIN empleados e ON e.id = v.empleado_id\n ORDER BY v.id\n LIMIT 8;" },
      { t: "nota", tono: "dato", txt: "El orden en que escribes los JOIN no cambia el resultado; el motor decide como ejecutarlos. Lo que si cambia todo es el ON." }
    ]},
    { titulo: "Agrupar despues de unir", bloques: [
      { t: "texto", txt: "El patron mas comun de reporte: unir para traer el nombre, agrupar para resumir." },
      { t: "codigo", sql: "SELECT s.nombre       AS sucursal,\n       COUNT(v.id)    AS ventas,\n       SUM(v.total)   AS importe\n  FROM sucursales s\n  JOIN empleados  e ON e.sucursal_id = s.id\n  JOIN ventas     v ON v.empleado_id = e.id\n GROUP BY s.nombre\n ORDER BY importe DESC;" },
      { t: "prueba", pide: "Muestra el nombre del empleado y cuantas ventas hizo (columna ventas), de mayor a menor. Limita a 5.",
        sol: "SELECT e.nombre, COUNT(v.id) AS ventas FROM empleados e JOIN ventas v ON v.empleado_id = e.id GROUP BY e.nombre ORDER BY ventas DESC LIMIT 5;",
        pista: "JOIN entre empleados y ventas, GROUP BY por el nombre y COUNT de las ventas." }
    ]}
  ]
},

/* ============================ 5. CATACUMBAS ============================ */
{
  reino: "catacumbas", titulo: "Consultas dentro de consultas", xp: 95,
  intro: "A veces el criterio para filtrar hay que calcularlo primero. Ahi entran las subconsultas.",
  pasos: [
    { titulo: "Subconsulta escalar: un solo valor", bloques: [
      { t: "texto", txt: "Una subconsulta entre parentesis que devuelve un unico valor se puede usar como si fuera un numero." },
      { t: "codigo", sql: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n WHERE p.precio > (SELECT AVG(p2.precio)\n                     FROM productos p2)\n ORDER BY p.precio DESC\n LIMIT 6;", explica: "El promedio se calcula una vez y despues se compara cada fila contra el." },
      { t: "nota", tono: "ojo", txt: "Usa un alias distinto adentro (p2). Si repites el mismo, el motor no sabe a cual te refieres." }
    ]},
    { titulo: "EXISTS pregunta por existencia", bloques: [
      { t: "texto", txt: "EXISTS no compara valores: pregunta si la subconsulta devuelve al menos una fila. Y NOT EXISTS, si no devuelve ninguna." },
      { t: "codigo", sql: "SELECT p.sku,\n       p.nombre\n  FROM productos p\n WHERE NOT EXISTS (SELECT 1\n                     FROM ventas v\n                    WHERE v.producto_id = p.id)\n ORDER BY p.id;", explica: "Los productos que nunca se vendieron. El SELECT 1 es una convencion: no importa que traiga, solo si trae algo." }
    ]},
    { titulo: "Por que NOT IN te va a morder", bloques: [
      { t: "texto", txt: "NOT IN parece equivalente a NOT EXISTS, hasta que la subconsulta devuelve un NULL. Entonces la comparacion pasa a desconocida y no sale ninguna fila. Cero. Sin error." },
      { t: "tabla", cab: ["Escribes", "Si hay un NULL en la lista", "Recomendacion"], filas: [
        ["x IN (...)", "funciona", "ok"],
        ["x NOT IN (...)", "devuelve cero filas siempre", "evitalo"],
        ["NOT EXISTS (...)", "funciona", "usa este"]
      ]},
      { t: "nota", tono: "regla", txt: "Para preguntar por ausencia, NOT EXISTS. Siempre." }
    ]},
    { titulo: "CASE: clasificar cada fila", bloques: [
      { t: "texto", txt: "CASE evalua los WHEN en orden y se queda con el primero verdadero. El orden lo decide todo." },
      { t: "codigo", sql: "SELECT p.nombre,\n       p.stock,\n       CASE\n         WHEN p.stock  = 0  THEN 'Agotado'\n         WHEN p.stock <= 10 THEN 'Reponer'\n         ELSE                    'OK'\n       END AS alerta\n  FROM productos p\n ORDER BY p.stock\n LIMIT 8;" },
      { t: "nota", tono: "ojo", txt: "Si pusieras stock <= 10 antes que stock = 0, ningun producto llegaria nunca a 'Agotado': el cero tambien es menor o igual a diez. Del mas especifico al mas general." },
      { t: "prueba", pide: "Clasifica los empleados: 20000 o mas es 'Alto', el resto 'Normal'. Muestra nombre y la columna rango. Ordena por salario descendente y limita a 5.",
        sol: "SELECT e.nombre, CASE WHEN e.salario >= 20000 THEN 'Alto' ELSE 'Normal' END AS rango FROM empleados e ORDER BY e.salario DESC LIMIT 5;",
        pista: "Un CASE con un solo WHEN y un ELSE, con su alias AS rango." }
    ]},
    { titulo: "COALESCE: un plan B para el NULL", bloques: [
      { t: "texto", txt: "COALESCE devuelve el primer valor que no sea nulo. Sirve para que un reporte no muestre huecos." },
      { t: "codigo", sql: "SELECT p.sku,\n       COALESCE(p.descripcion, 'Sin descripcion') AS descripcion\n  FROM productos p\n ORDER BY p.id\n LIMIT 8;" },
      { t: "nota", tono: "regla", txt: "Un SUM sobre un conjunto vacio devuelve NULL, no cero. Por eso los reportes de totales casi siempre llevan COALESCE(SUM(x), 0)." }
    ]},
    { titulo: "Subconsulta en el SELECT", bloques: [
      { t: "texto", txt: "Una subconsulta tambien puede ir entre las columnas, y se evalua una vez por fila." },
      { t: "codigo", sql: "SELECT e.nombre,\n       (SELECT COUNT(*)\n          FROM ventas v\n         WHERE v.empleado_id = e.id) AS ventas\n  FROM empleados e\n ORDER BY ventas DESC\n LIMIT 6;", explica: "Para cada empleado, cuenta sus ventas. Es lo mismo que un LEFT JOIN con GROUP BY, escrito de otra forma." },
      { t: "nota", tono: "ojo", txt: "Con tablas grandes esto puede ser lento: se ejecuta una vez por fila. Con un LEFT JOIN el motor suele resolverlo mejor." },
      { t: "prueba", pide: "Muestra el nombre de la sucursal y cuantos empleados tiene (columna empleados), usando una subconsulta en el SELECT. Ordena por empleados descendente.",
        sol: "SELECT s.nombre, (SELECT COUNT(*) FROM empleados e WHERE e.sucursal_id = s.id) AS empleados FROM sucursales s ORDER BY empleados DESC;",
        pista: "La subconsulta va entre parentesis dentro del SELECT y se relaciona con s.id en su WHERE." }
    ]}
  ]
},

/* ============================ 6. LA FORJA ============================ */
{
  reino: "forja", titulo: "Cambiar la forma de la tabla", xp: 85,
  intro: "Hasta aqui solo leiste. ALTER cambia la estructura, y algunos golpes no se pueden deshacer.",
  pasos: [
    { titulo: "DDL contra DML", bloques: [
      { t: "texto", txt: "Hay dos familias de sentencias, y confundirlas sale caro." },
      { t: "tabla", cab: ["Familia", "Sentencias", "Que cambia"], filas: [
        ["DML", "SELECT, INSERT, UPDATE, DELETE", "el contenido"],
        ["DDL", "CREATE, ALTER, DROP", "la estructura"]
      ]},
      { t: "nota", tono: "dato", txt: "En PostgreSQL el DDL es transaccional: dentro de una transaccion se puede revertir. En Oracle no: hace COMMIT implicito antes y despues." }
    ]},
    { titulo: "Agregar una columna", bloques: [
      { t: "codigo", sql: "ALTER TABLE productos\n  ADD COLUMN peso_kg NUMERIC(6,2);", explica: "Las filas existentes quedan con NULL en la columna nueva." },
      { t: "texto", txt: "Si la columna debe ser obligatoria, hace falta decirle con que llenar las filas que ya estan:" },
      { t: "codigo", sql: "ALTER TABLE productos\n  ADD COLUMN peso_kg NUMERIC(6,2) DEFAULT 0 NOT NULL;" },
      { t: "nota", tono: "regla", txt: "NOT NULL sin DEFAULT falla si la tabla ya tiene filas. El motor tendria que poner NULL justo donde lo acabas de prohibir." }
    ]},
    { titulo: "Restricciones: reglas que el motor hace cumplir", bloques: [
      { t: "texto", txt: "Una restriccion no es una sugerencia: el motor rechaza cualquier INSERT o UPDATE que la viole, escriba quien escriba." },
      { t: "codigo", sql: "ALTER TABLE productos\n  ADD CONSTRAINT ck_precio_pos CHECK (precio > 0);" },
      { t: "nota", tono: "ojo", txt: "Ponle nombre tu. Si dejas que el motor lo invente, el error en produccion dira algo como productos_precio_check y no te dira nada util a las tres de la manana." },
      { t: "texto", txt: "Y una restriccion no repara datos: los verifica. Si ya hay filas que la violan, el ALTER falla y hay que limpiar primero." },
      { t: "prueba", pide: "Agrega a la tabla empleados una columna correo, de texto de hasta 100 caracteres.",
        sol: "ALTER TABLE empleados ADD COLUMN correo VARCHAR(100);",
        pista: "ALTER TABLE, la accion ADD COLUMN, el nombre y el tipo VARCHAR con la longitud." }
    ]},
    { titulo: "Quitar y renombrar", bloques: [
      { t: "texto", txt: "Ademas de agregar, ALTER puede quitar una columna o cambiarle el nombre." },
      { t: "tabla", cab: ["Quieres", "Escribes", "Reversible"], filas: [
        ["agregar", "ADD COLUMN x TIPO", "si, con DROP"],
        ["renombrar", "RENAME COLUMN vieja TO nueva", "si"],
        ["eliminar", "DROP COLUMN x", "NO: los datos se van"]
      ]},
      { t: "codigo", sql: "ALTER TABLE productos\n  RENAME COLUMN stock TO existencias;" },
      { t: "nota", tono: "ojo", txt: "DROP COLUMN no pide confirmacion y no hay deshacer. En produccion se hace en dos pasos: primero se deja de usar, semanas despues se elimina." }
    ]},
    { titulo: "Tipos: elegir bien desde el principio", bloques: [
      { t: "tabla", cab: ["Para", "Usa", "Por que"], filas: [
        ["dinero", "NUMERIC(10,2)", "exacto; FLOAT redondea mal"],
        ["texto corto", "VARCHAR(n)", "limita y documenta"],
        ["enteros", "INTEGER o BIGINT", "BIGINT para ids"],
        ["fechas", "DATE o TIMESTAMP", "permite comparar y extraer"]
      ]},
      { t: "nota", tono: "regla", txt: "Nunca guardes dinero en FLOAT. Un precio de 0.1 mas 0.2 no da 0.3 en binario, y ese centavo aparece en el cierre de mes." },
      { t: "prueba", pide: "Agrega a la tabla sucursales una columna presupuesto, numerica con dos decimales, que arranque en 0 y no admita nulos.",
        sol: "ALTER TABLE sucursales ADD COLUMN presupuesto NUMERIC(12,2) DEFAULT 0 NOT NULL;",
        pista: "NUMERIC con precision y escala, mas DEFAULT y NOT NULL en la misma sentencia." }
    ]}
  ]
},

/* ============================ 7. EL TEMPLO ============================ */
{
  reino: "templo", titulo: "Modificar datos sin romper nada", xp: 90,
  intro: "UPDATE es la sentencia mas util y la mas peligrosa del idioma. La diferencia esta en una sola clausula.",
  pasos: [
    { titulo: "Todo UPDATE nace como SELECT", bloques: [
      { t: "texto", txt: "Antes de cambiar nada, escribe el SELECT con el mismo WHERE y mira cuantas filas salen. Si el numero te sorprende, el WHERE esta mal." },
      { t: "codigo", sql: "SELECT p.id, p.nombre, p.precio\n  FROM productos p\n WHERE p.categoria = 'Electrico';", explica: "Cuatro filas. Ese es el alcance del cambio que viene." },
      { t: "codigo", sql: "UPDATE productos p\n   SET precio = ROUND(p.precio * 1.10, 2)\n WHERE p.categoria = 'Electrico';", explica: "Mismo WHERE, ahora si el cambio." },
      { t: "nota", tono: "regla", txt: "Sin WHERE, el UPDATE toca la tabla completa. Es el error mas caro de SQL y no da ninguna advertencia." }
    ]},
    { titulo: "El lado derecho lee, el izquierdo escribe", bloques: [
      { t: "texto", txt: "En el SET, la parte derecha del igual puede leer la fila actual. Por eso se puede calcular el valor nuevo a partir del viejo." },
      { t: "codigo", sql: "UPDATE empleados e\n   SET salario = e.salario + 500\n WHERE e.puesto = 'Cajero';" },
      { t: "nota", tono: "ojo", txt: "En PostgreSQL el alias NO puede ir del lado izquierdo. SET e.salario da el error 'column e of relation empleados does not exist'. Oracle si lo acepta, y por eso el codigo migrado truena." }
    ]},
    { titulo: "Condiciones defensivas", bloques: [
      { t: "texto", txt: "A veces no quieres que la sentencia falle: quieres que simplemente no toque las filas problematicas." },
      { t: "codigo", sql: "UPDATE productos p\n   SET stock = p.stock - 5\n WHERE p.categoria = 'Pintura'\n   AND p.stock     >= 5;", explica: "Los que tienen menos de 5 piezas no se tocan, y el inventario nunca queda en negativo." },
      { t: "texto", txt: "Y una condicion extra puede hacer la sentencia repetible: correrla dos veces no cambia nada la segunda vez." },
      { t: "codigo", sql: "UPDATE productos p\n   SET descontinuado = 1\n WHERE p.descontinuado = 0\n   AND NOT EXISTS (SELECT 1 FROM ventas v WHERE v.producto_id = p.id);" },
      { t: "prueba", pide: "Sube 200 pesos el salario de los empleados de la sucursal 2.",
        sol: "UPDATE empleados e SET salario = e.salario + 200 WHERE e.sucursal_id = 2;",
        pista: "El valor nuevo se calcula desde el actual, y el filtro es por sucursal_id." }
    ]},
    { titulo: "UPDATE con CASE: varios valores de una vez", bloques: [
      { t: "texto", txt: "Cuando el valor nuevo depende de cada fila, CASE resuelve todo en una sola pasada." },
      { t: "codigo", sql: "UPDATE productos p\n   SET precio = CASE\n                  WHEN p.stock = 0   THEN ROUND(p.precio * 0.90, 2)\n                  WHEN p.stock > 100 THEN ROUND(p.precio * 0.95, 2)\n                  ELSE                    p.precio\n                END;", explica: "Rebaja distinta segun el stock, sin tocar a los demas." },
      { t: "nota", tono: "regla", txt: "El ELSE que devuelve la columna sin cambios es importante: sin el, las filas que no cumplen ninguna condicion quedarian en NULL." }
    ]},
    { titulo: "DELETE y por que da mas miedo", bloques: [
      { t: "texto", txt: "DELETE borra filas enteras. Mismo esquema que UPDATE: sin WHERE, se lleva la tabla completa." },
      { t: "codigo", sql: "SELECT COUNT(*) AS van_a_morir\n  FROM ventas v\n WHERE v.total < 100;", explica: "El SELECT de reconocimiento. Siempre antes." },
      { t: "tabla", cab: ["Sentencia", "Que hace", "Se puede revertir"], filas: [
        ["DELETE FROM t WHERE ...", "borra las filas que cumplen", "dentro de una transaccion, si"],
        ["DELETE FROM t", "borra todas las filas", "dentro de una transaccion, si"],
        ["TRUNCATE t", "vacia la tabla, mas rapido", "no siempre; no dispara triggers"]
      ]},
      { t: "nota", tono: "ojo", txt: "Si otra tabla apunta a la fila que borras con una llave foranea, el motor te detiene. Eso no es un obstaculo: es la base protegiendose." },
      { t: "prueba", pide: "Sube el salario 1000 a los empleados que ganan menos de 12000.",
        sol: "UPDATE empleados e SET salario = e.salario + 1000 WHERE e.salario < 12000;",
        pista: "El valor nuevo se calcula desde el actual y el filtro compara el salario." }
    ]}
  ]
},

/* ============================ 8. LA CADENA ============================ */
{
  reino: "lealtad", titulo: "Como se hace una migracion", xp: 100,
  intro: "Un cambio real nunca es una sola sentencia. Es una secuencia, y el orden importa mas que cada pieza.",
  pasos: [
    { titulo: "Los siete pasos", bloques: [
      { t: "texto", txt: "Cuando hay que agregar un dato a una tabla que ya esta en produccion, el orden es siempre el mismo:" },
      { t: "tabla", cab: ["#", "Paso", "Por que"], filas: [
        ["1", "Abrir la columna", "con DEFAULT, para que las filas existentes sean validas desde el primer segundo"],
        ["2", "Medir", "un SELECT que diga cuantas filas y con que valores vas a trabajar"],
        ["3", "Proteger", "la restriccion va ANTES de cargar, no despues"],
        ["4", "Cargar", "el UPDATE que pone los datos"],
        ["5", "Verificar", "otro SELECT que confirme que la carga quedo bien"],
        ["6", "Clasificar", "los cambios derivados, si los hay"],
        ["7", "Reportar", "recien ahora el reporte para quien lo pidio"]
      ]},
      { t: "nota", tono: "regla", txt: "El paso 3 antes del 4 es lo que separa una migracion de un desastre: si el UPDATE tiene un error de signo, la sentencia falla en vez de dejar basura." }
    ]},
    { titulo: "Por que medir antes", bloques: [
      { t: "texto", txt: "El SELECT del paso 2 no es burocracia: es lo que justifica el UPDATE. Si el numero de filas no cuadra ahi, el cambio siguiente repartiria mal y nadie se enteraria hasta la nomina." },
      { t: "codigo", sql: "SELECT e.id,\n       e.nombre,\n       COALESCE(SUM(v.total), 0) AS importe\n  FROM empleados   e\n  LEFT JOIN ventas v ON v.empleado_id = e.id\n GROUP BY e.id, e.nombre\n ORDER BY importe DESC\n LIMIT 6;", explica: "COALESCE convierte en 0 la suma vacia. Sin el, los que no vendieron saldrian en NULL." }
    ]},
    { titulo: "Dos columnas, una sola sentencia", bloques: [
      { t: "texto", txt: "Cuando un cambio afecta dos columnas, van juntas. En dos sentencias existe un instante en el que la tabla esta a medias." },
      { t: "codigo", sql: "UPDATE empleados e\n   SET activo = 0,\n       puesto = 'Baja'\n WHERE e.id = 999;", explica: "Ese id no existe: afecta 0 filas. Es un ejemplo de forma, no de efecto." },
      { t: "nota", tono: "dato", txt: "Un UPDATE es atomico: o cambian todas las filas que cumplen el WHERE, o no cambia ninguna." },
      { t: "prueba", pide: "Practica el paso 1 de una migracion: agrega a la tabla ventas una columna revisada, numerica entera, que nunca sea nula y arranque en 0.",
        sol: "ALTER TABLE ventas ADD COLUMN revisada INTEGER DEFAULT 0 NOT NULL;",
        pista: "ADD COLUMN con tipo INTEGER, un DEFAULT que de valor a las 96 filas que ya existen, y NOT NULL." }
    ]},
    { titulo: "Transacciones: todo o nada", bloques: [
      { t: "texto", txt: "Una transaccion agrupa varias sentencias en una sola unidad: o se aplican todas, o ninguna." },
      { t: "tabla", cab: ["Palabra", "Que hace"], filas: [
        ["BEGIN", "abre la transaccion"],
        ["COMMIT", "confirma todos los cambios"],
        ["ROLLBACK", "deshace todo lo hecho desde el BEGIN"]
      ]},
      { t: "texto", txt: "En esta consola cada desafio tiene su propia copia de la base y el boton Restaurar hace las veces de ROLLBACK. Pero en produccion, una migracion de varios pasos va dentro de una transaccion." },
      { t: "nota", tono: "regla", txt: "La regla practica: si dos sentencias tienen que ser verdad al mismo tiempo, van en la misma transaccion. Un traspaso entre dos cuentas es el ejemplo clasico." }
    ]},
    { titulo: "Una migracion que se puede repetir", bloques: [
      { t: "texto", txt: "Una sentencia idempotente se puede correr dos veces sin cambiar nada la segunda. Es lo que permite reintentar una migracion sin miedo." },
      { t: "codigo", sql: "SELECT COUNT(*) AS pendientes\n  FROM empleados e\n WHERE e.activo = 1\n   AND NOT EXISTS (SELECT 1 FROM ventas v WHERE v.empleado_id = e.id);", explica: "Si despues del UPDATE este numero es 0, la migracion ya se aplico completa." },
      { t: "nota", tono: "dato", txt: "El truco es siempre el mismo: agregar al WHERE la condicion de que la fila todavia no este en el estado final." }
    ]}
  ]
},

/* ============================ 9. LA CIMA ============================ */
{
  reino: "cima", titulo: "Ver la fila y el conjunto a la vez", xp: 120,
  intro: "GROUP BY colapsa las filas. Las funciones de ventana no. Esa sola diferencia cambia como piensas el SQL.",
  pasos: [
    { titulo: "CTE: ponerle nombre a un resultado", bloques: [
      { t: "texto", txt: "WITH declara un resultado intermedio con nombre, y despues lo usas como si fuera una tabla. No es mas rapido que una subconsulta; es muchisimo mas legible." },
      { t: "codigo", sql: "WITH caros AS (\n  SELECT p.nombre,\n         p.precio\n    FROM productos p\n   WHERE p.precio > 1000\n)\nSELECT c.nombre,\n       c.precio\n  FROM caros c\n ORDER BY c.precio DESC;" },
      { t: "nota", tono: "dato", txt: "Puedes encadenar varios CTE separados por coma, y cada uno puede usar los anteriores." }
    ]},
    { titulo: "OVER: agregar sin colapsar", bloques: [
      { t: "texto", txt: "Un agregado normal devuelve una fila. El mismo agregado con OVER devuelve el valor del grupo en CADA fila, sin perder ninguna." },
      { t: "codigo", sql: "SELECT e.nombre,\n       e.salario,\n       SUM(e.salario) OVER (PARTITION BY e.sucursal_id) AS total_sucursal\n  FROM empleados e\n ORDER BY e.id\n LIMIT 8;", explica: "Cada empleado ve su salario y, al lado, el total de su sucursal." },
      { t: "tabla", cab: ["Escribes", "Obtienes"], filas: [
        ["SUM(x)", "una fila con el total"],
        ["SUM(x) OVER ()", "el total general en cada fila"],
        ["SUM(x) OVER (PARTITION BY g)", "el total del grupo en cada fila"],
        ["SUM(x) OVER (ORDER BY c)", "el acumulado hasta la fila actual"]
      ]}
    ]},
    { titulo: "Numerar y rankear", bloques: [
      { t: "codigo", sql: "SELECT e.nombre,\n       e.sucursal_id,\n       ROW_NUMBER() OVER (PARTITION BY e.sucursal_id\n                              ORDER BY e.salario DESC) AS lugar\n  FROM empleados e\n ORDER BY e.sucursal_id, lugar;", explica: "PARTITION BY reinicia la numeracion en cada sucursal." },
      { t: "tabla", cab: ["Funcion", "Con empates da", "Cuando usarla"], filas: [
        ["ROW_NUMBER()", "1, 2, 3", "cuando necesitas un ganador unico"],
        ["RANK()", "1, 1, 3", "cuando los empates comparten lugar y dejan hueco"],
        ["DENSE_RANK()", "1, 1, 2", "cuando comparten lugar sin dejar hueco"]
      ]}
    ]},
    { titulo: "El patron top-N por grupo", bloques: [
      { t: "texto", txt: "No se puede filtrar por una funcion de ventana en el WHERE de la misma consulta: la ventana se calcula despues. La solucion son dos niveles." },
      { t: "codigo", sql: "WITH ranking AS (\n  SELECT s.nombre AS sucursal,\n         e.nombre AS vendedor,\n         SUM(v.total) AS importe,\n         ROW_NUMBER() OVER (PARTITION BY s.id\n                                ORDER BY SUM(v.total) DESC) AS lugar\n    FROM empleados   e\n    JOIN sucursales  s ON s.id = e.sucursal_id\n    JOIN ventas      v ON v.empleado_id = e.id\n   GROUP BY s.id, s.nombre, e.nombre\n)\nSELECT r.sucursal, r.vendedor, r.importe\n  FROM ranking r\n WHERE r.lugar = 1\n ORDER BY r.importe DESC;" },
      { t: "nota", tono: "regla", txt: "Ventana dentro de un CTE, filtro afuera. Es la consulta de reporte que mas se pide, y la que mas gente resuelve con tres subconsultas anidadas cuando bastan diez lineas." },
      { t: "prueba", pide: "Muestra sku, precio y el lugar por precio descendente dentro de cada categoria (columna lugar). Ordena por categoria y lugar, limita a 6.",
        sol: "SELECT p.sku, p.precio, ROW_NUMBER() OVER (PARTITION BY p.categoria ORDER BY p.precio DESC) AS lugar FROM productos p ORDER BY p.categoria, lugar LIMIT 6;",
        pista: "ROW_NUMBER() con PARTITION BY la categoria y ORDER BY el precio, todo dentro del OVER." }
    ]},
    { titulo: "Comparar con la fila vecina", bloques: [
      { t: "texto", txt: "Con un acumulado y el total de la particion se puede calcular cuanto aporta cada fila al grupo." },
      { t: "codigo", sql: "SELECT e.nombre,\n       e.salario,\n       ROUND(100.0 * e.salario / SUM(e.salario) OVER (PARTITION BY e.sucursal_id), 1) AS pct_sucursal\n  FROM empleados e\n ORDER BY e.sucursal_id, pct_sucursal DESC;" },
      { t: "nota", tono: "dato", txt: "El 100.0 con punto no es casualidad: obliga a division decimal. Con 100 entero, algunos motores truncan el resultado." }
    ]},
    { titulo: "Varios CTE encadenados", bloques: [
      { t: "texto", txt: "Se pueden declarar varios CTE separados por coma, y cada uno puede usar los anteriores. Asi una consulta larga se lee como una receta." },
      { t: "codigo", sql: "WITH por_empleado AS (\n  SELECT v.empleado_id,\n         SUM(v.total) AS importe\n    FROM ventas v\n   GROUP BY v.empleado_id\n),\ncon_nombre AS (\n  SELECT e.nombre,\n         pe.importe\n    FROM por_empleado pe\n    JOIN empleados    e ON e.id = pe.empleado_id\n)\nSELECT c.nombre,\n       c.importe\n  FROM con_nombre c\n ORDER BY c.importe DESC\n LIMIT 5;" },
      { t: "nota", tono: "regla", txt: "Si una consulta tiene mas de dos subconsultas anidadas, casi siempre se lee mejor como CTE encadenados. El motor hace lo mismo; el humano no." },
      { t: "prueba", pide: "Con un CTE llamado caros que traiga los productos de precio mayor a 500 (nombre, categoria, precio), muestra desde el CTE la categoria y cuantos productos caros tiene (columna n). Ordena por n descendente y luego por categoria.",
        sol: "WITH caros AS (SELECT p.nombre, p.categoria, p.precio FROM productos p WHERE p.precio > 500) SELECT c.categoria, COUNT(*) AS n FROM caros c GROUP BY c.categoria ORDER BY n DESC, c.categoria;",
        pista: "Primero el WITH con el filtro de precio, y afuera un GROUP BY por categoria contando las filas." }
    ]}
  ]
},
/* ============================ 10. EL VACIO ============================ */
{
  reino: "vacio", titulo: "Destruccion controlada", xp: 130,
  intro: "Borrar es el mayor poder que tendras; usalo mal y te quedaras sin trabajo antes del almuerzo.",
  pasos: [
    { titulo: "DELETE es un bisturi", bloques: [
      { t: "texto", txt: "DELETE elimina filas enteras de una tabla. El WHERE es la unica linea de defensa entre borrar lo que no sirve y vaciar la tabla por accidente." },
      { t: "codigo", sql: "SELECT * FROM ventas WHERE total < 50;", explica: "Al igual que con el UPDATE, escribe primero el SELECT." },
      { t: "nota", tono: "regla", txt: "Un DELETE sin WHERE vacia la tabla entera." }
    ]},
    { titulo: "TRUNCATE es un mazo", bloques: [
      { t: "texto", txt: "TRUNCATE TABLE vacia la tabla de golpe. Es mucho mas rapido que DELETE porque no guarda registro fila por fila." },
      { t: "tabla", cab: ["Comando", "Velocidad", "Condicion"], filas: [
        ["DELETE", "Lento (fila por fila)", "Soporta WHERE"],
        ["TRUNCATE", "Inmediato", "Todo o nada (sin WHERE)"]
      ]},
      { t: "prueba", pide: "Borra de la tabla productos todos los de la categoria 'Accesorios'.",
        sol: "DELETE FROM productos WHERE categoria = 'Accesorios';",
        pista: "Usa DELETE FROM y filtra con WHERE igual que en un SELECT." }
    ]},
    { titulo: "Lo que se borra se lleva a sus vecinos", bloques: [
      { t: "texto", txt: "Una fila casi nunca esta sola. Si otra tabla la referencia con una llave foranea, el motor no te deja borrarla, y hace bien: te esta avisando que ibas a dejar huerfano un registro." },
      { t: "codigo", sql: "SELECT COUNT(*) AS ventas_del_producto\n  FROM ventas v\n WHERE v.producto_id = 3;", explica: "Antes de borrar el producto 3, mira cuantas ventas lo apuntan." },
      { t: "nota", tono: "regla", txt: "Cuando el motor rechaza un DELETE por una llave foranea, la respuesta casi nunca es forzarlo. Es preguntarse si ese dato deberia desaparecer o solo marcarse como inactivo." }
    ]},
    { titulo: "Borrado logico: la alternativa que casi siempre gana", bloques: [
      { t: "texto", txt: "En sistemas reales rara vez se borra de verdad. Se marca la fila como inactiva y se deja de mostrar. El historial sobrevive y el error se puede deshacer." },
      { t: "codigo", sql: "UPDATE productos p\n   SET descontinuado = 1\n WHERE p.stock = 0;", explica: "Nadie perdio nada. El producto deja de ofrecerse y sus ventas viejas siguen cuadrando." },
      { t: "tabla", cab: ["", "Borrado fisico", "Borrado logico"], filas: [
        ["sentencia", "DELETE", "UPDATE de una bandera"],
        ["historial", "se pierde", "se conserva"],
        ["reversible", "solo en transaccion", "siempre"],
        ["consultas", "mas simples", "hay que filtrar siempre"]
      ]},
      { t: "nota", tono: "dato", txt: "El precio del borrado logico es que cada consulta tiene que acordarse de filtrar. El dia que alguien lo olvide, un producto descontinuado aparecera en el catalogo." }
    ]},
    { titulo: "La regla de los tres pasos", bloques: [
      { t: "texto", txt: "Todo borrado en produccion sigue la misma secuencia. Saltarse el primer paso es como se pierden las tardes." },
      { t: "tabla", cab: ["#", "Paso", "Para que"], filas: [
        ["1", "SELECT con el mismo WHERE", "ver exactamente cuantas y cuales filas caen"],
        ["2", "Respaldo o transaccion abierta", "poder volver atras"],
        ["3", "DELETE con ese WHERE identico", "ejecutar lo que ya verificaste"]
      ]},
      { t: "codigo", sql: "SELECT p.id, p.nombre, p.precio\n  FROM productos p\n WHERE p.precio < 300\n   AND NOT EXISTS (SELECT 1 FROM ventas v WHERE v.producto_id = p.id);", explica: "El paso 1 del jefe de este reino. Dos filas: ese es el alcance." },
      { t: "prueba", pide: "Practica el paso 1: cuenta cuantas ventas tienen un total menor a 150. Llama a la columna n.",
        sol: "SELECT COUNT(*) AS n FROM ventas v WHERE v.total < 150;",
        pista: "COUNT(*) con su alias, y el filtro sobre la columna total." }
    ]}
  ]
}
];

export const leccionDe = (reino: string) => LECCIONES.find((l) => l.reino === reino);
export const totalPasos = (l: Leccion) => l.pasos.length;