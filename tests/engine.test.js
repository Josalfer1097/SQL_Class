import { test } from "node:test";
import assert from "node:assert/strict";
import ENG from "../src/engine/engine.js";
import SEED from "../src/engine/seed.js";
import REV from "../src/engine/revisor.js";
import FMT from "../src/engine/formatter.js";
import BASE from "../src/game/ejercicios_base.js";
import CAD from "../src/game/ejercicios_cadena.js";
import AV from "../src/game/ejercicios_avanzado.js";

const TODOS = [...BASE, ...CAD, ...AV];
REV.setEjercicios(TODOS);
const q = (sql) => { const r = ENG.execute(sql, SEED.construirDB()); return r[r.length - 1]; };

test("la base del curso tiene las cuatro tablas", () => {
  const db = SEED.construirDB();
  assert.deepEqual(Object.keys(db.tables).sort(), ["empleados", "productos", "sucursales", "ventas"]);
  assert.equal(db.tables.ventas.rows.length, 96);
});

test("SELECT con JOIN, GROUP BY y HAVING", () => {
  const r = q("SELECT s.nombre, COUNT(e.id) AS n FROM sucursales s LEFT JOIN empleados e ON e.sucursal_id = s.id GROUP BY s.nombre HAVING COUNT(e.id) = 0;");
  assert.equal(r.count, 1);
  assert.equal(r.rows[0].nombre, "Sucursal Queretaro");
});

test("NULL: = NULL no devuelve filas, IS NULL si", () => {
  assert.equal(q("SELECT COUNT(*) AS n FROM productos p WHERE p.descripcion = NULL;").rows[0].n, 0);
  assert.ok(q("SELECT COUNT(*) AS n FROM productos p WHERE p.descripcion IS NULL;").rows[0].n > 0);
});

test("alias en el SET falla como en PostgreSQL", () => {
  assert.throws(() => q("UPDATE productos p SET p.precio = 1 WHERE p.id = 1;"), /column "p" of relation "productos" does not exist/);
});

test("CTE y funciones de ventana", () => {
  const r = q("WITH r AS (SELECT e.nombre, ROW_NUMBER() OVER (PARTITION BY e.sucursal_id ORDER BY e.salario DESC) AS lugar FROM empleados e) SELECT r.nombre FROM r WHERE r.lugar = 1 ORDER BY r.nombre;");
  assert.equal(r.count, 5);
  const acum = q("SELECT v.id, SUM(v.total) OVER (ORDER BY v.id) AS acum FROM ventas v ORDER BY v.id LIMIT 2;");
  assert.equal(acum.rows[1].acum, acum.rows[0].acum + q("SELECT v.total FROM ventas v WHERE v.id = 2;").rows[0].total);
  assert.throws(() => q("SELECT e.nombre FROM empleados e WHERE ROW_NUMBER() OVER (ORDER BY e.id) = 1;"), /window functions are not allowed in WHERE/);
});

test("CAST a INTEGER redondea como PostgreSQL", () => {
  const r = q("SELECT CAST(2.6 AS INTEGER) AS a, CAST(-2.5 AS INTEGER) AS b;");
  assert.equal(r.rows[0].a, 3); assert.equal(r.rows[0].b, -3);
});

test("las 48 soluciones de referencia pasan su propia revision", () => {
  const fallan = TODOS.filter((e) => { const r = REV.revisar(e.sol, e); return !(r.ok && !r.error); }).map((e) => e.n);
  assert.deepEqual(fallan, []);
});

test("el revisor acepta variantes correctas y rechaza incorrectas", () => {
  const e1 = TODOS.find((e) => e.n === 1);
  assert.ok(REV.revisar("select sku, nombre, precio from productos order by precio desc", e1).ok);
  assert.ok(!REV.revisar("SELECT p.sku, p.nombre, p.precio FROM productos p ORDER BY p.precio ASC;", e1).ok);
  const e23 = TODOS.find((e) => e.n === 23);
  assert.ok(!REV.revisar("SELECT s.nombre, COUNT(*) AS empleados FROM sucursales s LEFT JOIN empleados e ON e.sucursal_id = s.id GROUP BY s.nombre ORDER BY s.nombre;", e23).ok);
});

test("formatear no altera el resultado de ninguna solucion", () => {
  TODOS.forEach((e) => {
    const f = FMT.formatear(e.sol);
    const a = REV.revisar(e.sol, e), b = REV.revisar(f, e);
    assert.equal(a.ok, b.ok, "ejercicio " + e.n);
  });
});
