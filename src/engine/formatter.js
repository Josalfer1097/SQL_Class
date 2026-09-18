/* Formateador SQL con el estilo del curso (river alignment).
   Reconstruye la sentencia desde los tokens del motor. */
(function (root) {
"use strict";
var ENG = root.SQLEngine;

var RIVER = 6; // ancho de "SELECT"
function pad(kw) { return " ".repeat(Math.max(0, RIVER - kw.length)) + kw; }

var PRINCIPALES = { select: 1, from: 1, where: 1, group: 1, having: 1, order: 1, limit: 1, offset: 1, update: 1, set: 1, delete: 1, truncate: 1, insert: 1, values: 1, alter: 1, with: 1 };
var JOINS = { join: 1, inner: 1, left: 1, right: 1, full: 1, cross: 1 };
var FUNCS = {};
("count sum avg min max round coalesce nullif upper lower length trim abs extract greatest least " +
 "current_date now substr concat to_char cast").split(" ").forEach(function (f) { FUNCS[f] = 1; });

function formatear(sql) {
  var toks;
  try { toks = ENG.tokenize(sql); } catch (e) { return sql; }
  toks = toks.filter(function (t) { return t.type !== "eof"; });
  if (!toks.length) return sql;

  var out = [], linea = "", depth = 0, i = 0, fresco = false, caseCol = null;

  function push() { if (linea.trim()) out.push(linea.replace(/\s+$/, "")); linea = ""; }
  function txt(t) {
    if (t.type === "string") return "'" + String(t.value).split("'").join("''") + "'";
    if (t.type === "kw") return String(t.value).toUpperCase();
    if (t.type === "ident") {
      if (t.quoted) return '"' + t.value + '"';
      var raw = t.raw || t.value;
      if (FUNCS[String(raw).toLowerCase()]) return String(raw).toUpperCase();
      return raw;
    }
    if (t.type === "number") return String(t.value);
    return String(t.value);
  }
  function ultimo() { return linea.replace(/\s+$/, "").slice(-1); }
  function add(s, sep) {
    if (linea === "") { linea = s; return; }
    if (fresco) { fresco = false; linea += s; return; }
    if (sep === false || ultimo() === "(" || s === ")" || s === "," || s === ";" || s === "." || ultimo() === ".") linea += s;
    else linea += " " + s;
  }

  while (i < toks.length) {
    var t = toks[i], v = t.type === "kw" ? t.value : null;

    if (t.type === "punc" && t.value === "(") { depth++; add("(", false); i++; continue; }
    if (t.type === "punc" && t.value === ")") { depth--; add(")"); i++; continue; }
    if (t.type === "punc" && t.value === ";") { add(";"); push(); out.push(""); i++; continue; }

    if (depth === 0 && v && PRINCIPALES[v]) {
      // GROUP BY / ORDER BY como una sola pieza
      var kw = v.toUpperCase(), salto = 1;
      if ((v === "group" || v === "order") && toks[i + 1] && toks[i + 1].value === "by") { kw += " BY"; salto = 2; }
      if (v === "insert" && toks[i + 1] && toks[i + 1].value === "into") { kw += " INTO"; salto = 2; }
      if (v === "delete" && toks[i + 1] && toks[i + 1].value === "from") { kw += " FROM"; salto = 2; }
      if (v === "truncate" && toks[i + 1] && toks[i + 1].value === "table") { kw += " TABLE"; salto = 2; }
      push();
      caseCol = null;
      if (kw === "SELECT" || kw === "UPDATE" || kw === "INSERT INTO" || kw === "DELETE FROM" || kw === "TRUNCATE" || kw === "TRUNCATE TABLE" || kw === "ALTER" || kw === "VALUES") linea = kw;
      else if (kw === "GROUP BY" || kw === "ORDER BY") linea = " " + kw;
      else linea = pad(kw);
      i += salto;
      continue;
    }

    if (depth === 0 && v && JOINS[v]) {
      var j = [];
      while (i < toks.length && toks[i].type === "kw" && (JOINS[toks[i].value] || toks[i].value === "outer")) { j.push(toks[i].value.toUpperCase()); i++; }
      push();
      var jk = j.join(" ");
      linea = jk.length >= RIVER ? "  " + jk : pad(jk);
      continue;
    }
    if (depth === 0 && v === "on") { push(); linea = "    ON"; i++; continue; }
    if (depth === 0 && (v === "and" || v === "or")) { push(); linea = pad(v.toUpperCase()); i++; continue; }

    // CASE en varias lineas, como en las presentaciones del curso
    if (depth === 0 && v === "case") {
      add("CASE");
      caseCol = linea.length - 4;             // columna donde arranca el CASE
      push();
      linea = " ".repeat(caseCol + 2); fresco = true;
      i++; continue;
    }
    if (depth === 0 && caseCol !== null && (v === "when" || v === "else")) {
      push();
      linea = " ".repeat(caseCol + 2) + v.toUpperCase();
      fresco = false;
      i++; continue;
    }
    if (depth === 0 && caseCol !== null && v === "end") {
      push();
      linea = " ".repeat(caseCol) + "END";
      fresco = false;
      caseCol = null;
      i++; continue;
    }

    // coma de nivel superior dentro de SELECT / SET: salto de linea alineado
    if (t.type === "punc" && t.value === "," && depth === 0 && caseCol === null) {
      add(",");
      var cabecera = /^(SELECT|\s*SET|\s+ORDER BY|\s+GROUP BY)/.exec(out.length || linea ? (linea || "") : "");
      var base = linea.match(/^(\s*)(SELECT|SET|ORDER BY|GROUP BY)?/);
      push();
      linea = " ".repeat(sangriaContinuacion(out)); fresco = true;
      i++;
      continue;
    }

    add(txt(t), t.type === "punc" && t.value === "." ? false : undefined);
    i++;
  }
  push();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "");
}

/* la sangria de continuacion depende de la clausula en curso */
function sangriaContinuacion(out) {
  for (var k = out.length - 1; k >= 0; k--) {
    var l = out[k];
    if (/^SELECT\b/.test(l)) return 7;
    if (/^\s*SET\b/.test(l)) return 7;
    if (/^\s+ORDER BY\b/.test(l)) return 10;
    if (/^\s+GROUP BY\b/.test(l)) return 10;
    if (/^UPDATE\b|^INSERT INTO\b|^ALTER\b|^VALUES\b/.test(l)) return 7;
    if (/^\s{0,6}(FROM|WHERE|HAVING|LIMIT)\b/.test(l)) return 7;
  }
  return 7;
}

/* alinea los signos = de un bloque de condiciones consecutivas (opcional, suave) */
function alinearIguales(texto) {
  var lineas = texto.split("\n"), i = 0;
  while (i < lineas.length) {
    var grupo = [];
    while (i < lineas.length && /^\s{0,4}(WHERE|AND|OR)\s+\S+\s*(=|<>|>=|<=|>|<)\s/.test(lineas[i])) { grupo.push(i); i++; }
    if (grupo.length > 1) {
      var maxIzq = 0;
      grupo.forEach(function (g) {
        var m = /^(\s*(?:WHERE|AND|OR)\s+)(\S+)(\s*)(=|<>|>=|<=|>|<)(\s*)/.exec(lineas[g]);
        if (m) maxIzq = Math.max(maxIzq, (m[1] + m[2]).length);
      });
      grupo.forEach(function (g) {
        lineas[g] = lineas[g].replace(/^(\s*(?:WHERE|AND|OR)\s+)(\S+)(\s*)(=|<>|>=|<=|>|<)(\s*)/, function (_, a, b, c, op, d) {
          return a + b + " ".repeat(Math.max(1, maxIzq - (a + b).length + 1)) + op + " ";
        });
      });
    } else i++;
  }
  return lineas.join("\n");
}

root.FORMATTER = { formatear: function (s) { return alinearIguales(formatear(s)); } };
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).FORMATTER;
