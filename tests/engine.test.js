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
  assert.ok(REV.revisar("select nombre, categoria, stock from productos order by stock desc", e1).ok, "variante en minusculas y sin alias");
  assert.ok(!REV.revisar("SELECT p.nombre, p.categoria, p.stock FROM productos p ORDER BY p.stock ASC;", e1).ok, "orden invertido");
  const e23 = TODOS.find((e) => e.n === 23);
  assert.ok(!REV.revisar("SELECT p.nombre, COUNT(*) AS ventas FROM productos p LEFT JOIN ventas v ON v.producto_id = p.id GROUP BY p.id, p.nombre ORDER BY ventas, p.id;", e23).ok, "COUNT(*) con LEFT JOIN");
});

test("cada ejercicio tiene exactamente 3 pistas y ninguna es la solucion", () => {
  const sinTres = TODOS.filter((e) => !Array.isArray(e.pistas) || e.pistas.length !== 3).map((e) => e.n);
  assert.deepEqual(sinTres, [], "todos deben tener 3 pistas");
  const limpio = (s) => s.replace(/\s+/g, "").toLowerCase();
  const filtradas = TODOS.filter((e) => e.pistas.some((p) => limpio(p) === limpio(e.sol))).map((e) => e.n);
  assert.deepEqual(filtradas, [], "ninguna pista puede ser la solucion literal");
  /* una pista puede mostrar la forma de la consulta, pero siempre con huecos: "___" o "..." */
  const sinHuecos = TODOS.filter((e) => e.pistas.some((p) =>
    /^(SELECT|UPDATE|ALTER|WITH|INSERT|DELETE)/i.test(p.trim()) && !p.includes("_") && !p.includes("...")
  )).map((e) => e.n);
  assert.deepEqual(sinHuecos, [], "una pista con forma de consulta debe llevar huecos, no la respuesta");

  /* las tres pistas deben ser distintas entre si */
  const repetidas = TODOS.filter((e) => new Set(e.pistas.map(limpio)).size !== 3).map((e) => e.n);
  assert.deepEqual(repetidas, [], "las tres pistas deben ser distintas");

  /* la primera pista orienta, no da sintaxis: no debe empezar con una palabra clave de SQL */
  const primeraMuyDirecta = TODOS.filter((e) => /^(SELECT|UPDATE|ALTER|WITH|WHERE|GROUP|ORDER)/i.test(e.pistas[0].trim())).map((e) => e.n);
  assert.deepEqual(primeraMuyDirecta, [], "la pista 1 debe orientar el concepto, no dar sintaxis");
});

test("formatear no altera el resultado de ninguna solucion", () => {
  TODOS.forEach((e) => {
    const f = FMT.formatear(e.sol);
    const a = REV.revisar(e.sol, e), b = REV.revisar(f, e);
    assert.equal(a.ok, b.ok, "ejercicio " + e.n);
  });
});

/* ---------- lecciones ---------- */
import { LECCIONES } from "../src/game/lecciones.ts";

test("hay una leccion por reino y todo su SQL ejecuta", () => {
  assert.equal(LECCIONES.length, 10, "una leccion por reino");
  const malos = [];
  LECCIONES.forEach((l) => {
    l.pasos.forEach((paso) => {
      paso.bloques.forEach((b) => {
        if (b.t !== "codigo" && b.t !== "prueba") return;
        const sql = b.t === "codigo" ? b.sql : b.sol;
        try {
          const r = ENG.execute(sql, SEED.construirDB());
          const last = r[r.length - 1];
          if (last.command === "SELECT" && last.count === 0) malos.push(l.reino + " :: resultado vacio");
        } catch (e) { malos.push(l.reino + " :: " + e.message.slice(0, 50)); }
      });
    });
  });
  assert.deepEqual(malos, []);
});

test("cada leccion tiene al menos un ejemplo ejecutable y una prueba", () => {
  const flojas = LECCIONES.filter((l) => {
    const bloques = l.pasos.flatMap((p) => p.bloques);
    return !bloques.some((b) => b.t === "codigo") || !bloques.some((b) => b.t === "prueba");
  }).map((l) => l.reino);
  assert.deepEqual(flojas, []);
});