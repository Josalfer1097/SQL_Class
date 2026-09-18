/* Ejercicios 31-40: CADENA "programa de lealtad".
   Cada paso trabaja sobre el estado que dejo el paso anterior.
   El motor arma la base aplicando las soluciones de referencia de los pasos previos,
   asi que nadie se queda atorado por un error arrastrado. */
(function (root) {
"use strict";
var C = [
{
  n: 31, dif: "cadena", tema: "ALTER", titulo: "Paso 1 · Abrir el campo",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 1,
  pide: "Arranca el programa: agrega a la tabla sucursales una columna meta_mensual, numerica con dos decimales, que nunca sea nula y arranque en 0.",
  tips: ["La tabla ya tiene filas: sin DEFAULT el NOT NULL no puede cumplirse.", "Este es el primer paso de una cadena: los siguientes trabajan sobre lo que dejes aqui."],
  pistas: ["La tabla ya tiene filas, asi que una columna obligatoria necesita con que llenarlas desde el primer momento.", "ADD COLUMN con tipo NUMERIC(12,2), un DEFAULT y NOT NULL, todo en la misma sentencia.", "ADD COLUMN meta_mensual _______(12,2) _______ 0 ___ ____;"],
  sol: "ALTER TABLE sucursales\n  ADD COLUMN meta_mensual NUMERIC(12,2) DEFAULT 0 NOT NULL;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Abrir la columna con DEFAULT y NOT NULL en la misma sentencia deja la tabla consistente desde el primer segundo: no hay una ventana en la que existan filas con el dato vacio.",
  reto: "Abre el modelo (boton Modelo) y busca la columna nueva al final de empleados."
},
{
  n: 32, dif: "cadena", tema: "SELECT", titulo: "Paso 2 · Medir antes de tocar",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 2,
  pide: "Mide antes de tocar: por cada sucursal muestra su id, su nombre y el importe vendido historico (columna importe). Incluye las que no han vendido nada, con 0. Ordena por importe descendente y luego por id.",
  tips: ["Todo cambio masivo nace como SELECT: primero mides, luego escribes.", "SUM sobre un conjunto vacio devuelve NULL, no 0."],
  pistas: ["Las ventas no cuelgan de la sucursal directamente: hay que pasar por empleados. Y ninguna sucursal puede desaparecer del reporte.", "Dos LEFT JOIN encadenados, GROUP BY por sucursal, y COALESCE para que la suma vacia sea 0 en vez de NULL.", "FROM sucursales s LEFT JOIN empleados e ON ... LEFT JOIN ventas v ON ... ________(SUM(v.total), 0)"],
  sol: "SELECT s.id,\n       s.nombre,\n       COALESCE(SUM(v.total), 0) AS importe\n  FROM sucursales     s\n  LEFT JOIN empleados e ON e.sucursal_id = s.id\n  LEFT JOIN ventas    v ON v.empleado_id = e.id\n GROUP BY s.id, s.nombre\n ORDER BY importe DESC, s.id;",
  check: { tipo: "rows", ordered: true },
  aprende: "Este SELECT es el que justifica el UPDATE que viene. Si el numero de filas o los importes no cuadran aqui, el cambio siguiente repartiria puntos mal y nadie se enteraria hasta la nomina.",
  reto: "Cuenta cuantos empleados salen con importe 0. Ese numero deberia coincidir con los que no reciben puntos en el paso 4."
},
{
  n: 33, dif: "cadena", tema: "ALTER", titulo: "Paso 3 · Poner el candado",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 3,
  pide: "Pon el candado: impide que la meta mensual sea negativa con una restriccion llamada ck_sucursales_meta.",
  tips: ["La regla se declara una vez y el motor la aplica siempre, sin importar quien escriba."],
  pistas: ["La regla va antes de cargar los datos, no despues: asi un error de signo hace fallar la carga en vez de ensuciarla.", "ADD CONSTRAINT con el nombre pedido, la palabra CHECK y la condicion entre parentesis.", "ADD CONSTRAINT ck_sucursales_meta _____ (meta_mensual __ 0);"],
  sol: "ALTER TABLE sucursales\n  ADD CONSTRAINT ck_sucursales_meta CHECK (meta_mensual >= 0);",
  check: { tipo: "state", tabla: "empleados", constraints: true },
  aprende: "La restriccion va antes de cargar los datos, no despues. Asi, si el UPDATE del siguiente paso tuviera un error de signo, la sentencia falla en vez de dejar basura en la tabla.",
  reto: "Intenta despues un UPDATE que ponga puntos en -5 y observa como el motor lo rechaza."
},
{
  n: 34, dif: "cadena", tema: "UPDATE", titulo: "Paso 4 · Repartir los puntos",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 4,
  pide: "Carga las metas: asigna a cada sucursal una meta igual al 10% de lo que ha vendido historicamente, redondeado a dos decimales. Las que no han vendido nada se quedan en 0.",
  tips: ["El importe de cada empleado vive en ventas: necesitas una subconsulta correlacionada.", "COALESCE evita que un empleado sin ventas reciba NULL."],
  pistas: ["Cada sucursal necesita su propio total. Eso significa una consulta que se evalua una vez por fila.", "Una subconsulta correlacionada dentro del SET, envuelta en COALESCE para las sucursales sin ventas, y todo por 0.10.", "SET meta_mensual = ROUND(________((SELECT SUM(v.total) FROM ventas v JOIN empleados e ON ... WHERE e.sucursal_id = s.__), 0) * ____, 2)"],
  sol: "UPDATE sucursales s\n   SET meta_mensual = ROUND(COALESCE((SELECT SUM(v.total)\n                                        FROM ventas    v\n                                        JOIN empleados e ON e.id = v.empleado_id\n                                       WHERE e.sucursal_id = s.id), 0) * 0.10, 2);",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Dos cosas en una sentencia. Una subconsulta correlacionada se evalua una vez por cada fila externa: para cada empleado, el motor va a ventas y suma lo suyo. Y ojo con CAST a INTEGER: en PostgreSQL redondea, no trunca, asi que 2.6 se convierte en 3. Si necesitas truncar de verdad, la funcion es FLOOR.",
  reto: "Corre un SELECT que compare puntos contra el importe del paso 2 y confirma que la cuenta cuadra."
},
{
  n: 35, dif: "cadena", tema: "SELECT", titulo: "Paso 5 · Verificar el reparto",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 5,
  pide: "Verifica la carga: muestra id, nombre y meta_mensual de las sucursales con meta mayor a 0, ordenadas por meta descendente.",
  tips: ["Un cambio masivo no termina cuando corre: termina cuando lo verificaste."],
  pistas: ["Un cambio masivo no termina cuando corre: termina cuando lo verificaste.", "Un SELECT simple sobre la columna que acabas de poblar, filtrando las que quedaron en cero.", "WHERE s.meta_mensual _ 0 ORDER BY s.meta_mensual ____"],
  sol: "SELECT s.id,\n       s.nombre,\n       s.meta_mensual\n  FROM sucursales s\n WHERE s.meta_mensual > 0\n ORDER BY s.meta_mensual DESC;",
  check: { tipo: "rows", ordered: true },
  aprende: "Verificar despues del cambio es tan importante como medir antes. Aqui puedes ver la columna puntos ya poblada: es el estado que dejo tu propio UPDATE del paso anterior.",
  reto: "Cambia el filtro a puntos = 0 y veras exactamente a los empleados sin ventas."
},
{
  n: 36, dif: "cadena", tema: "ALTER", titulo: "Paso 6 · Clasificar el nivel",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 6,
  pide: "Clasifica las plazas: agrega a sucursales una columna categoria_plaza, de texto de hasta 12 caracteres, con valor por defecto 'Nueva' y que no admita nulos.",
  tips: ["Mismo patron del paso 1: tipo, DEFAULT y NOT NULL en una sola linea."],
  pistas: ["Mismo patron del paso 1, pero con texto: el valor por defecto va entre comillas simples.", "ADD COLUMN con VARCHAR(12), DEFAULT con el texto y NOT NULL.", "ADD COLUMN categoria_plaza _______(12) _______ '_____' ___ ____;"],
  sol: "ALTER TABLE sucursales\n  ADD COLUMN categoria_plaza VARCHAR(12) DEFAULT 'Nueva' NOT NULL;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Un DEFAULT de texto se escribe entre comillas simples igual que cualquier literal. Al agregarse, todas las filas existentes quedan en 'Base' y a partir de ahi solo cambian las que tu decidas.",
  reto: "Abre el modelo y observa que empleados ya tiene dos columnas que no existian al empezar la cadena."
},
{
  n: 37, dif: "cadena", tema: "UPDATE", titulo: "Paso 7 · Asignar el nivel",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 7,
  pide: "Asigna la categoria segun la meta: 100000 o mas es 'Premium', 40000 o mas es 'Estandar', mas de 0 es 'Basica', y las que estan en 0 se quedan en 'Nueva'. Resuelvelo en un solo UPDATE.",
  tips: ["El orden de los WHEN importa: de lo mas especifico a lo mas general.", "Sin ELSE, los que no coincidan quedarian en NULL y la columna lo prohibe."],
  pistas: ["Cuatro etiquetas en una sola pasada. El orden de las reglas decide el resultado.", "Un CASE dentro del SET, con los cortes de mayor a menor y un ELSE al final para que nadie quede en NULL.", "SET categoria_plaza = ____ WHEN s.meta_mensual >= ______ THEN 'Premium' ... ____ 'Nueva' ___;"],
  sol: "UPDATE sucursales s\n   SET categoria_plaza = CASE\n                           WHEN s.meta_mensual >= 100000 THEN 'Premium'\n                           WHEN s.meta_mensual >=  40000 THEN 'Estandar'\n                           WHEN s.meta_mensual >      0  THEN 'Basica'\n                           ELSE                               'Nueva'\n                         END;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Un CASE dentro del SET resuelve en una sola pasada lo que de otro modo serian cuatro UPDATE con WHERE distintos: menos bloqueos, menos lecturas y ninguna ventana en la que la tabla este a medio clasificar.",
  reto: "Quita el ELSE y observa como la restriccion NOT NULL detiene la sentencia completa."
},
{
  n: 38, dif: "cadena", tema: "SELECT", titulo: "Paso 8 · Reporte por nivel",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 8,
  pide: "Reporta: por cada categoria_plaza muestra cuantas sucursales hay (columna sucursales) y la suma de sus metas (columna meta_total). Ordena por meta_total descendente.",
  tips: ["Una fila por nivel: eso es GROUP BY."],
  pistas: ["Una fila por categoria: eso es agrupar por la columna que acabas de poblar.", "GROUP BY sobre categoria_plaza, con COUNT para el numero y SUM para el total.", "GROUP BY s._______________ ORDER BY meta_total ____"],
  sol: "SELECT s.categoria_plaza,\n       COUNT(*)            AS sucursales,\n       SUM(s.meta_mensual) AS meta_total\n  FROM sucursales s\n GROUP BY s.categoria_plaza\n ORDER BY meta_total DESC;",
  check: { tipo: "rows", ordered: true },
  aprende: "Este reporte solo existe porque los siete pasos anteriores salieron bien. Es el patron real de una migracion: abrir columna, medir, proteger, cargar, verificar, clasificar y recien entonces reportar.",
  reto: "Agrega ROUND(AVG(e.puntos), 1) para ver el promedio por nivel."
},
{
  n: 39, dif: "cadena", tema: "UPDATE", titulo: "Paso 9 · Corregir sin romper",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 9,
  pide: "Corrige sin romper: las sucursales abiertas despues del 1 de enero de 2023 aun no deben tener meta. Ponles meta_mensual en 0 y categoria_plaza en 'Nueva', sin tocar a las demas.",
  tips: ["Un solo UPDATE puede cambiar dos columnas.", "El WHERE es lo que separa una correccion de un desastre."],
  pistas: ["Dos columnas cambian a la vez, y el filtro es por fecha. Hacerlo en dos sentencias dejaria un estado intermedio incoherente.", "Un solo UPDATE puede asignar dos columnas separandolas con coma. Las fechas se escriben con DATE 'aaaa-mm-dd'.", "SET meta_mensual = 0, categoria_plaza = '_____' WHERE s.fecha_apertura __ DATE '2023-01-01';"],
  sol: "UPDATE sucursales s\n   SET meta_mensual    = 0,\n       categoria_plaza = 'Nueva'\n WHERE s.fecha_apertura >= DATE '2023-01-01';",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Cambiar dos columnas en un solo UPDATE es una sola pasada y una sola transaccion: o quedan las dos o no queda ninguna. Hacerlo en dos sentencias abre una ventana en la que un empleado tiene 0 puntos pero sigue marcado como Oro.",
  reto: "Corre el reporte del paso 8 otra vez y compara como cambio el conteo de cada nivel."
},
{
  n: 40, dif: "cadena", tema: "SELECT", titulo: "Paso 10 · Cierre de la migracion",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 10,
  pide: "Cierre: por cada ciudad muestra su nombre (columna ciudad), cuantas sucursales con meta mayor a 0 tiene (columna con_meta) y la suma de metas (columna meta_total). Incluye todas las ciudades. Ordena por meta_total descendente y luego por ciudad.",
  tips: ["Todas las sucursales significa LEFT JOIN.", "Contar solo los premiados dentro de un grupo se hace con SUM(CASE WHEN ... THEN 1 ELSE 0 END).", "COALESCE protege la suma de las sucursales vacias."],
  pistas: ["Necesitas contar solo algunas filas dentro de cada grupo, sin perder las ciudades que no tienen ninguna.", "SUM(CASE WHEN condicion THEN 1 ELSE 0 END) cuenta condicionalmente dentro del GROUP BY.", "SUM(____ WHEN s.meta_mensual > 0 THEN _ ELSE _ ___) AS con_meta"],
  sol: "SELECT s.ciudad,\n       SUM(CASE WHEN s.meta_mensual > 0 THEN 1 ELSE 0 END) AS con_meta,\n       SUM(s.meta_mensual)                                 AS meta_total\n  FROM sucursales s\n GROUP BY s.ciudad\n ORDER BY meta_total DESC,\n          s.ciudad;",
  check: { tipo: "rows", ordered: true },
  aprende: "SUM(CASE WHEN condicion THEN 1 ELSE 0 END) es la forma de contar solo algunas filas dentro de un grupo, sin partir la consulta en dos. Combinado con LEFT JOIN y COALESCE, produce un reporte que no esconde a nadie.",
  reto: "Cambia el LEFT JOIN por JOIN y fijate cual sucursal desaparece del reporte."
}
];
root.EJERCICIOS_CADENA = C;
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).EJERCICIOS_CADENA;