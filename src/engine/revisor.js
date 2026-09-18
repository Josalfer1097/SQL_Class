/* Revisor de respuestas: correccion + mejoras de estilo y de riesgo. */
(function (root) {
"use strict";
var ENG = root.SQLEngine, SEED = root.SEED, LISTA = [];

function snapshot(db) {
  var o = {};
  Object.keys(db.tables).forEach(function (n) {
    var t = db.tables[n];
    o[n] = {
      cols: t.cols.slice(),
      meta: JSON.parse(JSON.stringify(t.meta)),
      cons: (t.constraints || []).map(function (c) { return c.t + ":" + (c.name || "") + ":" + ((c.cols || []).join(",")); }).sort(),
      rows: t.rows.map(function (r) { return t.cols.map(function (c) { return fmtv(r[c]); }).join("\u0001"); })
    };
  });
  return o;
}
function fmtv(v) {
  if (v === null || v === undefined) return "\u0000NULL";
  if (typeof v === "number") return String(Math.round(v * 1e6) / 1e6);
  return String(v);
}
function difTablas(a, b, tabla) {
  var ta = a[tabla], tb = b[tabla], d = [];
  if (!tb) { d.push("la tabla " + tabla + " ya no existe"); return d; }
  if (!ta) { d.push("la tabla " + tabla + " es nueva"); return d; }

  var nuevas = tb.cols.filter(function (c) { return ta.cols.indexOf(c) < 0; });
  var idas   = ta.cols.filter(function (c) { return tb.cols.indexOf(c) < 0; });

  // renombre: misma cantidad de columnas y el cambio ocurre en la misma posicion
  if (nuevas.length === 1 && idas.length === 1 && ta.cols.length === tb.cols.length &&
      ta.cols.indexOf(idas[0]) === tb.cols.indexOf(nuevas[0])) {
    d.push("columna renombrada: " + idas[0] + " pasa a llamarse " + nuevas[0]);
    nuevas = []; idas = [];
  }
  nuevas.forEach(function (c) {
    var m = tb.meta[c] || {};
    d.push("columna nueva: " + c + " (" + (m.type || "sin tipo") +
      (m.notnull ? ", obligatoria" : "") +
      (m.def !== undefined && m.def !== null ? ", por defecto " + (typeof m.def === "string" ? "'" + m.def + "'" : m.def) : "") + ")");
  });
  idas.forEach(function (c) { d.push("columna eliminada: " + c); });

  // cambios en columnas que ya existian
  Object.keys(tb.meta).forEach(function (c) {
    if (nuevas.indexOf(c) >= 0) return;
    var m = tb.meta[c], vieja = ta.meta[c];
    if (!vieja || !m) return;
    if (vieja.type !== m.type) d.push(c + " cambia de tipo: " + vieja.type + " pasa a " + m.type);
    if (!vieja.notnull && m.notnull) d.push(c + " ahora es obligatoria (NOT NULL)");
    if (vieja.notnull && !m.notnull) d.push(c + " deja de ser obligatoria");
    if (String(vieja.def) !== String(m.def)) {
      d.push(m.def === undefined || m.def === null
        ? c + " se queda sin valor por defecto"
        : c + " toma por defecto " + (typeof m.def === "string" ? "'" + m.def + "'" : m.def));
    }
  });

  // restricciones
  var consNuevas = tb.cons.filter(function (c) { return ta.cons.indexOf(c) < 0; });
  var consIdas   = ta.cons.filter(function (c) { return tb.cons.indexOf(c) < 0; });
  function nombreCons(c) {
    var p = String(c).split(":");
    var tipo = (p[0] || "").toUpperCase(), nom = p[1] || "";
    var cols = p[2] ? " sobre (" + p[2] + ")" : "";
    return (nom || "sin nombre") + " · " + tipo + cols;
  }
  consNuevas.forEach(function (c) { d.push("restriccion nueva: " + nombreCons(c)); });
  consIdas.forEach(function (c) { d.push("restriccion eliminada: " + nombreCons(c)); });

  // filas cambiadas: solo si la estructura no cambio, para no contar el efecto de un ALTER
  if (!nuevas.length && !idas.length) {
    var cambios = 0, n = Math.max(ta.rows.length, tb.rows.length);
    for (var i = 0; i < n; i++) if (ta.rows[i] !== tb.rows[i]) cambios++;
    if (cambios) d.push(cambios + (cambios === 1 ? " fila con datos distintos" : " filas con datos distintos"));
    if (ta.rows.length !== tb.rows.length) {
      var dif = tb.rows.length - ta.rows.length;
      d.push(dif > 0 ? dif + " filas nuevas" : (-dif) + " filas eliminadas");
    }
  }
  if (!d.length) d.push("sin cambios");
  return d;
}

/* La base de un paso encadenado es el resultado de aplicar las soluciones
   de referencia de los pasos anteriores de la misma cadena. Asi nadie arrastra
   un error del paso previo. */
function baseDe(ej) {
  var db = SEED.construirDB();
  if (!ej || !ej.cadena) return db;
  var todos = LISTA;
  todos.forEach(function (x) {
    if (x.cadena === ej.cadena && x.paso < ej.paso && x.check.tipo === "state") {
      try { ENG.execute(x.sol, db); } catch (e) {}
    }
  });
  return db;
}

function correrAislado(sql, ej) {
  var db = baseDe(ej);
  var antes = snapshot(db);
  var res = ENG.execute(sql, db);
  return { db: db, antes: antes, despues: snapshot(db), res: res };
}

function mismasFilas(a, b, ordered) {
  if (a.cols.length !== b.cols.length) return { ok: false, motivo: "el resultado tiene " + a.cols.length + (a.cols.length === 1 ? " columna" : " columnas") + " y se esperaban " + b.cols.length };
  if (a.rows.length !== b.rows.length) return { ok: false, motivo: "el resultado trae " + a.rows.length + (a.rows.length === 1 ? " fila" : " filas") + " y se esperaban " + b.rows.length };
  var fa = a.rows.map(function (r) { return a.cols.map(function (c) { return fmtv(r[c]); }).join("\u0001"); });
  var fb = b.rows.map(function (r) { return b.cols.map(function (c) { return fmtv(r[c]); }).join("\u0001"); });
  if (!ordered) { fa = fa.slice().sort(); fb = fb.slice().sort(); }
  for (var i = 0; i < fa.length; i++) {
    if (fa[i] !== fb[i]) {
      return { ok: false, motivo: ordered
        ? "la fila " + (i + 1) + " no coincide: se obtuvo [" + fa[i].split("\u0001").join(", ").replace(/\u0000NULL/g, "NULL") + "] y se esperaba [" + fb[i].split("\u0001").join(", ").replace(/\u0000NULL/g, "NULL") + "]"
        : "los datos no coinciden: aparece [" + fa[i].split("\u0001").join(", ").replace(/\u0000NULL/g, "NULL") + "] donde se esperaba [" + fb[i].split("\u0001").join(", ").replace(/\u0000NULL/g, "NULL") + "]" };
    }
  }
  return { ok: true };
}

/* ---------- analisis de estilo y riesgos ---------- */
var KW_RE = /\b(select|from|where|group\s+by|having|order\s+by|limit|offset|distinct|inner\s+join|left\s+join|right\s+join|full\s+join|join|on|and|or|not|in|between|like|is\s+null|is\s+not\s+null|case|when|then|else|end|update|set|alter\s+table|add|drop|column|rename|constraint|check|unique|foreign\s+key|references|default|exists|as|values|insert\s+into|delete)\b/gi;

function analizar(sql, ej, ejec) {
  var m = [], sinCom = sql.replace(/--[^\n]*/g, "").replace(/'[^']*'/g, "''");
  var low = sinCom.toLowerCase();

  // 1. keywords en minusculas
  var kws = sinCom.match(KW_RE) || [];
  var minus = kws.filter(function (k) { return k === k.toLowerCase() && /[a-z]/.test(k); });
  if (minus.length >= 2) {
    m.push({ t: "estilo", txt: "Escribe las palabras clave en MAYUSCULAS (" + [].concat(minus.slice(0, 3)).map(function (x) { return x.toUpperCase(); }).join(", ") + (minus.length > 3 ? "..." : "") + "). Es la convencion del curso y hace que la consulta se lea de un vistazo." });
  }

  // 2. SELECT *
  if (/select\s+\*/i.test(sinCom)) {
    m.push({ t: "riesgo", txt: "Evita SELECT *: lista las columnas que necesitas. Con el asterisco, el dia que alguien agregue una columna tu reporte cambia solo." });
  }

  // 3. alias de tabla
  var tieneFrom = /\bfrom\s+([a-z_]+)(\s+(as\s+)?([a-z_]+))?/i.exec(sinCom);
  if (tieneFrom && !tieneFrom[4] && !/\bjoin\b/i.test(sinCom) && /\bfrom\b/i.test(sinCom)) {
    m.push({ t: "estilo", txt: "Ponle un alias a la tabla (FROM " + tieneFrom[1] + " " + tieneFrom[1][0] + ") y usalo en cada columna. Cuando manana agregues un JOIN, la consulta ya esta lista y no hay ambiguedad." });
  }

  // 5. UPDATE sin WHERE
  if (/\bupdate\b/i.test(low) && !/\bwhere\b/i.test(low)) {
    m.push({ t: "grave", txt: "Este UPDATE no tiene WHERE: cambia TODAS las filas de la tabla. Es el error mas caro de SQL. Todo UPDATE nace como SELECT: escribe el SELECT con el WHERE, confirma cuantas filas salen, y solo entonces cambia el encabezado." });
  }

  // 6. = NULL
  if (/[<>=!]\s*null\b/i.test(low)) {
    m.push({ t: "grave", txt: "Comparar con NULL usando = o <> nunca da verdadero, asi que ese filtro descarta todas las filas. Usa IS NULL o IS NOT NULL." });
  }

  // 7. NOT IN con subconsulta
  if (/\bnot\s+in\s*\(\s*select/i.test(low)) {
    m.push({ t: "riesgo", txt: "NOT IN con subconsulta se rompe si esa subconsulta devuelve un solo NULL: la comparacion pasa a desconocida y no sale ninguna fila. Prefiere NOT EXISTS." });
  }

  // 8. COUNT(*) con LEFT JOIN
  if (/left\s+join/i.test(low) && /count\s*\(\s*\*\s*\)/i.test(low)) {
    m.push({ t: "grave", txt: "COUNT(*) junto a un LEFT JOIN cuenta la fila del padre aunque no haya pareja, asi que donde deberia decir 0 dice 1. Cuenta una columna de la tabla derecha: COUNT(v.id)." });
  }

  // 9. filtro de la tabla derecha en el WHERE de un LEFT JOIN
  var lj = /left\s+join\s+([a-z_]+)\s+(?:as\s+)?([a-z_]+)/i.exec(sinCom);
  if (lj) {
    var al = lj[2], w = /\bwhere\b([\s\S]*)$/i.exec(sinCom);
    if (w && new RegExp("\\b" + al + "\\.[a-z_]+\\s*(=|<|>|<=|>=|like|between|in)\\b", "i").test(w[1])) {
      m.push({ t: "grave", txt: "Tienes un filtro sobre " + al + " en el WHERE, y eso degrada el LEFT JOIN a INNER: en las filas sin pareja esa columna es NULL y la comparacion las descarta. Mueve la condicion al ON." });
    }
  }

  // 10. AND/OR mezclados sin parentesis
  if (/\bor\b/i.test(low) && /\band\b/i.test(low)) {
    var wcl = /\bwhere\b([\s\S]*?)(\bgroup\b|\border\b|\bhaving\b|\blimit\b|$)/i.exec(sinCom);
    if (wcl && /\bor\b/i.test(wcl[1]) && /\band\b/i.test(wcl[1]) && !/\(/.test(wcl[1])) {
      m.push({ t: "grave", txt: "Mezclas AND y OR sin parentesis. El AND se agrupa primero, igual que la multiplicacion antes que la suma, y casi nunca es lo que uno queria. Pon parentesis explicitos." });
    }
  }

  // 11. alias del SELECT usado en WHERE (ya lo caza el motor, pero por si acaso)
  // 12. formato: todo en una linea
  var lineas = sql.trim().split("\n").filter(function (l) { return l.trim(); });
  var tokens = (sql.match(/\b(select|from|where|group|order|having|join|set|values)\b/gi) || []).length;
  if (lineas.length === 1 && tokens >= 3 && sql.trim().length > 60) {
    m.push({ t: "estilo", txt: "Escribe una clausula por linea (SELECT, FROM, WHERE, ORDER BY). En una consulta de tres lineas da igual; en una de cuarenta es la diferencia entre revisarla en un minuto o en media hora." });
  }

  // 13. sin punto y coma
  if (!/;\s*$/.test(sql.trim())) {
    m.push({ t: "estilo", txt: "Cierra la sentencia con punto y coma. En un script de varias sentencias es lo que le dice al motor donde termina cada una." });
  }

  // 14. INT/NUMBER y tipos de Oracle
  if (/\bnumber\s*\(/i.test(low)) m.push({ t: "riesgo", txt: "NUMBER es el tipo de Oracle. En PostgreSQL el equivalente es NUMERIC(p,s)." });
  if (/\bvarchar2\b/i.test(low)) m.push({ t: "riesgo", txt: "VARCHAR2 es de Oracle. En PostgreSQL se escribe VARCHAR(n)." });

  // 15. restriccion sin nombre
  if (/\badd\s+(check|unique|primary|foreign)\b/i.test(low)) {
    m.push({ t: "estilo", txt: "Ponle nombre a la restriccion con ADD CONSTRAINT nombre ... Si dejas que el motor lo invente, el error en produccion dira algo como productos_precio_check y no te dira nada util." });
  }

  // 16. DELETE sin WHERE
  if (/\bdelete\s+from\b/i.test(low) && !/\bwhere\b/i.test(low)) {
    m.push({ t: "grave", txt: "Este DELETE no tiene WHERE: vacia la tabla completa." });
  }

  // 17. numero de filas afectadas
  if (ejec && ejec.res) {
    var last = ejec.res[ejec.res.length - 1];
    if (last && (last.command === "UPDATE" || last.command === "DELETE") && last.count === 0) {
      m.push({ t: "riesgo", txt: "La sentencia se ejecuto pero afecto 0 filas. Revisa el WHERE: probablemente el filtro no coincide con ningun dato." });
    }
  }
  return m;
}

/* ---------- diff de filas: que sobra y que falta ---------- */
function clave(cols, r) { return cols.map(function (c) { return fmtv(r[c]); }).join("\u0001"); }
function diffFilas(mio, esp) {
  var k1 = {}, k2 = {}, sobran = [], faltan = [];
  esp.rows.forEach(function (r) { var k = clave(esp.cols, r); k2[k] = (k2[k] || 0) + 1; });
  mio.rows.forEach(function (r) { var k = clave(mio.cols, r); k1[k] = (k1[k] || 0) + 1; });
  mio.rows.forEach(function (r) { var k = clave(mio.cols, r); if (!k2[k]) { if (sobran.length < 4 && sobran.indexOf(k) < 0) sobran.push(k); } });
  esp.rows.forEach(function (r) { var k = clave(esp.cols, r); if (!k1[k]) { if (faltan.length < 4 && faltan.indexOf(k) < 0) faltan.push(k); } });
  function pinta(k) { return "[" + k.split("\u0001").join(", ").replace(/\u0000NULL/g, "NULL") + "]"; }
  return { sobran: sobran.map(pinta), faltan: faltan.map(pinta),
           nSobran: mio.rows.filter(function (r) { return !k2[clave(mio.cols, r)]; }).length,
           nFaltan: esp.rows.filter(function (r) { return !k1[clave(esp.cols, r)]; }).length };
}

/* ---------- pistas estructurales: que usa la solucion y tu no ---------- */
function limpio(x) { return x.replace(/--[^\n]*/g, " ").replace(/\s+/g, " ").toLowerCase(); }
function pistasEstructurales(sql, sol) {
  var a = limpio(sql), b = limpio(sol), p = [];
  function bSolo(re, txt) { if (re.test(b) && !re.test(a)) p.push(txt); }
  bSolo(/\bleft join\b/, "La solucion usa LEFT JOIN y la tuya no. Un JOIN normal descarta las filas que no encuentran pareja, y este reporte pide incluirlas.");
  bSolo(/\bgroup by\b/, "Falta el GROUP BY. Este reporte pide un renglon por grupo, no una sola fila con el total de todo.");
  bSolo(/\bhaving\b/, "Falta el HAVING. La condicion sobre el resultado de una suma o un conteo solo se puede filtrar despues de agrupar.");
  bSolo(/\bdistinct\b/, "La solucion usa DISTINCT para no repetir valores.");
  bSolo(/\border by\b/, "Falta el ORDER BY. Sin el, el motor no garantiza ningun orden y el resultado puede salir distinto cada vez.");
  bSolo(/\bnot exists\b/, "La solucion usa NOT EXISTS para preguntar por la ausencia de filas relacionadas.");
  bSolo(/\bbetween\b/, "Se puede resolver con BETWEEN, que incluye los dos extremos en una sola condicion.");
  bSolo(/\blimit\b/, "Falta el LIMIT para quedarte solo con las primeras filas.");
  bSolo(/\bcoalesce\b/, "La solucion usa COALESCE: SUM sobre un conjunto vacio devuelve NULL, no 0.");
  bSolo(/\bround\s*\(/, "El reporte pide redondear el resultado con ROUND(expresion, 2).");
  bSolo(/\bcase\b/, "La solucion usa CASE para clasificar cada fila segun su valor.");
  if (/count\s*\(\s*\*\s*\)/.test(a) && /count\s*\(\s*[a-z_]+\./.test(b))
    p.push("La solucion cuenta una columna concreta, no COUNT(*). La diferencia importa cuando hay filas sin pareja: COUNT(*) las cuenta igual y COUNT(columna) las ignora.");
  if (!/\bwhere\b/.test(a) && /\bwhere\b/.test(b)) p.push("Falta el WHERE: el enunciado pide filtrar, no traer toda la tabla.");
  return p;
}

/* ---------- revision completa ---------- */
function revisar(sql, ej) {
  var out = { sql: sql, ok: false, error: null, mejoras: [], detalle: null, resultado: null, esperado: null };
  if (!sql || !sql.trim()) { out.error = { message: "No escribiste ninguna consulta." }; return out; }

  var mio;
  try { mio = correrAislado(sql, ej); }
  catch (e) {
    out.error = { message: e.message, hint: e.hint || null };
    out.mejoras = analizar(sql, ej, null);
    return out;
  }

  var ref = correrAislado(ej.sol, ej);
  var ultimo = mio.res[mio.res.length - 1];
  if (ultimo.command === "SELECT") out.resultado = { cols: ultimo.cols, rows: ultimo.rows, count: ultimo.count };
  out.comando = ultimo.command;
  out.count = ultimo.count;

  if (ej.check.tipo === "rows") {
    if (ultimo.command !== "SELECT") {
      out.error = { message: "Este ejercicio se resuelve con un SELECT y tu sentencia es un " + ultimo.command + ".", hint: null };
      out.mejoras = analizar(sql, ej, mio);
      return out;
    }
    var refSel = ref.res[ref.res.length - 1];
    out.esperado = { cols: refSel.cols, rows: refSel.rows, count: refSel.count };
    var cmp = mismasFilas(out.resultado, out.esperado, ej.check.ordered);
    out.ok = cmp.ok;
    if (!cmp.ok) {
      out.detalle = cmp.motivo;
      var d = diffFilas(out.resultado, out.esperado);
      out.diff = d;
      if (d.nSobran && !d.nFaltan) out.detalle = "traes " + d.nSobran + (d.nSobran === 1 ? " fila de mas" : " filas de mas") + ": el filtro deja pasar cosas que el reporte no pedia";
      else if (d.nFaltan && !d.nSobran) out.detalle = "faltan " + d.nFaltan + (d.nFaltan === 1 ? " fila" : " filas") + ": el filtro esta dejando fuera datos que si deberian salir";
      else if (d.nSobran && d.nFaltan) out.detalle = "hay " + d.nFaltan + " filas que faltan y " + d.nSobran + " que sobran";
      else if (cmp.motivo.indexOf("columna") >= 0) out.detalle = cmp.motivo;
      else out.detalle = "los datos son los correctos pero el orden no: revisa el ORDER BY";
    }
    if (cmp.ok && ej.check.ordered) {
      // si acerto pero sin ORDER BY, avisar
      if (!/\border\s+by\b/i.test(sql.replace(/--[^\n]*/g, ""))) {
        out.mejoras.push({ t: "riesgo", txt: "Acertaste los datos, pero sin ORDER BY el motor no garantiza ningun orden: la misma consulta puede devolver las filas en otra secuencia manana. Este ejercicio pide un orden explicito." });
      }
    }
    // nombres de columnas
    if (cmp.ok) {
      var difNombres = out.resultado.cols.filter(function (c, i) { return c !== out.esperado.cols[i]; });
      if (difNombres.length) out.mejoras.push({ t: "estilo", txt: "Los datos estan bien, pero las columnas se llaman " + out.resultado.cols.join(", ") + " y el reporte pedia " + out.esperado.cols.join(", ") + ". Nombra las columnas con AS: el alias es documentacion para quien lea el resultado." });
    }
  } else {
    var difMio = difTablas(mio.antes, mio.despues, ej.check.tabla);
    var difRef = difTablas(ref.antes, ref.despues, ej.check.tabla);
    var igual = JSON.stringify(mio.despues[ej.check.tabla]) === JSON.stringify(ref.despues[ej.check.tabla]);
    // que no haya tocado otras tablas
    var otras = Object.keys(ref.despues).filter(function (t) { return t !== ej.check.tabla; })
      .filter(function (t) { return JSON.stringify(mio.despues[t]) !== JSON.stringify(ref.despues[t]); });
    out.ok = igual && otras.length === 0;
    out.cambios = difMio;
    out.cambiosEsperados = difRef;
    if (!out.ok) {
      if (otras.length) out.detalle = "la sentencia modifico tambien la tabla " + otras.join(", ") + ", y no deberia";
      else if (!difMio.length) out.detalle = "la tabla " + ej.check.tabla + " quedo igual que al principio: la sentencia no cambio nada";
      else out.detalle = "el estado final de " + ej.check.tabla + " no es el esperado";
    }
  }
  if (!out.ok) {
    pistasEstructurales(sql, ej.sol).forEach(function (t) { out.mejoras.push({ t: "riesgo", txt: t }); });
  }
  out.mejoras = out.mejoras.concat(analizar(sql, ej, mio));
  // quitar duplicados
  var vistos = {}; out.mejoras = out.mejoras.filter(function (m) { if (vistos[m.txt]) return false; vistos[m.txt] = 1; return true; });
  return out;
}

root.REVISOR = { setEjercicios: function (l) { LISTA = l; }, revisar: revisar, diffFilas: diffFilas, baseDe: baseDe, pistasEstructurales: pistasEstructurales, correrAislado: correrAislado, analizar: analizar, snapshot: snapshot };
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).REVISOR;
