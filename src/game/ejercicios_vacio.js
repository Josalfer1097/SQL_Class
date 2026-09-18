/* Reino 10: El Vacio — DELETE y TRUNCATE */
(function (root) {
"use strict";
var A = [
{ n: 49, dif: "avanzado", tema: "UPDATE", titulo: "Un adios condicionado",
  bloque: "DELETE", pide: "Borra todas las ventas donde el total sea menor a 100.",
  tips: ["Usa DELETE FROM nombre_tabla WHERE condicion."],
  pistas: [
    "El comando para eliminar filas empieza con DELETE FROM y la tabla.",
    "La condicion para proteger la tabla va en un WHERE, igual que en un SELECT.",
    "DELETE FROM ventas WHERE total < 100;"
  ],
  sol: "DELETE FROM ventas\n WHERE total < 100;",
  check: { tipo: "state", tabla: "ventas" },
  aprende: "DELETE remueve filas enteras. El WHERE es la unica linea de defensa entre borrar lo que no sirve y vaciar la tabla por accidente.",
  reto: "Intenta borrar usando una condicion compuesta con AND." },
{ n: 50, dif: "avanzado", tema: "UPDATE", titulo: "Despido indirecto",
  bloque: "DELETE con subconsulta", pide: "Borra a los empleados que no tienen ninguna venta registrada. (Usa NOT IN o NOT EXISTS contra la tabla ventas).",
  tips: ["Un DELETE puede mirar otras tablas si usas una subconsulta en el WHERE."],
  pistas: [
    "Un DELETE puede mirar otras tablas si usas una subconsulta en el WHERE.",
    "La subconsulta en ventas obtiene los id de empleados que si tienen ventas. Los que no estan ahi, se van.",
    "DELETE FROM empleados WHERE id NOT IN (SELECT empleado_id FROM ventas);"
  ],
  sol: "DELETE FROM empleados\n WHERE id NOT IN (\n  SELECT empleado_id\n    FROM ventas\n);",
  check: { tipo: "state", tabla: "empleados" },
  aprende: "A veces lo que define si un registro debe morir esta en otra tabla. Las subconsultas en el WHERE de un DELETE son el puente para esa decision.",
  reto: "Reescribe el DELETE usando NOT EXISTS en lugar de NOT IN." },
{ n: 51, dif: "avanzado", tema: "UPDATE", titulo: "Vaciado absoluto",
  bloque: "TRUNCATE", pide: "Vacia completamente la tabla ventas usando el comando TRUNCATE.",
  tips: ["TRUNCATE TABLE tabla; vacia la tabla sin mirar atras."],
  pistas: [
    "Hay un comando especial mas rapido que DELETE para vaciar completamente una tabla.",
    "Este comando no lleva WHERE, es todo o nada: TRUNCATE TABLE.",
    "TRUNCATE TABLE ventas;"
  ],
  sol: "TRUNCATE TABLE ventas;",
  check: { tipo: "state", tabla: "ventas" },
  aprende: "TRUNCATE es un mazo, no un bisturi. Borra toda la tabla de golpe. Es mucho mas rapido que DELETE sin WHERE porque no guarda registro fila por fila.",
  reto: "Observa como TRUNCATE no permite WHERE. Es todo o nada." },
{ n: 52, dif: "avanzado", tema: "UPDATE", titulo: "Limpieza profunda",
  bloque: "DELETE", pide: "Borra de la tabla productos todos los que sean de categoria 'Accesorios' y tengan un precio menor a 50.",
  tips: ["Combina condiciones en el WHERE del DELETE como lo harias en un SELECT."],
  pistas: [
    "Combina condiciones en el WHERE del DELETE como lo harias en un SELECT.",
    "Las dos condiciones se unen con AND, para que solo borre si se cumplen ambas.",
    "DELETE FROM productos WHERE categoria = 'Accesorios' AND precio < 50;"
  ],
  sol: "DELETE FROM productos\n WHERE categoria = 'Accesorios'\n   AND precio < 50;",
  check: { tipo: "state", tabla: "productos" },
  aprende: "En una base real, este tipo de limpiezas se hace en transacciones. Si te equivocas aqui, tienes el boton de restaurar. En produccion, tienes tu carta de renuncia.",
  reto: "Agrega una condicion mas para proteger algun producto en especifico." }
];
root.EJERCICIOS_VACIO = A;
})(typeof window !== "undefined" ? window : globalThis);
export default (typeof window !== "undefined" ? window : globalThis).EJERCICIOS_VACIO;
