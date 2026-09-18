/* Datos del curso, version compacta y determinista.
   Mismo esquema que el script de Supabase. */
(function (root) {
"use strict";

var SUCURSALES = [
  [1, "Matriz San Pablo",     "CDMX",        "2015-03-10"],
  [2, "Division del Norte",   "CDMX",        "2017-08-01"],
  [3, "Sucursal Guadalajara", "Guadalajara", "2019-11-15"],
  [4, "Sucursal Monterrey",   "Monterrey",   "2021-05-20"],
  [5, "Sucursal Puebla",      "Puebla",      "2023-02-01"],
  [6, "Sucursal Queretaro",   "Queretaro",   "2026-08-03"]
];

var EMPLEADOS = [
  [1,  "Ana Rivera",      "Vendedor",   15400, 1, "2018-04-12", 1],
  [2,  "Luis Mora",       "Vendedor",   14200, 1, "2019-01-20", 1],
  [3,  "Sofia Duran",     "Cajero",     11800, 1, "2020-06-03", 1],
  [4,  "Marco Tapia",     "Supervisor", 22500, 1, "2017-09-15", 1],
  [5,  "Elena Ponce",     "Vendedor",   16100, 2, "2019-11-02", 1],
  [6,  "Diego Salas",     "Vendedor",   13900, 2, "2021-03-18", 1],
  [7,  "Karla Vega",      "Gerente",    31000, 2, "2016-02-01", 1],
  [8,  "Hugo Nieto",      "Cajero",     10900, 2, "2022-08-22", 0],
  [9,  "Paula Ruiz",      "Vendedor",   17300, 3, "2020-01-14", 1],
  [10, "Ivan Solis",      "Supervisor", 24000, 3, "2018-07-30", 1],
  [11, "Nadia Cruz",      "Vendedor",   12600, 3, "2023-05-09", 1],
  [12, "Omar Beltran",    "Vendedor",   15800, 4, "2021-10-11", 1],
  [13, "Rosa Miranda",    "Gerente",    29500, 4, "2019-04-25", 1],
  [14, "Tomas Aguilar",   "Cajero",     11200, 4, "2022-02-07", 0],
  [15, "Celia Nunez",     "Vendedor",   14700, 5, "2023-03-01", 1],
  [16, "Bruno Ortega",    "Supervisor", 21800, 5, "2023-06-19", 1],
  [17, "Lucia Fonseca",   "Vendedor",   13100, 5, "2024-01-08", 1],
  [18, "Raul Mendez",     "Vendedor",   16900, 1, "2022-11-30", 1]
];

var PRODUCTOS = [
  [1,  "HER-0001", "Taladro percutor 1/2",      "Herramienta", "Mandril metalico, 750W",      1299.00, 14, 0],
  [2,  "HER-0002", "Rotomartillo SDS",          "Herramienta", null,                          2450.00,  6, 0],
  [3,  "HER-0003", "Juego de desarmadores",     "Herramienta", "6 piezas, punta iman",          79.50, 60, 0],
  [4,  "HER-0004", "Sierra caladora",           "Herramienta", null,                           980.00,  0, 0],
  [5,  "HER-0005", "Martillo de una",           "Herramienta", "Mango de fibra",               189.00, 42, 0],
  [6,  "PIN-0006", "Pintura vinilica 4L",       "Pintura",     "Blanco mate",                  459.00, 25, 0],
  [7,  "PIN-0007", "Esmalte acrilico 1L",       "Pintura",     null,                           289.00,  8, 0],
  [8,  "PIN-0008", "Impermeabilizante 19L",     "Pintura",     "5 anos de garantia",          1890.00,  3, 0],
  [9,  "PIN-0009", "Brocha 4 pulgadas",         "Pintura",     "Cerda natural",                 62.00, 90, 0],
  [10, "PIN-0010", "Rodillo antigota",          "Pintura",     null,                           145.00, 31, 0],
  [11, "PLO-0011", "Llave stilson 14",          "Plomeria",    "Acero forjado",                520.00, 12, 0],
  [12, "PLO-0012", "Codo PVC 2 pulgadas",       "Plomeria",    null,                            45.50, 150, 0],
  [13, "PLO-0013", "Bomba periferica 1/2 HP",   "Plomeria",    "Uso domestico",               2190.00,  4, 0],
  [14, "PLO-0014", "Cinta teflon",              "Plomeria",    null,                            18.00, 200, 0],
  [15, "ELE-0015", "Cable calibre 12 (metro)",  "Electrico",   "Cobre, 100m por rollo",         27.55, 500, 0],
  [16, "ELE-0016", "Contacto duplex",           "Electrico",   null,                            64.00, 75, 0],
  [17, "ELE-0017", "Pastilla termica 20A",      "Electrico",   "Riel DIN",                     310.00, 18, 0],
  [18, "FER-0018", "Cinta metrica 8m",          "Ferreteria",  "Carcasa de hule",              199.00, 36, 0],
  [19, "FER-0019", "Candado de laton 50mm",     "Ferreteria",  null,                           168.00, 22, 0],
  [20, "FER-0020", "Escalera tijera 6 escalon", "Ferreteria",  "Aluminio, 120 kg",            1750.00,  2, 0],
  [21, "HER-0021", "Pinza de presion 10",       "Herramienta", null,                           235.00,  0, 1],
  [22, "PIN-0022", "Thinner 1L",                "Pintura",     "Descontinuado por normativa",   95.00,  0, 1],
  [23, "PLO-0023", "Manguera jardin 15m",       "Plomeria",    null,                           340.00,  9, 0],
  [24, "ELE-0024", "Foco LED 9W",               "Electrico",   "Luz calida",                    38.00, 320, 0]
];

/* ventas: generadas de forma determinista, 2024-2026.
   Los productos 19, 20, 23, 24 y los empleados 17 y 18 quedan SIN ventas
   a proposito, para que los ejercicios de LEFT JOIN y NOT EXISTS se noten. */
function construirVentas() {
  var v = [], id = 1;
  var prodIds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,21,22];
  var empIds  = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  var precios = {}; PRODUCTOS.forEach(function (p) { precios[p[0]] = p[5]; });
  for (var n = 0; n < 96; n++) {
    var pid = prodIds[(n * 7) % prodIds.length];
    var eid = empIds[(n * 5) % empIds.length];
    var cant = 1 + ((n * 3) % 6);
    var dias = (n * 9) % 900;
    var d = new Date(Date.UTC(2024, 0, 15));
    d.setUTCDate(d.getUTCDate() + dias);
    var fecha = d.toISOString().slice(0, 10);
    var total = Math.round(precios[pid] * cant * 100) / 100;
    v.push([id, "F-" + String(id).padStart(5, "0"), pid, eid, cant, total, fecha]);
    id++;
  }
  return v;
}

function col(name, type, opts) { var o = { type: type }; if (opts) for (var k in opts) o[k] = opts[k]; return [name, o]; }

function construirDB() {
  function tabla(cols, filas, cons) {
    var t = { cols: [], meta: {}, rows: [], constraints: cons || [] };
    cols.forEach(function (c) { t.cols.push(c[0]); t.meta[c[0]] = c[1]; });
    filas.forEach(function (f) { var r = {}; t.cols.forEach(function (c, i) { r[c] = f[i] === undefined ? null : f[i]; }); t.rows.push(r); });
    return t;
  }
  return {
    today: "2026-09-15",
    tables: {
      sucursales: tabla([
        col("id", "bigint", { notnull: true, identity: true }), col("nombre", "varchar(80)", { notnull: true }),
        col("ciudad", "varchar(60)", { notnull: true }), col("fecha_apertura", "date", { notnull: true })
      ], SUCURSALES),
      empleados: tabla([
        col("id", "bigint", { notnull: true, identity: true }), col("nombre", "varchar(100)", { notnull: true }),
        col("puesto", "varchar(50)", { notnull: true }), col("salario", "numeric(10,2)", { notnull: true, def: 0 }),
        col("sucursal_id", "bigint", { notnull: true }), col("fecha_ingreso", "date", { notnull: true }),
        col("activo", "smallint", { notnull: true, def: 1 })
      ], EMPLEADOS),
      productos: tabla([
        col("id", "bigint", { notnull: true, identity: true }), col("sku", "varchar(30)", { notnull: true }),
        col("nombre", "varchar(120)", { notnull: true }), col("categoria", "varchar(40)", { notnull: true }),
        col("descripcion", "varchar(200)"), col("precio", "numeric(10,2)", { notnull: true }),
        col("stock", "integer", { notnull: true, def: 0 }), col("descontinuado", "smallint", { notnull: true, def: 0 })
      ], PRODUCTOS),
      ventas: tabla([
        col("id", "bigint", { notnull: true, identity: true }), col("folio", "varchar(20)", { notnull: true }),
        col("producto_id", "bigint", { notnull: true }), col("empleado_id", "bigint", { notnull: true }),
        col("cantidad", "integer", { notnull: true }), col("total", "numeric(12,2)", { notnull: true }),
        col("fecha", "date", { notnull: true })
      ], construirVentas())
    }
  };
}

root.SEED = { construirDB: construirDB, SUCURSALES: SUCURSALES, EMPLEADOS: EMPLEADOS, PRODUCTOS: PRODUCTOS, construirVentas: construirVentas };
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).SEED;
