/* ============================================================
   MOTOR SQL EN JS  ·  subconjunto tipo PostgreSQL
   Soporta: SELECT (JOIN, WHERE, GROUP BY, HAVING, ORDER BY,
   LIMIT/OFFSET, DISTINCT, alias, CASE, subconsultas escalares,
   IN, EXISTS, agregaciones), UPDATE, DELETE, INSERT, ALTER TABLE.
   ============================================================ */
(function (root) {
"use strict";

/* ---------------- errores ---------------- */
function SqlError(msg, hint) { this.name = "SqlError"; this.message = msg; this.hint = hint || null; }
SqlError.prototype = Object.create(Error.prototype);
function err(msg, hint) { throw new SqlError(msg, hint); }

/* ---------------- tokenizer ---------------- */
var KEYWORDS = ("select from where group by having order asc desc limit offset distinct as and or not in between like ilike is null " +
"join inner left right full outer cross on using union all case when then else end with exists insert into values update set delete " +
"alter table add drop column rename to constraint primary key foreign references unique check default type create index " +
"commit rollback begin returning true false over partition cascade if exists").split(" ");
var KWSET = {}; KEYWORDS.forEach(function (k) { KWSET[k] = 1; });

function tokenize(sql) {
  var toks = [], i = 0, n = sql.length, line = 1, col = 1;
  function push(type, value, s) { toks.push({ type: type, value: value, line: line, col: col, start: s }); }
  while (i < n) {
    var ch = sql[i], startCol = col, startIdx = i;
    if (ch === "\n") { i++; line++; col = 1; continue; }
    if (/\s/.test(ch)) { i++; col++; continue; }
    if (ch === "-" && sql[i + 1] === "-") { while (i < n && sql[i] !== "\n") i++; continue; }
    if (ch === "/" && sql[i + 1] === "*") { i += 2; while (i < n && !(sql[i] === "*" && sql[i + 1] === "/")) { if (sql[i] === "\n") { line++; col = 1; } i++; } i += 2; continue; }
    if (ch === "'") {
      var s = "", j = i + 1;
      while (j < n) { if (sql[j] === "'" && sql[j + 1] === "'") { s += "'"; j += 2; continue; } if (sql[j] === "'") break; s += sql[j]; j++; }
      if (j >= n) err("comilla simple sin cerrar", "Cada literal de texto abre y cierra con comilla simple: 'Pintura'.");
      col += (j + 1 - i); i = j + 1; push("string", s, startIdx); continue;
    }
    if (ch === '"') {
      var d = "", k = i + 1;
      while (k < n && sql[k] !== '"') { d += sql[k]; k++; }
      if (k >= n) err("comilla doble sin cerrar");
      col += (k + 1 - i); i = k + 1; push("ident", d, startIdx); toks[toks.length - 1].quoted = true; continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(sql[i + 1]))) {
      var num = ""; while (i < n && /[0-9.]/.test(sql[i])) { num += sql[i]; i++; col++; }
      push("number", parseFloat(num), startIdx); continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      var w = ""; while (i < n && /[A-Za-z0-9_$]/.test(sql[i])) { w += sql[i]; i++; col++; }
      var lw = w.toLowerCase();
      push(KWSET[lw] ? "kw" : "ident", KWSET[lw] ? lw : w, startIdx);
      toks[toks.length - 1].raw = w; continue;
    }
    var three = sql.substr(i, 2);
    if (three === "<=" || three === ">=" || three === "<>" || three === "!=" || three === "||" || three === "::") {
      i += 2; col += 2; push("op", three === "!=" ? "<>" : three, startIdx); continue;
    }
    if ("+-*/%(),.;=<>".indexOf(ch) >= 0) { i++; col++; push(ch === "(" || ch === ")" || ch === "," || ch === "." || ch === ";" ? "punc" : "op", ch, startIdx); continue; }
    err("caracter no reconocido: " + ch);
  }
  push("eof", null, n);
  return toks;
}

/* ---------------- parser ---------------- */
var WIN_ID = 0;
function Parser(toks, sql) { this.t = toks; this.i = 0; this.sql = sql; }
Parser.prototype.peek = function (k) { return this.t[this.i + (k || 0)]; };
Parser.prototype.next = function () { return this.t[this.i++]; };
Parser.prototype.isKw = function (w, k) { var t = this.peek(k); return t.type === "kw" && t.value === w; };
Parser.prototype.isPunc = function (c, k) { var t = this.peek(k); return t.type === "punc" && t.value === c; };
Parser.prototype.isOp = function (c) { var t = this.peek(); return t.type === "op" && t.value === c; };
Parser.prototype.eatKw = function (w) { if (this.isKw(w)) { this.i++; return true; } return false; };
Parser.prototype.expectKw = function (w) { if (!this.eatKw(w)) this.fail("se esperaba " + w.toUpperCase()); };
Parser.prototype.expectPunc = function (c) { if (this.isPunc(c)) { this.i++; return; } this.fail("se esperaba '" + c + "'"); };
Parser.prototype.fail = function (msg) {
  var t = this.peek();
  var got = t.type === "eof" ? "el final de la sentencia" : "'" + (t.raw || t.value) + "'";
  err("error de sintaxis cerca de " + got + ": " + msg);
};
Parser.prototype.identName = function () {
  var t = this.peek();
  if (t.type === "ident") { this.i++; return t.quoted ? t.value : t.value.toLowerCase(); }
  this.fail("se esperaba un nombre");
};

Parser.prototype.parseStatement = function () {
  var t = this.peek();
  if (t.type !== "kw") this.fail("una sentencia debe empezar con SELECT, INSERT, UPDATE, DELETE o ALTER");
  switch (t.value) {
    case "select": return this.parseSelect();
    case "with": return this.parseWith();
    case "update": return this.parseUpdate();
    case "delete": return this.parseDelete();
    case "insert": return this.parseInsert();
    case "alter": return this.parseAlter();
    case "create": err("CREATE no esta disponible en esta consola", "Las tablas del curso ya existen; usa SELECT, UPDATE o ALTER.");
    case "begin": case "commit": case "rollback": err(t.value.toUpperCase() + " no esta disponible en esta consola", "Cada ejercicio se evalua sobre una copia limpia de los datos.");
    default: this.fail("sentencia no reconocida");
  }
};

Parser.prototype.parseWith = function () {
  this.expectKw("with");
  var ctes = [];
  do {
    var name = this.identName();
    this.expectKw("as");
    this.expectPunc("(");
    var sub = this.isKw("with") ? this.parseWith() : this.parseSelect();
    this.expectPunc(")");
    ctes.push({ name: name, sub: sub });
  } while (this.isPunc(",") && (this.i++, true));
  var main;
  if (this.isKw("select")) main = this.parseSelect();
  else if (this.isKw("update")) main = this.parseUpdate();
  else if (this.isKw("delete")) main = this.parseDelete();
  else if (this.isKw("insert")) main = this.parseInsert();
  else this.fail("despues de los CTE se esperaba SELECT, UPDATE, DELETE o INSERT");
  main.ctes = ctes;
  return main;
};

Parser.prototype.parseSelect = function () {
  this.expectKw("select");
  var node = { kind: "select", distinct: false, cols: [], from: null, joins: [], where: null, groupBy: null, having: null, orderBy: null, limit: null, offset: null };
  if (this.eatKw("distinct")) node.distinct = true;
  do {
    if (this.isOp("*")) { this.i++; node.cols.push({ star: true }); }
    else if (this.peek().type === "ident" && this.isPunc(".", 1) && this.t[this.i + 2] && this.t[this.i + 2].type === "op" && this.t[this.i + 2].value === "*") {
      var tb = this.identName(); this.i += 2; node.cols.push({ star: true, table: tb });
    } else {
      var e = this.parseExpr(), alias = null;
      if (this.eatKw("as")) alias = this.identName();
      else if (this.peek().type === "ident" && !this.isPunc(",")) alias = this.identName();
      node.cols.push({ expr: e, alias: alias });
    }
  } while (this.isPunc(",") && (this.i++, true));
  if (this.eatKw("from")) {
    node.from = this.parseTableRef();
    while (true) {
      var jt = null;
      if (this.isKw("join")) { jt = "inner"; this.i++; }
      else if (this.isKw("inner")) { this.i++; this.expectKw("join"); jt = "inner"; }
      else if (this.isKw("left")) { this.i++; this.eatKw("outer"); this.expectKw("join"); jt = "left"; }
      else if (this.isKw("right")) { this.i++; this.eatKw("outer"); this.expectKw("join"); jt = "right"; }
      else if (this.isKw("full")) { this.i++; this.eatKw("outer"); this.expectKw("join"); jt = "full"; }
      else if (this.isKw("cross")) { this.i++; this.expectKw("join"); jt = "cross"; }
      else if (this.isPunc(",")) { this.i++; jt = "cross"; }
      else break;
      var tr = this.parseTableRef(), on = null;
      if (this.eatKw("on")) on = this.parseExpr();
      else if (jt !== "cross") err("al JOIN de " + tr.name + " le falta la condicion ON", "Todo JOIN necesita un ON que diga como se emparejan las filas: ON s.id = e.sucursal_id");
      node.joins.push({ type: jt, table: tr, on: on });
    }
  }
  if (this.eatKw("where")) node.where = this.parseExpr();
  if (this.eatKw("group")) { this.expectKw("by"); node.groupBy = []; do { node.groupBy.push(this.parseExpr()); } while (this.isPunc(",") && (this.i++, true)); }
  if (this.eatKw("having")) node.having = this.parseExpr();
  if (this.eatKw("order")) {
    this.expectKw("by"); node.orderBy = [];
    do { var oe = this.parseExpr(), dir = "asc"; if (this.eatKw("asc")) dir = "asc"; else if (this.eatKw("desc")) dir = "desc"; node.orderBy.push({ expr: oe, dir: dir }); }
    while (this.isPunc(",") && (this.i++, true));
  }
  if (this.eatKw("limit")) { node.limit = this.parseExpr(); }
  if (this.eatKw("offset")) { node.offset = this.parseExpr(); }
  if (node.limit === null && this.isKw("offset")) { this.i++; node.offset = this.parseExpr(); }
  return node;
};

Parser.prototype.parseTableRef = function () {
  if (this.isPunc("(")) {
    this.i++; var sub = this.parseSelect(); this.expectPunc(")");
    var a = null; if (this.eatKw("as")) a = this.identName(); else if (this.peek().type === "ident") a = this.identName();
    if (!a) err("una subconsulta en el FROM necesita alias", "Escribe: FROM (SELECT ...) t");
    return { sub: sub, alias: a, name: a };
  }
  var name = this.identName(), alias = null;
  if (this.eatKw("as")) alias = this.identName();
  else if (this.peek().type === "ident") alias = this.identName();
  return { name: name, alias: alias || name };
};

/* expresiones: precedencia OR < AND < NOT < comparacion < aditivo < multiplicativo < unario < primario */
Parser.prototype.parseExpr = function () { return this.parseOr(); };
Parser.prototype.parseOr = function () { var l = this.parseAnd(); while (this.eatKw("or")) l = { op: "or", l: l, r: this.parseAnd() }; return l; };
Parser.prototype.parseAnd = function () { var l = this.parseNot(); while (this.eatKw("and")) l = { op: "and", l: l, r: this.parseNot() }; return l; };
Parser.prototype.parseNot = function () { if (this.eatKw("not")) return { op: "not", e: this.parseNot() }; return this.parseCmp(); };
Parser.prototype.parseCmp = function () {
  var l = this.parseAdd();
  while (true) {
    var t = this.peek();
    if (t.type === "op" && ["=", "<>", "<", ">", "<=", ">="].indexOf(t.value) >= 0) { this.i++; l = { op: "cmp", cmp: t.value, l: l, r: this.parseAdd() }; continue; }
    if (this.isKw("is")) {
      this.i++; var neg = this.eatKw("not");
      if (this.eatKw("null")) { l = { op: "isnull", e: l, neg: neg }; continue; }
      if (this.isKw("distinct")) { this.i++; this.expectKw("from"); l = { op: "distinctfrom", l: l, r: this.parseAdd(), neg: neg }; continue; }
      if (this.eatKw("true")) { l = { op: "cmp", cmp: neg ? "<>" : "=", l: l, r: { lit: true } }; continue; }
      if (this.eatKw("false")) { l = { op: "cmp", cmp: neg ? "<>" : "=", l: l, r: { lit: false } }; continue; }
      this.fail("se esperaba NULL despues de IS");
    }
    var neg2 = false, save = this.i;
    if (this.isKw("not") && (this.isKw("in", 1) || this.isKw("between", 1) || this.isKw("like", 1) || this.isKw("ilike", 1) || this.isKw("exists", 1))) { this.i++; neg2 = true; }
    if (this.isKw("in")) {
      this.i++; this.expectPunc("(");
      if (this.isKw("select")) { var sq = this.parseSelect(); this.expectPunc(")"); l = { op: "insub", e: l, sub: sq, neg: neg2 }; }
      else { var list = []; do { list.push(this.parseExpr()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")"); l = { op: "inlist", e: l, list: list, neg: neg2 }; }
      continue;
    }
    if (this.isKw("between")) { this.i++; var lo = this.parseAdd(); this.expectKw("and"); var hi = this.parseAdd(); l = { op: "between", e: l, lo: lo, hi: hi, neg: neg2 }; continue; }
    if (this.isKw("like") || this.isKw("ilike")) { var ci = this.peek().value === "ilike"; this.i++; l = { op: "like", e: l, pat: this.parseAdd(), neg: neg2, ci: ci }; continue; }
    if (neg2) this.i = save;
    break;
  }
  return l;
};
Parser.prototype.parseAdd = function () {
  var l = this.parseMul();
  while (true) { var t = this.peek(); if (t.type === "op" && (t.value === "+" || t.value === "-" || t.value === "||")) { this.i++; l = { op: "bin", o: t.value, l: l, r: this.parseMul() }; } else break; }
  return l;
};
Parser.prototype.parseMul = function () {
  var l = this.parseUnary();
  while (true) { var t = this.peek(); if (t.type === "op" && (t.value === "*" || t.value === "/" || t.value === "%")) { this.i++; l = { op: "bin", o: t.value, l: l, r: this.parseUnary() }; } else break; }
  return l;
};
Parser.prototype.parseUnary = function () {
  if (this.isOp("-")) { this.i++; return { op: "neg", e: this.parseUnary() }; }
  if (this.isOp("+")) { this.i++; return this.parseUnary(); }
  var e = this.parsePrimary();
  while (this.peek().type === "op" && this.peek().value === "::") { this.i++; var ty = this.identName(); e = { op: "cast", e: e, to: ty }; }
  return e;
};
Parser.prototype.parsePrimary = function () {
  var t = this.peek();
  if (t.type === "number") { this.i++; return { lit: t.value }; }
  if (t.type === "string") { this.i++; return { lit: t.value, isStr: true }; }
  if (t.type === "kw" && t.value === "null") { this.i++; return { lit: null }; }
  if (t.type === "kw" && (t.value === "true" || t.value === "false")) { this.i++; return { lit: t.value === "true" }; }
  if (t.type === "kw" && t.value === "case") return this.parseCase();
  if (t.type === "kw" && t.value === "exists") { this.i++; this.expectPunc("("); var s = this.parseSelect(); this.expectPunc(")"); return { op: "exists", sub: s }; }
  if (t.type === "kw" && t.value === "not") { this.i++; return { op: "not", e: this.parseUnary() }; }
  if (this.isPunc("(")) {
    this.i++;
    if (this.isKw("select")) { var sub = this.parseSelect(); this.expectPunc(")"); return { op: "scalarsub", sub: sub }; }
    var e = this.parseExpr(); this.expectPunc(")"); return e;
  }
  if (t.type === "ident" && this.peek(1).type === "string" && /^(date|timestamp|time|interval)$/i.test(t.raw || t.value)) {
    this.i += 2; return { lit: this.t[this.i - 1].value, isStr: true, typed: (t.raw || t.value).toLowerCase() };
  }
  if (t.type === "ident" || (t.type === "kw" && (t.value === "left" || t.value === "right"))) {
    // funcion?
    if (this.isPunc("(", 1)) {
      var fname = (t.raw || t.value).toLowerCase(); this.i += 2;
      if (fname === "cast") {
        var ce = this.parseExpr();
        this.expectKw("as");
        var ct = this.parseType();
        this.expectPunc(")");
        return { op: "cast", e: ce, to: ct };
      }
      if (fname === "extract") {
        var part = this.identName();
        this.expectKw("from");
        var src = this.parseExpr();
        this.expectPunc(")");
        return { op: "func", name: "extract", args: [{ lit: part, isStr: true }, src], star: false, distinct: false };
      }
      var args = [], star = false, dist = false;
      if (this.isOp("*")) { this.i++; star = true; }
      else if (!this.isPunc(")")) {
        if (this.eatKw("distinct")) dist = true;
        do { if (this.isKw("from")) { this.i++; args.push(this.parseExpr()); } else args.push(this.parseExpr()); } while (this.isPunc(",") && (this.i++, true));
      }
      this.expectPunc(")");
      if (this.isKw("over")) {
        this.i++; this.expectPunc("(");
        var part = [], ord = [];
        if (this.eatKw("partition")) { this.expectKw("by"); do { part.push(this.parseExpr()); } while (this.isPunc(",") && (this.i++, true)); }
        if (this.eatKw("order")) {
          this.expectKw("by");
          do { var oe2 = this.parseExpr(), d2 = "asc"; if (this.eatKw("asc")) d2 = "asc"; else if (this.eatKw("desc")) d2 = "desc"; ord.push({ expr: oe2, dir: d2 }); }
          while (this.isPunc(",") && (this.i++, true));
        }
        this.expectPunc(")");
        return { op: "window", name: fname, args: args, star: star, partition: part, order: ord, _id: ++WIN_ID };
      }
      return { op: "func", name: fname, args: args, star: star, distinct: dist };
    }
    var name = this.identName();
    if (this.isPunc(".")) { this.i++; if (this.isOp("*")) { this.i++; return { op: "colstar", table: name }; } var c = this.identName(); return { op: "col", table: name, name: c }; }
    return { op: "col", table: null, name: name };
  }
  this.fail("se esperaba un valor, una columna o una funcion");
};
Parser.prototype.parseCase = function () {
  this.expectKw("case");
  var subject = null;
  if (!this.isKw("when")) subject = this.parseExpr();
  var whens = [];
  while (this.eatKw("when")) { var c = this.parseExpr(); this.expectKw("then"); whens.push({ cond: c, val: this.parseExpr() }); }
  var els = null; if (this.eatKw("else")) els = this.parseExpr();
  this.expectKw("end");
  if (!whens.length) err("un CASE necesita al menos un WHEN");
  return { op: "case", subject: subject, whens: whens, els: els };
};

Parser.prototype.parseUpdate = function () {
  this.expectKw("update");
  var tr = this.parseTableRef();
  this.expectKw("set");
  var sets = [];
  do {
    var t0 = this.peek();
    var c1 = this.identName();
    if (this.isPunc(".")) {
      this.i++; var c2 = this.identName();
      err('column "' + c1 + '" of relation "' + tr.name + '" does not exist',
        "En PostgreSQL, del lado izquierdo del SET va solo el nombre de la columna: SET " + c2 + " = ...  El alias sigue siendo valido en el WHERE y del lado derecho.");
    }
    if (!this.isOp("=")) this.fail("se esperaba '=' despues de la columna en el SET");
    this.i++;
    sets.push({ col: c1, expr: this.parseExpr() });
  } while (this.isPunc(",") && (this.i++, true));
  var from = null;
  if (this.eatKw("from")) from = this.parseTableRef();
  var where = null;
  if (this.eatKw("where")) where = this.parseExpr();
  return { kind: "update", table: tr, sets: sets, from: from, where: where };
};
Parser.prototype.parseDelete = function () {
  this.expectKw("delete"); this.expectKw("from");
  var tr = this.parseTableRef(), where = null;
  if (this.eatKw("where")) where = this.parseExpr();
  return { kind: "delete", table: tr, where: where };
};
Parser.prototype.parseInsert = function () {
  this.expectKw("insert"); this.expectKw("into");
  var name = this.identName(), cols = null;
  if (this.isPunc("(")) { this.i++; cols = []; do { cols.push(this.identName()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")"); }
  if (this.eatKw("values")) {
    var rows = [];
    do { this.expectPunc("("); var vals = []; do { vals.push(this.parseExpr()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")"); rows.push(vals); }
    while (this.isPunc(",") && (this.i++, true));
    return { kind: "insert", table: name, cols: cols, rows: rows };
  }
  if (this.isKw("select")) return { kind: "insert", table: name, cols: cols, sub: this.parseSelect() };
  this.fail("se esperaba VALUES o SELECT");
};
Parser.prototype.parseAlter = function () {
  this.expectKw("alter"); this.expectKw("table");
  var name = this.identName();
  var a = { kind: "alter", table: name, actions: [] };
  do {
    if (this.eatKw("add")) {
      if (this.isKw("constraint") || this.isKw("check") || this.isKw("unique") || this.isKw("primary") || this.isKw("foreign")) {
        var cname = null;
        if (this.eatKw("constraint")) cname = this.identName();
        a.actions.push(this.parseConstraint(cname));
      } else {
        this.eatKw("column");
        a.actions.push(this.parseColumnDef("addcol"));
      }
    } else if (this.eatKw("drop")) {
      if (this.eatKw("constraint")) { this.eatKw("if"); this.eatKw("exists"); a.actions.push({ t: "dropconstraint", name: this.identName() }); }
      else { this.eatKw("column"); this.eatKw("if"); this.eatKw("exists"); a.actions.push({ t: "dropcol", name: this.identName() }); }
    } else if (this.eatKw("rename")) {
      if (this.eatKw("column")) { var from = this.identName(); this.expectKw("to"); a.actions.push({ t: "renamecol", from: from, to: this.identName() }); }
      else { this.expectKw("to"); a.actions.push({ t: "renametable", to: this.identName() }); }
    } else if (this.eatKw("alter")) {
      this.eatKw("column");
      var col = this.identName();
      if (this.eatKw("type")) { var ty = this.parseType(); a.actions.push({ t: "coltype", name: col, type: ty }); }
      else if (this.eatKw("set")) {
        if (this.eatKw("default")) a.actions.push({ t: "setdefault", name: col, expr: this.parseExpr() });
        else if (this.eatKw("not")) { this.expectKw("null"); a.actions.push({ t: "setnotnull", name: col }); }
        else this.fail("se esperaba DEFAULT o NOT NULL");
      } else if (this.eatKw("drop")) {
        if (this.eatKw("default")) a.actions.push({ t: "dropdefault", name: col });
        else if (this.eatKw("not")) { this.expectKw("null"); a.actions.push({ t: "dropnotnull", name: col }); }
        else this.fail("se esperaba DEFAULT o NOT NULL");
      } else this.fail("accion de ALTER COLUMN no reconocida");
    } else if (this.isKw("modify")) {
      err('syntax error at or near "MODIFY"',
        "MODIFY es sintaxis de Oracle. En PostgreSQL se escribe: ALTER TABLE t ALTER COLUMN c TYPE nuevo_tipo.");
    } else this.fail("accion de ALTER TABLE no reconocida");
  } while (this.isPunc(",") && (this.i++, true));
  return a;
};
var TIPOS_OK = /^(varchar|character|char|text|numeric|decimal|integer|int|int4|int8|bigint|smallint|real|double|float|boolean|bool|date|timestamp|time|serial|bigserial)$/i;
Parser.prototype.parseType = function () {
  var t = this.peek();
  var base = (t.type === "kw" || t.type === "ident") ? (t.raw || String(t.value)) : null;
  if (!base) this.fail("se esperaba un tipo de dato");
  if (!TIPOS_OK.test(base)) {
    var equiv = /^number$/i.test(base) ? "NUMBER es el tipo de Oracle; en PostgreSQL se escribe NUMERIC(p,s)."
              : /^varchar2$/i.test(base) ? "VARCHAR2 es el tipo de Oracle; en PostgreSQL se escribe VARCHAR(n)."
              : "Tipos validos: VARCHAR(n), TEXT, NUMERIC(p,s), INTEGER, BIGINT, SMALLINT, DATE, TIMESTAMP, BOOLEAN.";
    err('type "' + base.toLowerCase() + '" does not exist', equiv);
  }
  this.i++;
  var full = base;
  if (this.isPunc("(")) { this.i++; var parts = []; while (!this.isPunc(")")) { var x = this.next(); if (x.type === "number") parts.push(x.value); } this.expectPunc(")"); full += "(" + parts.join(",") + ")"; }
  return full;
};
Parser.prototype.parseColumnDef = function (t) {
  var name = this.identName(), type = this.parseType(), def = null, notnull = false;
  while (true) {
    if (this.eatKw("default")) { def = this.parseExpr(); continue; }
    if (this.isKw("not") && this.isKw("null", 1)) { this.i += 2; notnull = true; continue; }
    if (this.eatKw("null")) { continue; }
    if (this.eatKw("unique")) { continue; }
    break;
  }
  return { t: t, name: name, type: type, def: def, notnull: notnull };
};
Parser.prototype.parseConstraint = function (cname) {
  if (this.eatKw("check")) { this.expectPunc("("); var e = this.parseExpr(); this.expectPunc(")"); return { t: "addcheck", name: cname, expr: e }; }
  if (this.eatKw("unique")) { this.expectPunc("("); var cols = []; do { cols.push(this.identName()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")"); return { t: "adduniq", name: cname, cols: cols }; }
  if (this.eatKw("primary")) { this.expectKw("key"); this.expectPunc("("); var pc = []; do { pc.push(this.identName()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")"); return { t: "addpk", name: cname, cols: pc }; }
  if (this.eatKw("foreign")) {
    this.expectKw("key"); this.expectPunc("("); var fc = []; do { fc.push(this.identName()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")");
    this.expectKw("references"); var rt = this.identName(), rc = [];
    if (this.isPunc("(")) { this.i++; do { rc.push(this.identName()); } while (this.isPunc(",") && (this.i++, true)); this.expectPunc(")"); }
    return { t: "addfk", name: cname, cols: fc, reft: rt, refc: rc };
  }
  this.fail("tipo de restriccion no reconocido");
};

function parse(sql) {
  var toks = tokenize(sql);
  var p = new Parser(toks, sql);
  var stmts = [];
  while (p.peek().type !== "eof") {
    if (p.isPunc(";")) { p.i++; continue; }
    stmts.push(p.parseStatement());
    if (p.isPunc(";")) p.i++;
    else if (p.peek().type !== "eof") p.fail("se esperaba ';' o el final de la sentencia");
  }
  return stmts;
}

/* ---------------- valores ---------------- */
function isNull(v) { return v === null || v === undefined; }
function num(v) { if (isNull(v)) return null; if (typeof v === "number") return v; if (v instanceof Date) return v.getTime(); var f = parseFloat(v); return isNaN(f) ? null : f; }
function isDateStr(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }
function cmpVals(a, b) {
  if (isNull(a) || isNull(b)) return null;
  if (typeof a === "boolean" || typeof b === "boolean") { a = a ? 1 : 0; b = b ? 1 : 0; }
  if (typeof a === "number" && typeof b === "number") return a < b ? -1 : a > b ? 1 : 0;
  if (isDateStr(a) && isDateStr(b)) return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === "number" || typeof b === "number") { var x = num(a), y = num(b); if (x === null || y === null) { a = String(a); b = String(b); } else return x < y ? -1 : x > y ? 1 : 0; }
  a = String(a); b = String(b);
  return a < b ? -1 : a > b ? 1 : 0;
}
function truthy(v) { return v === true; }

/* ---------------- evaluador de expresiones ---------------- */
function Ctx(db, row, groupRows, outer, win) { this.db = db; this.row = row; this.groupRows = groupRows; this.outer = outer; this.win = win || null; }

var AGG = { count: 1, sum: 1, avg: 1, min: 1, max: 1 };

function hasWindow(e) {
  if (!e || typeof e !== "object") return false;
  if (e.op === "window") return true;
  for (var k in e) { if (k === "sub") continue; var v = e[k]; if (v && typeof v === "object") { if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) if (hasWindow(v[i])) return true; } else if (hasWindow(v)) return true; } }
  return false;
}
function collectWindows(e, acc) {
  acc = acc || [];
  if (!e || typeof e !== "object") return acc;
  if (e.op === "window") { acc.push(e); return acc; }
  for (var k in e) { if (k === "sub") continue; var v = e[k]; if (v && typeof v === "object") { if (Array.isArray(v)) v.forEach(function (x) { collectWindows(x, acc); }); else collectWindows(v, acc); } }
  return acc;
}
function hasAgg(e) {
  if (!e || typeof e !== "object") return false;
  if (e.op === "window") { return e.args.some(hasAgg) || e.partition.some(hasAgg) || e.order.some(function (o) { return hasAgg(o.expr); }); }
  if (e.op === "func" && AGG[e.name]) return true;
  for (var k in e) { if (k === "sub") continue; var v = e[k]; if (v && typeof v === "object") { if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) if (hasAgg(v[i])) return true; } else if (hasAgg(v)) return true; } }
  return false;
}

function lookupCol(ctx, table, name) {
  var row = ctx.row;
  if (!row) return { found: false };
  var key = (table ? table + "." : "") + name;
  if (table) {
    if (Object.prototype.hasOwnProperty.call(row, key)) return { found: true, v: row[key] };
    return { found: false, reason: "table" };
  }
  var hits = [], val;
  for (var k in row) { var dot = k.indexOf("."); if (dot >= 0 && k.substr(dot + 1) === name) { hits.push(k); val = row[k]; } }
  if (hits.length === 1) return { found: true, v: val };
  if (hits.length > 1) {
    var same = hits.every(function (h) { return row[h] === row[hits[0]]; });
    if (same) return { found: true, v: row[hits[0]] };
    err('column reference "' + name + '" is ambiguous', "Esa columna existe en mas de una tabla. Califica con el alias: e." + name + " o s." + name + ".");
  }
  if (Object.prototype.hasOwnProperty.call(row, "__alias__" + name)) return { found: true, v: row["__alias__" + name] };
  return { found: false };
}

function evalExpr(e, ctx) {
  if (!e) return null;
  if ("lit" in e) return e.lit;
  switch (e.op) {
    case "col": {
      var r = lookupCol(ctx, e.table, e.name);
      if (r.found) return r.v;
      if (ctx.outer) { var ro = lookupCol(new Ctx(ctx.db, ctx.outer.row, null, ctx.outer.outer), e.table, e.name); if (ro.found) return ro.v; }
      if (e.table) {
        var tabs = {}; if (ctx.row) for (var k in ctx.row) { var d = k.indexOf("."); if (d > 0) tabs[k.substr(0, d)] = 1; }
        if (!tabs[e.table]) err('missing FROM-clause entry for table "' + e.table + '"', "No hay ninguna tabla con el alias " + e.table + " en el FROM. Revisa los alias que declaraste.");
        err('column ' + e.table + '."' + e.name + '" does not exist', "La tabla " + e.table + " no tiene una columna llamada " + e.name + ".");
      }
      err('column "' + e.name + '" does not exist', "Revisa el nombre de la columna, o si querias escribir un texto: los literales van entre comillas simples ('" + e.name + "').");
      break;
    }
    case "and": { var a = evalExpr(e.l, ctx); if (a === false) return false; var b = evalExpr(e.r, ctx); if (b === false) return false; if (isNull(a) || isNull(b)) return null; return true; }
    case "or": { var a2 = evalExpr(e.l, ctx); if (a2 === true) return true; var b2 = evalExpr(e.r, ctx); if (b2 === true) return true; if (isNull(a2) || isNull(b2)) return null; return false; }
    case "not": { var v = evalExpr(e.e, ctx); return isNull(v) ? null : !v; }
    case "cmp": {
      var l = evalExpr(e.l, ctx), r2 = evalExpr(e.r, ctx), c = cmpVals(l, r2);
      if (c === null) return null;
      switch (e.cmp) { case "=": return c === 0; case "<>": return c !== 0; case "<": return c < 0; case ">": return c > 0; case "<=": return c <= 0; case ">=": return c >= 0; }
      break;
    }
    case "isnull": { var v2 = evalExpr(e.e, ctx); return e.neg ? !isNull(v2) : isNull(v2); }
    case "distinctfrom": { var l3 = evalExpr(e.l, ctx), r3 = evalExpr(e.r, ctx); var d3 = (isNull(l3) && isNull(r3)) ? false : (isNull(l3) || isNull(r3)) ? true : cmpVals(l3, r3) !== 0; return e.neg ? !d3 : d3; }
    case "between": { var v3 = evalExpr(e.e, ctx), lo = evalExpr(e.lo, ctx), hi = evalExpr(e.hi, ctx); var c1 = cmpVals(v3, lo), c2 = cmpVals(v3, hi); if (c1 === null || c2 === null) return null; var res = c1 >= 0 && c2 <= 0; return e.neg ? !res : res; }
    case "inlist": {
      var v4 = evalExpr(e.e, ctx); if (isNull(v4)) return null;
      var anyNull = false, found = false;
      for (var i = 0; i < e.list.length; i++) { var iv = evalExpr(e.list[i], ctx); if (isNull(iv)) { anyNull = true; continue; } if (cmpVals(v4, iv) === 0) { found = true; break; } }
      if (found) return e.neg ? false : true;
      if (anyNull) return null;
      return e.neg ? true : false;
    }
    case "insub": {
      var v5 = evalExpr(e.e, ctx); var rows = runSelect(e.sub, ctx.db, ctx);
      if (isNull(v5)) return null;
      var anyNull2 = false, f2 = false;
      for (var j = 0; j < rows.rows.length; j++) { var sv = rows.rows[j][rows.cols[0]]; if (isNull(sv)) { anyNull2 = true; continue; } if (cmpVals(v5, sv) === 0) { f2 = true; break; } }
      if (f2) return e.neg ? false : true;
      if (anyNull2) return null;
      return e.neg ? true : false;
    }
    case "exists": { var rs = runSelect(e.sub, ctx.db, ctx); return rs.rows.length > 0; }
    case "scalarsub": {
      var rs2 = runSelect(e.sub, ctx.db, ctx);
      if (rs2.rows.length === 0) return null;
      if (rs2.rows.length > 1) err("more than one row returned by a subquery used as an expression", "Esa subconsulta devuelve varias filas y se esta usando como si fuera un solo valor. Agrega una agregacion (AVG, MAX) o un filtro.");
      return rs2.rows[0][rs2.cols[0]];
    }
    case "like": {
      var s = evalExpr(e.e, ctx), p = evalExpr(e.pat, ctx);
      if (isNull(s) || isNull(p)) return null;
      s = String(s); p = String(p);
      var rx = "^" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, "[\\s\\S]*").replace(/_/g, "[\\s\\S]") + "$";
      var ok = new RegExp(rx, e.ci ? "i" : "").test(s);
      return e.neg ? !ok : ok;
    }
    case "bin": {
      var x = evalExpr(e.l, ctx), y = evalExpr(e.r, ctx);
      if (e.o === "||") { if (isNull(x) || isNull(y)) return null; return String(x) + String(y); }
      if (isNull(x) || isNull(y)) return null;
      if (isDateStr(x) && typeof y === "number" && (e.o === "+" || e.o === "-")) { var dd = new Date(x + "T00:00:00Z"); dd.setUTCDate(dd.getUTCDate() + (e.o === "+" ? y : -y)); return dd.toISOString().slice(0, 10); }
      var nx = num(x), ny = num(y);
      if (nx === null || ny === null) err("operador " + e.o + " no aplicable a esos valores");
      switch (e.o) { case "+": return nx + ny; case "-": return nx - ny; case "*": return nx * ny; case "/": return ny === 0 ? err("division by zero", "Alguna fila tiene cero en el divisor. Protege con NULLIF(divisor, 0).") : nx / ny; case "%": return nx % ny; }
      break;
    }
    case "neg": { var nv = evalExpr(e.e, ctx); return isNull(nv) ? null : -num(nv); }
    case "cast": { var cv = evalExpr(e.e, ctx); if (isNull(cv)) return null; var t = e.to.toLowerCase(); if (/^(integer|int|int4|int8|bigint|smallint)/.test(t)) { var nv2 = num(cv); return nv2 === null ? null : (nv2 < 0 ? -Math.round(-nv2) : Math.round(nv2)); } if (/numeric|decimal|real|double|float/.test(t)) return num(cv); if (/text|varchar|char/.test(t)) return String(cv); return cv; }
    case "case": {
      var subj = e.subject ? evalExpr(e.subject, ctx) : null;
      for (var w = 0; w < e.whens.length; w++) {
        var ok2;
        if (e.subject) { var wv = evalExpr(e.whens[w].cond, ctx); ok2 = cmpVals(subj, wv) === 0; }
        else ok2 = truthy(evalExpr(e.whens[w].cond, ctx));
        if (ok2) return evalExpr(e.whens[w].val, ctx);
      }
      return e.els ? evalExpr(e.els, ctx) : null;
    }
    case "func": return evalFunc(e, ctx);
    case "window": {
      if (!ctx.win || !(e._id in ctx.win)) err("window functions are not allowed in WHERE", "Una funcion de ventana solo puede ir en el SELECT o en el ORDER BY. Para filtrar por su resultado, envuelvela en un CTE (WITH) y filtra afuera.");
      return ctx.win[e._id];
    }
    case "colstar": err("no se puede usar " + e.table + ".* aqui");
  }
  err("expresion no soportada");
}

function evalFunc(e, ctx) {
  var n = e.name;
  if (AGG[n]) {
    var rows = ctx.groupRows;
    if (!rows) err('aggregate functions are not allowed in WHERE',
      "WHERE se ejecuta antes de agrupar, cuando todavia no existe ninguna suma ni conteo. Para filtrar por un agregado usa HAVING despues del GROUP BY.");
    var vals = [];
    if (n === "count" && e.star) return rows.length;
    for (var i = 0; i < rows.length; i++) { var v = evalExpr(e.args[0], new Ctx(ctx.db, rows[i], null, ctx.outer)); if (!isNull(v)) vals.push(v); }
    if (e.distinct) { var seen = {}, out = []; vals.forEach(function (v) { var k = typeof v + ":" + v; if (!seen[k]) { seen[k] = 1; out.push(v); } }); vals = out; }
    switch (n) {
      case "count": return vals.length;
      case "sum": { if (!vals.length) return null; var s = 0; vals.forEach(function (v) { s += num(v); }); return s; }
      case "avg": { if (!vals.length) return null; var s2 = 0; vals.forEach(function (v) { s2 += num(v); }); return s2 / vals.length; }
      case "min": { if (!vals.length) return null; var m = vals[0]; vals.forEach(function (v) { if (cmpVals(v, m) < 0) m = v; }); return m; }
      case "max": { if (!vals.length) return null; var M = vals[0]; vals.forEach(function (v) { if (cmpVals(v, M) > 0) M = v; }); return M; }
    }
  }
  var a = e.args.map(function (x) { return evalExpr(x, ctx); });
  switch (n) {
    case "round": { if (isNull(a[0])) return null; var d = a.length > 1 ? num(a[1]) : 0, f = Math.pow(10, d); return Math.round((num(a[0]) + Number.EPSILON) * f) / f; }
    case "coalesce": { for (var i = 0; i < a.length; i++) if (!isNull(a[i])) return a[i]; return null; }
    case "nvl": { return isNull(a[0]) ? a[1] : a[0]; }
    case "nullif": return cmpVals(a[0], a[1]) === 0 ? null : a[0];
    case "greatest": { var g = null; a.forEach(function (v) { if (isNull(v)) return; if (g === null || cmpVals(v, g) > 0) g = v; }); return g; }
    case "least": { var l = null; a.forEach(function (v) { if (isNull(v)) return; if (l === null || cmpVals(v, l) < 0) l = v; }); return l; }
    case "upper": return isNull(a[0]) ? null : String(a[0]).toUpperCase();
    case "lower": return isNull(a[0]) ? null : String(a[0]).toLowerCase();
    case "length": return isNull(a[0]) ? null : String(a[0]).length;
    case "trim": return isNull(a[0]) ? null : String(a[0]).trim();
    case "abs": return isNull(a[0]) ? null : Math.abs(num(a[0]));
    case "left": return isNull(a[0]) ? null : String(a[0]).slice(0, num(a[1]));
    case "right": return isNull(a[0]) ? null : String(a[0]).slice(-num(a[1]));
    case "substr": return isNull(a[0]) ? null : String(a[0]).substr(num(a[1]) - 1, a.length > 2 ? num(a[2]) : undefined);
    case "concat": return a.map(function (v) { return isNull(v) ? "" : String(v); }).join("");
    case "current_date": case "now": return ctx.db.today;
    case "date": return a[0];
    case "extract": {
      var part = String(a[0]).toLowerCase();
      var dv = a[a.length - 1];
      if (isNull(dv)) return null;
      var d2 = String(dv);
      if (part === "year") return parseInt(d2.slice(0, 4), 10);
      if (part === "month") return parseInt(d2.slice(5, 7), 10);
      if (part === "day") return parseInt(d2.slice(8, 10), 10);
      err("EXTRACT de '" + part + "' no esta soportado");
      break;
    }
    case "to_char": return isNull(a[0]) ? null : String(a[0]);
    case "row_number": case "rank": case "dense_rank":
      err("window function " + n + " requires an OVER clause", "Escribe " + n.toUpperCase() + "() OVER (PARTITION BY ... ORDER BY ...).");
      break;
  }
  err('function ' + n + '() does not exist', "Esta consola soporta COUNT, SUM, AVG, MIN, MAX, ROUND, COALESCE, UPPER, LOWER, LENGTH, ABS, EXTRACT, NULLIF, GREATEST y LEAST.");
}

/* ---------------- ejecucion de SELECT ---------------- */
function tableRows(db, name) {
  var t = db.tables[name];
  if (!t) {
    var similar = Object.keys(db.tables).filter(function (k) { return k[0] === name[0]; });
    err('relation "' + name + '" does not exist',
      "Las tablas disponibles son: " + Object.keys(db.tables).join(", ") + ".");
  }
  return t;
}
function prefixRow(alias, row, cols) {
  var o = {};
  for (var i = 0; i < cols.length; i++) o[alias + "." + cols[i]] = row ? row[cols[i]] : null;
  return o;
}
function merge(a, b) { var o = {}; for (var k in a) o[k] = a[k]; for (var k2 in b) o[k2] = b[k2]; return o; }

function sourceRows(tr, db, outer) {
  if (tr.sub) {
    var rs = runSelect(tr.sub, db, outer);
    return { alias: tr.alias, cols: rs.cols, rows: rs.rows.map(function (r) { return prefixRow(tr.alias, r, rs.cols); }) };
  }
  var t = tableRows(db, tr.name);
  return { alias: tr.alias, cols: t.cols.slice(), rows: t.rows.map(function (r) { return prefixRow(tr.alias, r, t.cols); }) };
}

function conCTEs(node, db, outer) {
  if (!node.ctes || !node.ctes.length) return db;
  var db2 = { today: db.today, tables: {} };
  for (var k in db.tables) db2.tables[k] = db.tables[k];
  node.ctes.forEach(function (c) {
    var rs = runSelect(c.sub, db2, outer);
    var meta = {}; rs.cols.forEach(function (col) { meta[col] = {}; });
    db2.tables[c.name] = { cols: rs.cols.slice(), meta: meta, rows: rs.rows, constraints: [] };
  });
  return db2;
}

/* calcula el valor de cada funcion de ventana para cada grupo */
function calcularVentanas(winNodes, groups, db, outer) {
  var vals = {};
  winNodes.forEach(function (w) {
    var byId = {};
    // clave de particion y valor de orden por grupo
    var info = groups.map(function (g, i) {
      var ctx = new Ctx(db, g.rep, g.rows, outer);
      var pk = w.partition.map(function (p) { var v = evalExpr(p, ctx); return typeof v + ":" + v; }).join("|");
      var ov = w.order.map(function (o) { return evalExpr(o.expr, ctx); });
      var arg = (w.args.length && !w.star) ? evalExpr(w.args[0], ctx) : null;
      return { i: i, pk: pk, ov: ov, arg: arg };
    });
    var parts = {};
    info.forEach(function (x) { (parts[x.pk] = parts[x.pk] || []).push(x); });
    Object.keys(parts).forEach(function (pk) {
      var lista = parts[pk];
      lista.sort(function (a, b) {
        for (var o = 0; o < w.order.length; o++) {
          var c = cmpVals(a.ov[o], b.ov[o]);
          if (c === null) c = isNull(a.ov[o]) && isNull(b.ov[o]) ? 0 : isNull(a.ov[o]) ? 1 : -1;
          if (c !== 0) return w.order[o].dir === "desc" ? -c : c;
        }
        return a.i - b.i;
      });
      var n = w.name, rank = 0, dense = 0, prev = null, acc = [], total = null;
      // para agregados sin ORDER BY: el total de la particion
      if (AGG[n] && !w.order.length) {
        var todos = lista.map(function (x) { return x.arg; }).filter(function (v) { return !isNull(v); });
        total = agregar(n, w.star ? lista.length : null, todos);
      }
      lista.forEach(function (x, pos) {
        var mismo = prev !== null && w.order.every(function (o, k) { return cmpVals(prev.ov[k], x.ov[k]) === 0; });
        if (!mismo) { rank = pos + 1; dense++; }
        var v;
        switch (n) {
          case "row_number": v = pos + 1; break;
          case "rank": v = rank; break;
          case "dense_rank": v = dense; break;
          default:
            if (!AGG[n]) err('function ' + n + '() OVER no esta soportada', "Ventanas disponibles: ROW_NUMBER, RANK, DENSE_RANK, SUM, COUNT, AVG, MIN, MAX.");
            if (!w.order.length) { v = total; break; }
            // acumulado hasta la fila actual, incluyendo empates
            acc = lista.slice(0, pos + 1);
            var j = pos + 1; while (j < lista.length && w.order.every(function (o, k) { return cmpVals(lista[j].ov[k], x.ov[k]) === 0; })) { acc.push(lista[j]); j++; }
            var vs = acc.map(function (y) { return y.arg; }).filter(function (q) { return !isNull(q); });
            v = agregar(n, w.star ? acc.length : null, vs);
        }
        byId[x.i] = v;
        prev = x;
      });
    });
    vals[w._id] = byId;
  });
  return vals;
}
function agregar(n, countStar, vals) {
  switch (n) {
    case "count": return countStar !== null ? countStar : vals.length;
    case "sum": { if (!vals.length) return null; var s = 0; vals.forEach(function (v) { s += num(v); }); return s; }
    case "avg": { if (!vals.length) return null; var s2 = 0; vals.forEach(function (v) { s2 += num(v); }); return s2 / vals.length; }
    case "min": { if (!vals.length) return null; var m = vals[0]; vals.forEach(function (v) { if (cmpVals(v, m) < 0) m = v; }); return m; }
    case "max": { if (!vals.length) return null; var M = vals[0]; vals.forEach(function (v) { if (cmpVals(v, M) > 0) M = v; }); return M; }
  }
  return null;
}

function runSelect(node, db, outer) {
  db = conCTEs(node, db, outer);
  var rows = [], cols = [];
  if (node.from) {
    var s = sourceRows(node.from, db, outer);
    rows = s.rows;
    for (var i = 0; i < node.joins.length; i++) {
      var j = node.joins[i], rs = sourceRows(j.table, db, outer), out = [];
      var nullRight = prefixRow(rs.alias, null, rs.cols);
      var leftNullTpl = {}; if (rows.length) { for (var k in rows[0]) leftNullTpl[k] = null; }
      var matchedRight = {};
      for (var a = 0; a < rows.length; a++) {
        var any = false;
        for (var b = 0; b < rs.rows.length; b++) {
          var cand = merge(rows[a], rs.rows[b]);
          var ok = j.type === "cross" ? true : truthy(evalExpr(j.on, new Ctx(db, cand, null, outer)));
          if (ok) { out.push(cand); any = true; matchedRight[b] = 1; }
        }
        if (!any && (j.type === "left" || j.type === "full")) out.push(merge(rows[a], nullRight));
      }
      if (j.type === "right" || j.type === "full") {
        for (var b2 = 0; b2 < rs.rows.length; b2++) if (!matchedRight[b2]) out.push(merge(leftNullTpl, rs.rows[b2]));
      }
      rows = out;
    }
  } else {
    rows = [{}];
  }

  if (node.where) {
    if (hasWindow(node.where)) err("window functions are not allowed in WHERE", "Una funcion de ventana solo puede ir en el SELECT o en el ORDER BY. Para filtrar por su resultado, envuelvela en un CTE (WITH) y filtra afuera.");
    if (hasAgg(node.where)) evalFunc({ op: "func", name: "count", args: [], star: true }, new Ctx(db, null, null, outer));
    rows = rows.filter(function (r) { return truthy(evalExpr(node.where, new Ctx(db, r, null, outer))); });
  }

  var selHasAgg = node.cols.some(function (c) { return c.expr && hasAgg(c.expr); }) || (node.having && hasAgg(node.having));
  var groups;
  if (node.groupBy) {
    var map = {}, order = [];
    rows.forEach(function (r) {
      var key = node.groupBy.map(function (g) { var v = evalExpr(g, new Ctx(db, r, null, outer)); return typeof v + ":" + v; }).join("|");
      if (!map[key]) { map[key] = { key: key, rep: r, rows: [] }; order.push(map[key]); }
      map[key].rows.push(r);
    });
    groups = order;
  } else if (selHasAgg) {
    node.cols.forEach(function (c) {
      if (!c.expr || hasAgg(c.expr)) return;
      var cc = collectCols(c.expr)[0];
      if (cc) err('column "' + (cc.table ? cc.table + "." : "") + cc.name + '" must appear in the GROUP BY clause or be used in an aggregate function',
        "Estas mezclando una columna normal con una funcion de agregacion. Agrega GROUP BY " + (cc.table ? cc.table + "." : "") + cc.name + " al final.");
    });
    groups = [{ rep: rows[0] || {}, rows: rows }];
  } else {
    groups = rows.map(function (r) { return { rep: r, rows: [r] }; });
  }

  if (node.having) {
    groups = groups.filter(function (g) { return truthy(evalExpr(node.having, new Ctx(db, g.rep, g.rows, outer))); });
  }

  // validar GROUP BY: columnas sueltas deben estar agrupadas
  if (node.groupBy) {
    var gkeys = node.groupBy.map(exprKey);
    var checkGrouped = function (e) {
      if (!e || typeof e !== "object") return;
      if (gkeys.indexOf(exprKey(e)) >= 0) return;            // la expresion completa esta agrupada
      if (e.op === "func" && AGG[e.name]) return;            // dentro de una agregacion todo vale
      if (e.op === "col") {
        err('column "' + (e.table ? e.table + "." : "") + e.name + '" must appear in the GROUP BY clause or be used in an aggregate function',
          "Toda columna del SELECT que no este dentro de COUNT, SUM, AVG, MIN o MAX debe aparecer en el GROUP BY.");
      }
      for (var k in e) {
        if (k === "sub") continue;
        var v = e[k];
        if (v && typeof v === "object") {
          if (Array.isArray(v)) v.forEach(checkGrouped); else checkGrouped(v);
        }
      }
    };
    node.cols.forEach(function (c) { if (c.expr) checkGrouped(c.expr); });
    void 0;
    if (node.orderBy) node.orderBy.forEach(function (o) {
      if (o.expr.op === "col" && !o.expr.table) return;      // puede ser un alias del SELECT
      checkGrouped(o.expr);
    });
  }

  // proyeccion
  var outRows = [], outCols = [], seenCols = {};
  function addCol(name) { var base = name, k = 1; while (seenCols[name]) { name = base + "_" + (++k); } seenCols[name] = 1; outCols.push(name); return name; }
  var colPlan = [];
  node.cols.forEach(function (c) {
    if (c.star) {
      var sample = groups.length ? groups[0].rep : (rows[0] || {});
      var keys = Object.keys(sample).filter(function (k) { return k.indexOf("__alias__") !== 0; });
      keys.forEach(function (k) {
        var d = k.indexOf("."), tb = k.substr(0, d), cn = k.substr(d + 1);
        if (c.table && tb !== c.table) return;
        colPlan.push({ name: addCol(cn), get: (function (kk) { return function (g) { return g.rep[kk]; }; })(k) });
      });
    } else {
      var nm = c.alias || defaultName(c.expr);
      colPlan.push({ name: addCol(nm), expr: c.expr });
    }
  });

  var winNodes = [];
  colPlan.forEach(function (p) { if (p.expr) collectWindows(p.expr, winNodes); });
  if (node.orderBy) node.orderBy.forEach(function (o) { collectWindows(o.expr, winNodes); });
  var winVals = winNodes.length ? calcularVentanas(winNodes, groups, db, outer) : null;
  function winDe(gi) { if (!winVals) return null; var m = {}; for (var id in winVals) m[id] = winVals[id][gi]; return m; }

  groups.forEach(function (g, gi) {
    var o = {};
    colPlan.forEach(function (p) {
      o[p.name] = p.get ? p.get(g) : evalExpr(p.expr, new Ctx(db, g.rep, g.rows, outer, winDe(gi)));
    });
    g.__out = o; g.__gi = gi;
    outRows.push(o);
  });

  // DISTINCT
  if (node.distinct) {
    var seen = {}, res = [], resG = [];
    outRows.forEach(function (r, idx) { var k = outCols.map(function (c) { return typeof r[c] + ":" + r[c]; }).join("|"); if (!seen[k]) { seen[k] = 1; res.push(r); resG.push(groups[idx]); } });
    outRows = res; groups = resG;
  }

  // ORDER BY
  if (node.orderBy) {
    var idx = outRows.map(function (r, i) { return i; });
    idx.sort(function (x, y) {
      for (var o = 0; o < node.orderBy.length; o++) {
        var ob = node.orderBy[o], va, vb;
        if (ob.expr.op === "col" && !ob.expr.table && outCols.indexOf(ob.expr.name) >= 0) { va = outRows[x][ob.expr.name]; vb = outRows[y][ob.expr.name]; }
        else if ("lit" in ob.expr && typeof ob.expr.lit === "number") { var cn = outCols[ob.expr.lit - 1]; va = outRows[x][cn]; vb = outRows[y][cn]; }
        else { va = evalExpr(ob.expr, new Ctx(db, groups[x].rep, groups[x].rows, outer, winDe(groups[x].__gi))); vb = evalExpr(ob.expr, new Ctx(db, groups[y].rep, groups[y].rows, outer, winDe(groups[y].__gi))); }
        var c = cmpVals(va, vb);
        if (c === null) c = isNull(va) && isNull(vb) ? 0 : isNull(va) ? 1 : -1; // NULLS LAST en ASC
        if (c !== 0) return ob.dir === "desc" ? -c : c;
      }
      return x - y;
    });
    outRows = idx.map(function (i) { return outRows[i]; });
  }

  // LIMIT / OFFSET
  var off = node.offset ? num(evalExpr(node.offset, new Ctx(db, {}, null, outer))) : 0;
  if (off) outRows = outRows.slice(off);
  if (node.limit !== null && node.limit !== undefined) { var lim = num(evalExpr(node.limit, new Ctx(db, {}, null, outer))); outRows = outRows.slice(0, lim); }

  return { cols: outCols, rows: outRows };
}

function exprKey(e) {
  if (!e || typeof e !== "object") return String(e);
  if ("lit" in e) return "lit:" + e.lit;
  if (e.op === "col") return "col:" + (e.table || "*") + "." + e.name;
  var parts = [e.op];
  for (var k in e) { if (k === "op") continue; var v = e[k]; parts.push(k + "=" + (v && typeof v === "object" ? (Array.isArray(v) ? v.map(exprKey).join(",") : exprKey(v)) : String(v))); }
  return parts.join("|");
}
function collectCols(e, acc) {
  acc = acc || [];
  if (!e || typeof e !== "object") return acc;
  if (e.op === "col") { acc.push({ key: "col:" + (e.table || "*") + "." + e.name, table: e.table, name: e.name }); return acc; }
  for (var k in e) { var v = e[k]; if (v && typeof v === "object") { if (Array.isArray(v)) v.forEach(function (x) { collectCols(x, acc); }); else collectCols(v, acc); } }
  return acc;
}
function defaultName(e) {
  if (e.op === "col") return e.name;
  if (e.op === "func" || e.op === "window") return e.name;
  if (e.op === "case") return "case";
  if ("lit" in e) return "?column?";
  return "?column?";
}

/* ---------------- DML / DDL ---------------- */
function checkConstraints(db, tname, row) {
  var t = db.tables[tname];
  for (var i = 0; i < t.cols.length; i++) {
    var c = t.cols[i], meta = t.meta[c] || {};
    if (meta.notnull && isNull(row[c])) err('null value in column "' + c + '" of relation "' + tname + '" violates not-null constraint', "La columna " + c + " no admite NULL.");
  }
  (t.constraints || []).forEach(function (k) {
    if (k.t === "check") {
      var pr = prefixRow(tname, row, t.cols);
      for (var c2 in row) pr[tname + "." + c2] = row[c2];
      var v = evalExpr(k.expr, new Ctx(db, pr, null, null));
      if (v === false) err('new row for relation "' + tname + '" violates check constraint "' + k.name + '"', "La regla " + k.name + " no permite ese valor.");
    }
  });
}

function runUpdate(node, db) {
  var dbv = conCTEs(node, db, null);
  var tname = node.table.name, alias = node.table.alias;
  var t = tableRows(db, tname);
  var src = null;
  if (node.from) src = sourceRows(node.from, dbv, null);
  var n = 0;
  var newRows = t.rows.map(function (r) {
    var base = prefixRow(alias, r, t.cols);
    var matches = [base];
    if (src) {
      matches = [];
      src.rows.forEach(function (sr) { matches.push(merge(base, sr)); });
      if (!matches.length) return r;
    }
    var applied = null;
    for (var m = 0; m < matches.length; m++) {
      var cand = matches[m];
      if (node.where && !truthy(evalExpr(node.where, new Ctx(db, cand, null, null)))) continue;
      applied = cand; break;
    }
    if (!applied) return r;
    var nr = {}; t.cols.forEach(function (c) { nr[c] = r[c]; });
    node.sets.forEach(function (s) {
      if (t.cols.indexOf(s.col) < 0) err('column "' + s.col + '" of relation "' + tname + '" does not exist', "Revisa el nombre de la columna que estas asignando.");
      nr[s.col] = evalExpr(s.expr, new Ctx(db, applied, null, null));
    });
    checkConstraints(db, tname, nr);
    n++;
    return nr;
  });
  t.rows = newRows;
  return { command: "UPDATE", count: n };
}
function runDelete(node, db) {
  var tname = node.table.name, alias = node.table.alias, t = tableRows(db, tname), n = 0;
  t.rows = t.rows.filter(function (r) {
    var pr = prefixRow(alias, r, t.cols);
    var del = node.where ? truthy(evalExpr(node.where, new Ctx(db, pr, null, null))) : true;
    if (del) n++;
    return !del;
  });
  return { command: "DELETE", count: n };
}
function runInsert(node, db) {
  var t = tableRows(db, node.table), cols = node.cols || t.cols, n = 0;
  function add(vals) {
    var r = {};
    t.cols.forEach(function (c) { var m = t.meta[c] || {}; r[c] = m.hasOwnProperty("def") ? m.def : null; });
    cols.forEach(function (c, i) { if (t.cols.indexOf(c) < 0) err('column "' + c + '" of relation "' + node.table + '" does not exist'); r[c] = vals[i]; });
    if (t.meta.id && t.meta.id.identity && isNull(r.id)) { var mx = 0; t.rows.forEach(function (x) { if (num(x.id) > mx) mx = num(x.id); }); r.id = mx + 1; }
    checkConstraints(db, node.table, r);
    t.rows.push(r); n++;
  }
  if (node.rows) node.rows.forEach(function (vals) { add(vals.map(function (e) { return evalExpr(e, new Ctx(db, {}, null, null)); })); });
  else { var rs = runSelect(node.sub, db, null); rs.rows.forEach(function (r) { add(rs.cols.map(function (c) { return r[c]; })); }); }
  return { command: "INSERT", count: n };
}
function runAlter(node, db) {
  var t = tableRows(db, node.table), tname = node.table;
  node.actions.forEach(function (a) {
    switch (a.t) {
      case "addcol": {
        if (t.cols.indexOf(a.name) >= 0) err('column "' + a.name + '" of relation "' + tname + '" already exists');
        var dv = a.def ? evalExpr(a.def, new Ctx(db, {}, null, null)) : null;
        if (a.notnull && a.def === null && t.rows.length > 0)
          err('column "' + a.name + '" of relation "' + tname + '" contains null values',
            "La tabla ya tiene filas y no hay con que llenar la columna nueva. Agrega un DEFAULT, o crea la columna nullable, rellenala con UPDATE y despues ponle NOT NULL.");
        t.cols.push(a.name);
        t.meta[a.name] = { type: a.type, notnull: a.notnull };
        if (a.def) t.meta[a.name].def = dv;
        t.rows.forEach(function (r) { r[a.name] = dv; });
        break;
      }
      case "dropcol": {
        var ix = t.cols.indexOf(a.name);
        if (ix < 0) err('column "' + a.name + '" of relation "' + tname + '" does not exist');
        t.cols.splice(ix, 1); delete t.meta[a.name];
        t.rows.forEach(function (r) { delete r[a.name]; });
        break;
      }
      case "renamecol": {
        var ix2 = t.cols.indexOf(a.from);
        if (ix2 < 0) err('column "' + a.from + '" does not exist');
        t.cols[ix2] = a.to; t.meta[a.to] = t.meta[a.from]; delete t.meta[a.from];
        t.rows.forEach(function (r) { r[a.to] = r[a.from]; delete r[a.from]; });
        break;
      }
      case "renametable": { db.tables[a.to] = t; delete db.tables[tname]; break; }
      case "coltype": { if (t.cols.indexOf(a.name) < 0) err('column "' + a.name + '" does not exist'); t.meta[a.name] = t.meta[a.name] || {}; t.meta[a.name].type = a.type; break; }
      case "setdefault": { t.meta[a.name] = t.meta[a.name] || {}; t.meta[a.name].def = evalExpr(a.expr, new Ctx(db, {}, null, null)); break; }
      case "dropdefault": { if (t.meta[a.name]) delete t.meta[a.name].def; break; }
      case "setnotnull": {
        var bad = t.rows.filter(function (r) { return isNull(r[a.name]); }).length;
        if (bad) err('column "' + a.name + '" of relation "' + tname + '" contains null values', "Hay " + bad + " filas con NULL en esa columna. Rellenalas con UPDATE antes de poner NOT NULL.");
        t.meta[a.name] = t.meta[a.name] || {}; t.meta[a.name].notnull = true; break;
      }
      case "dropnotnull": { t.meta[a.name] = t.meta[a.name] || {}; t.meta[a.name].notnull = false; break; }
      case "addcheck": {
        t.constraints = t.constraints || [];
        if (t.constraints.some(function (c) { return c.name === a.name; })) err('constraint "' + a.name + '" for relation "' + tname + '" already exists');
        var viol = 0;
        t.rows.forEach(function (r) { var pr = prefixRow(tname, r, t.cols); var v = evalExpr(a.expr, new Ctx(db, pr, null, null)); if (v === false) viol++; });
        if (viol) err('check constraint "' + (a.name || "sin nombre") + '" of relation "' + tname + '" is violated by some row',
          "Hay " + viol + " filas que no cumplen la regla. Corrigelas con UPDATE antes de crear la restriccion.");
        t.constraints.push({ t: "check", name: a.name || (tname + "_check"), expr: a.expr });
        break;
      }
      case "adduniq": {
        t.constraints = t.constraints || [];
        if (t.constraints.some(function (c) { return c.name === a.name; })) err('relation "' + a.name + '" already exists');
        var seen = {}, dup = 0;
        t.rows.forEach(function (r) { var k = a.cols.map(function (c) { return r[c]; }).join("|"); if (seen[k]) dup++; seen[k] = 1; });
        if (dup) err('could not create unique index "' + a.name + '"', "Hay " + dup + " filas duplicadas en (" + a.cols.join(", ") + "). Limpia los duplicados antes de crear la restriccion.");
        t.constraints.push({ t: "unique", name: a.name, cols: a.cols });
        break;
      }
      case "addfk": {
        t.constraints = t.constraints || [];
        var rt = tableRows(db, a.reft), rc = a.refc[0] || "id", orf = 0;
        t.rows.forEach(function (r) { var v = r[a.cols[0]]; if (isNull(v)) return; if (!rt.rows.some(function (x) { return cmpVals(x[rc], v) === 0; })) orf++; });
        if (orf) err('insert or update on table "' + tname + '" violates foreign key constraint "' + a.name + '"', "Hay " + orf + " filas huerfanas: apuntan a un " + a.reft + " que no existe.");
        t.constraints.push({ t: "fk", name: a.name, cols: a.cols, reft: a.reft });
        break;
      }
      case "addpk": { t.constraints = t.constraints || []; t.constraints.push({ t: "pk", name: a.name, cols: a.cols }); break; }
      case "dropconstraint": {
        t.constraints = t.constraints || [];
        var i2 = -1; t.constraints.forEach(function (c, k) { if (c.name === a.name) i2 = k; });
        if (i2 < 0) err('constraint "' + a.name + '" of relation "' + tname + '" does not exist');
        t.constraints.splice(i2, 1); break;
      }
    }
  });
  return { command: "ALTER TABLE", count: null };
}

/* ---------------- API ---------------- */
function execute(sql, db) {
  var stmts = parse(sql);
  if (!stmts.length) err("no hay ninguna sentencia que ejecutar");
  var results = [];
  stmts.forEach(function (st) {
    if (st.kind === "select") { var r = runSelect(st, db, null); results.push({ command: "SELECT", cols: r.cols, rows: r.rows, count: r.rows.length }); }
    else if (st.kind === "update") results.push(runUpdate(st, db));
    else if (st.kind === "delete") results.push(runDelete(st, db));
    else if (st.kind === "insert") results.push(runInsert(st, db));
    else if (st.kind === "alter") results.push(runAlter(st, db));
  });
  return results;
}

root.SQLEngine = { tokenize: tokenize, parse: parse, execute: execute, SqlError: SqlError, prefixRow: prefixRow };
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
export default (typeof window !== "undefined" ? window : globalThis).SQLEngine;
