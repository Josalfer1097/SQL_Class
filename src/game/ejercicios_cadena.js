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
  pide: "Comercial lanza un programa de puntos para los empleados. Agrega a la tabla empleados una columna puntos, numerica entera, que nunca sea nula y que arranque en 0.",
  tips: ["La tabla ya tiene filas: sin DEFAULT el NOT NULL no puede cumplirse.", "Este es el primer paso de una cadena: los siguientes trabajan sobre lo que dejes aqui."],
  pista: "Mismo patron del ejercicio 18: ADD COLUMN con tipo entero, el valor de arranque con DEFAULT y la obligatoriedad con NOT NULL. El DEFAULT tiene que ir para que las 18 filas existentes puedan cumplir el NOT NULL.",
  sol: "ALTER TABLE empleados\n  ADD COLUMN puntos INTEGER DEFAULT 0 NOT NULL;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Abrir la columna con DEFAULT y NOT NULL en la misma sentencia deja la tabla consistente desde el primer segundo: no hay una ventana en la que existan filas con el dato vacio.",
  reto: "Abre el modelo (boton Modelo) y busca la columna nueva al final de empleados."
},
{
  n: 32, dif: "cadena", tema: "SELECT", titulo: "Paso 2 · Medir antes de tocar",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 2,
  pide: "Antes de repartir puntos, saca el diagnostico: por cada empleado muestra su id, su nombre y el importe que ha vendido (columna importe). Incluye tambien a los que no han vendido nada, que deben aparecer con 0. Ordena por importe descendente y luego por id.",
  tips: ["Todo cambio masivo nace como SELECT: primero mides, luego escribes.", "SUM sobre un conjunto vacio devuelve NULL, no 0."],
  pista: "LEFT JOIN ventas v ON v.empleado_id = e.id, y envuelve la suma en COALESCE(SUM(v.total), 0).",
  sol: "SELECT e.id,\n       e.nombre,\n       COALESCE(SUM(v.total), 0) AS importe\n  FROM empleados   e\n  LEFT JOIN ventas v\n    ON v.empleado_id = e.id\n GROUP BY e.id, e.nombre\n ORDER BY importe DESC,\n          e.id;",
  check: { tipo: "rows", ordered: true },
  aprende: "Este SELECT es el que justifica el UPDATE que viene. Si el numero de filas o los importes no cuadran aqui, el cambio siguiente repartiria puntos mal y nadie se enteraria hasta la nomina.",
  reto: "Cuenta cuantos empleados salen con importe 0. Ese numero deberia coincidir con los que no reciben puntos en el paso 4."
},
{
  n: 33, dif: "cadena", tema: "ALTER", titulo: "Paso 3 · Poner el candado",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 3,
  pide: "Impide que los puntos puedan quedar en negativo. Agrega a empleados una restriccion llamada ck_empleados_puntos que exija puntos mayor o igual a cero.",
  tips: ["La regla se declara una vez y el motor la aplica siempre, sin importar quien escriba."],
  pista: "ADD CONSTRAINT con el nombre que te piden, seguido de CHECK y la condicion entre parentesis. La condicion compara la columna puntos contra cero.",
  sol: "ALTER TABLE empleados\n  ADD CONSTRAINT ck_empleados_puntos CHECK (puntos >= 0);",
  check: { tipo: "state", tabla: "empleados", constraints: true },
  aprende: "La restriccion va antes de cargar los datos, no despues. Asi, si el UPDATE del siguiente paso tuviera un error de signo, la sentencia falla en vez de dejar basura en la tabla.",
  reto: "Intenta despues un UPDATE que ponga puntos en -5 y observa como el motor lo rechaza."
},
{
  n: 34, dif: "cadena", tema: "UPDATE", titulo: "Paso 4 · Repartir los puntos",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 4,
  pide: "Asigna a cada empleado 1 punto por cada 1000 pesos vendidos, con la formula puntos = CAST(importe / 1000 AS INTEGER). Quien no ha vendido nada se queda en 0.",
  tips: ["El importe de cada empleado vive en ventas: necesitas una subconsulta correlacionada.", "COALESCE evita que un empleado sin ventas reciba NULL."],
  pista: "SET puntos = CAST(COALESCE((SELECT SUM(v.total) FROM ventas v WHERE v.empleado_id = e.id), 0) / 1000 AS INTEGER)",
  sol: "UPDATE empleados e\n   SET puntos = CAST(COALESCE((SELECT SUM(v.total)\n                                 FROM ventas v\n                                WHERE v.empleado_id = e.id), 0) / 1000 AS INTEGER);",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Dos cosas en una sentencia. Una subconsulta correlacionada se evalua una vez por cada fila externa: para cada empleado, el motor va a ventas y suma lo suyo. Y ojo con CAST a INTEGER: en PostgreSQL redondea, no trunca, asi que 2.6 se convierte en 3. Si necesitas truncar de verdad, la funcion es FLOOR.",
  reto: "Corre un SELECT que compare puntos contra el importe del paso 2 y confirma que la cuenta cuadra."
},
{
  n: 35, dif: "cadena", tema: "SELECT", titulo: "Paso 5 · Verificar el reparto",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 5,
  pide: "Comprueba el resultado: muestra id, nombre y puntos de los empleados que quedaron con mas de 0 puntos, ordenados por puntos descendente y luego por id.",
  tips: ["Un cambio masivo no termina cuando corre: termina cuando lo verificaste."],
  pista: "Un SELECT de tres columnas sobre empleados, con un WHERE que descarta a los que quedaron en cero y un ORDER BY de dos criterios: primero puntos de mayor a menor, luego id.",
  sol: "SELECT e.id,\n       e.nombre,\n       e.puntos\n  FROM empleados e\n WHERE e.puntos > 0\n ORDER BY e.puntos DESC,\n          e.id;",
  check: { tipo: "rows", ordered: true },
  aprende: "Verificar despues del cambio es tan importante como medir antes. Aqui puedes ver la columna puntos ya poblada: es el estado que dejo tu propio UPDATE del paso anterior.",
  reto: "Cambia el filtro a puntos = 0 y veras exactamente a los empleados sin ventas."
},
{
  n: 36, dif: "cadena", tema: "ALTER", titulo: "Paso 6 · Clasificar el nivel",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 6,
  pide: "El programa tiene niveles. Agrega a empleados una columna nivel, de texto de hasta 10 caracteres, con valor por defecto 'Base' y que no admita nulos.",
  tips: ["Mismo patron del paso 1: tipo, DEFAULT y NOT NULL en una sola linea."],
  pista: "Igual que el paso 1 pero con texto: ADD COLUMN, tipo VARCHAR con longitud, DEFAULT con el valor entre comillas simples, y NOT NULL.",
  sol: "ALTER TABLE empleados\n  ADD COLUMN nivel VARCHAR(10) DEFAULT 'Base' NOT NULL;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Un DEFAULT de texto se escribe entre comillas simples igual que cualquier literal. Al agregarse, todas las filas existentes quedan en 'Base' y a partir de ahi solo cambian las que tu decidas.",
  reto: "Abre el modelo y observa que empleados ya tiene dos columnas que no existian al empezar la cadena."
},
{
  n: 37, dif: "cadena", tema: "UPDATE", titulo: "Paso 7 · Asignar el nivel",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 7,
  pide: "Clasifica a los empleados segun sus puntos: 15 o mas es 'Oro', 10 o mas es 'Plata', mas de 0 es 'Bronce', y quien tenga 0 se queda en 'Base'. Resuelvelo en un solo UPDATE con CASE.",
  tips: ["El orden de los WHEN importa: de lo mas especifico a lo mas general.", "Sin ELSE, los que no coincidan quedarian en NULL y la columna lo prohibe."],
  pista: "SET nivel = CASE WHEN e.puntos >= 15 THEN 'Oro' WHEN e.puntos >= 10 THEN 'Plata' WHEN e.puntos > 0 THEN 'Bronce' ELSE 'Base' END",
  sol: "UPDATE empleados e\n   SET nivel = CASE\n                 WHEN e.puntos >= 15 THEN 'Oro'\n                 WHEN e.puntos >= 10 THEN 'Plata'\n                 WHEN e.puntos >  0  THEN 'Bronce'\n                 ELSE                      'Base'\n               END;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Un CASE dentro del SET resuelve en una sola pasada lo que de otro modo serian cuatro UPDATE con WHERE distintos: menos bloqueos, menos lecturas y ninguna ventana en la que la tabla este a medio clasificar.",
  reto: "Quita el ELSE y observa como la restriccion NOT NULL detiene la sentencia completa."
},
{
  n: 38, dif: "cadena", tema: "SELECT", titulo: "Paso 8 · Reporte por nivel",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 8,
  pide: "Direccion quiere el resumen: por cada nivel, cuantos empleados hay (columna empleados) y cuantos puntos suman entre todos (columna puntos_totales). Ordena por puntos_totales descendente.",
  tips: ["Una fila por nivel: eso es GROUP BY."],
  pista: "Una fila por nivel significa GROUP BY sobre esa columna. Necesitas COUNT para el numero de empleados y SUM para los puntos, cada uno con su alias.",
  sol: "SELECT e.nivel,\n       COUNT(*)       AS empleados,\n       SUM(e.puntos)  AS puntos_totales\n  FROM empleados e\n GROUP BY e.nivel\n ORDER BY puntos_totales DESC;",
  check: { tipo: "rows", ordered: true },
  aprende: "Este reporte solo existe porque los siete pasos anteriores salieron bien. Es el patron real de una migracion: abrir columna, medir, proteger, cargar, verificar, clasificar y recien entonces reportar.",
  reto: "Agrega ROUND(AVG(e.puntos), 1) para ver el promedio por nivel."
},
{
  n: 39, dif: "cadena", tema: "UPDATE", titulo: "Paso 9 · Corregir sin romper",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 9,
  pide: "RH avisa que los empleados inactivos no participan en el programa. Pon en 0 los puntos y en 'Base' el nivel de los empleados con activo = 0, sin tocar a nadie mas.",
  tips: ["Un solo UPDATE puede cambiar dos columnas.", "El WHERE es lo que separa una correccion de un desastre."],
  pista: "Un solo UPDATE puede asignar dos columnas separandolas con coma. El WHERE filtra por la columna activo.",
  sol: "UPDATE empleados e\n   SET puntos = 0,\n       nivel  = 'Base'\n WHERE e.activo = 0;",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "Cambiar dos columnas en un solo UPDATE es una sola pasada y una sola transaccion: o quedan las dos o no queda ninguna. Hacerlo en dos sentencias abre una ventana en la que un empleado tiene 0 puntos pero sigue marcado como Oro.",
  reto: "Corre el reporte del paso 8 otra vez y compara como cambio el conteo de cada nivel."
},
{
  n: 40, dif: "cadena", tema: "SELECT", titulo: "Paso 10 · Cierre de la migracion",
  bloque: "Cadena: programa de lealtad", cadena: "lealtad", paso: 10,
  pide: "Entrega el reporte final a Direccion: por cada sucursal, su nombre (columna sucursal), cuantos empleados de nivel distinto de 'Base' tiene (columna premiados) y la suma de puntos de esa sucursal (columna puntos). Incluye TODAS las sucursales, incluso las que no tienen a nadie premiado. Ordena por puntos descendente y luego por nombre de sucursal.",
  tips: ["Todas las sucursales significa LEFT JOIN.", "Contar solo los premiados dentro de un grupo se hace con SUM(CASE WHEN ... THEN 1 ELSE 0 END).", "COALESCE protege la suma de las sucursales vacias."],
  pista: "SUM(CASE WHEN e.nivel <> 'Base' THEN 1 ELSE 0 END) cuenta condicionalmente; envuelve todo en COALESCE para las sucursales sin empleados.",
  sol: "SELECT s.nombre AS sucursal,\n       COALESCE(SUM(CASE WHEN e.nivel <> 'Base' THEN 1 ELSE 0 END), 0) AS premiados,\n       COALESCE(SUM(e.puntos), 0)                                     AS puntos\n  FROM sucursales     s\n  LEFT JOIN empleados e\n    ON e.sucursal_id = s.id\n GROUP BY s.nombre\n ORDER BY puntos DESC,\n          s.nombre;",
  check: { tipo: "rows", ordered: true },
  aprende: "SUM(CASE WHEN condicion THEN 1 ELSE 0 END) es la forma de contar solo algunas filas dentro de un grupo, sin partir la consulta en dos. Combinado con LEFT JOIN y COALESCE, produce un reporte que no esconde a nadie.",
  reto: "Cambia el LEFT JOIN por JOIN y fijate cual sucursal desaparece del reporte."
}
];
root.EJERCICIOS_CADENA = C;
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).EJERCICIOS_CADENA;
