import { useEffect, useRef, useState, useCallback } from "react";

const KW = ("select from where group by having order asc desc limit offset distinct as and or not in between like ilike is null " +
  "join inner left right full outer cross on union all case when then else end exists insert into values update set delete alter " +
  "table add drop column rename to constraint primary key foreign references unique check default type create index varchar " +
  "numeric integer int bigint smallint text date timestamp boolean decimal char true false with over partition").split(" ");
const FN = ("count sum avg min max round coalesce nullif upper lower length trim abs extract greatest least current_date now substr concat cast row_number rank dense_rank").split(" ");
const KWs = new Set(KW), FNs = new Set(FN);

export function esc(t: string) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
export function pintar(sql: string): string {
  const re = /(--[^\n]*)|('(?:[^']|'')*')|("[^"]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([^\sA-Za-z0-9_])/g;
  return sql.replace(re, (_m, c, s, d, n, w, y) => {
    if (c !== undefined) return `<span class="c">${esc(c)}</span>`;
    if (s !== undefined) return `<span class="s">${esc(s)}</span>`;
    if (d !== undefined) return `<span class="i">${esc(d)}</span>`;
    if (n !== undefined) return `<span class="n">${n}</span>`;
    if (w !== undefined) {
      const u = w.toLowerCase();
      if (KWs.has(u)) return `<span class="k">${esc(w)}</span>`;
      if (FNs.has(u)) return `<span class="f">${esc(w)}</span>`;
      return esc(w);
    }
    return `<span class="i">${esc(y)}</span>`;
  });
}

export interface EsquemaVivo { [tabla: string]: { c: string; type: string }[] }

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  onCheck: () => void;
  onFormat: () => void;
  esquema: EsquemaVivo;
  placeholder?: string;
}

const KWS_AC = ("SELECT FROM WHERE GROUP BY HAVING ORDER BY LIMIT OFFSET DISTINCT JOIN LEFT JOIN INNER JOIN ON AND OR NOT IN BETWEEN LIKE " +
  "IS NULL IS NOT NULL CASE WHEN THEN ELSE END EXISTS NOT EXISTS UPDATE SET DELETE FROM INSERT INTO VALUES ALTER TABLE ADD COLUMN " +
  "DROP COLUMN RENAME COLUMN TO CONSTRAINT CHECK UNIQUE DEFAULT AS ASC DESC COALESCE COUNT SUM AVG MIN MAX ROUND CAST EXTRACT WITH OVER PARTITION BY ROW_NUMBER RANK DENSE_RANK").split(" ");

export function Editor({ value, onChange, onRun, onCheck, onFormat, esquema, placeholder }: Props) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const gut = useRef<HTMLDivElement>(null);
  const [ac, setAc] = useState<{ ops: { t: string; k: string }[]; sel: number; pref: string; top: number; left: number } | null>(null);

  const lineas = value.split("\n").length;

  const sync = useCallback(() => {
    if (!ta.current || !pre.current) return;
    pre.current.style.transform = `translate(${-ta.current.scrollLeft}px,${-ta.current.scrollTop}px)`;
    if (gut.current) gut.current.scrollTop = ta.current.scrollTop;
  }, []);

  function aliases(txt: string) {
    const o: Record<string, string> = {};
    const re = /\b(sucursales|empleados|productos|ventas|[a-z_]+)\s+(?:as\s+)?([a-z][a-z0-9_]*)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(txt))) {
      if (esquema[m[1].toLowerCase()] && !/^(as|on|where|set|group|order|join|left|inner|limit|values|and|or|having)$/i.test(m[2])) o[m[2].toLowerCase()] = m[1].toLowerCase();
    }
    return o;
  }

  function calcular(): { ops: { t: string; k: string }[]; pref: string } | null {
    const el = ta.current; if (!el) return null;
    const pos = el.selectionStart, antes = el.value.slice(0, pos);
    const lineaActual = antes.slice(antes.lastIndexOf("\n") + 1);
    if (lineaActual.includes("--")) return null;
    if ((antes.match(/'/g) || []).length % 2 === 1) return null;
    const al = aliases(el.value);
    const mp = /([a-z][a-z0-9_]*)\.([a-z0-9_]*)$/i.exec(antes);
    if (mp) {
      const ali = mp[1].toLowerCase(), pref = mp[2].toLowerCase();
      const tabla = al[ali] || (esquema[ali] ? ali : null);
      let out: { t: string; k: string }[] = [];
      if (tabla && esquema[tabla]) out = esquema[tabla].filter((c) => c.c.startsWith(pref)).map((c) => ({ t: c.c, k: c.type }));
      else {
        const prob = Object.keys(esquema).filter((t) => t[0] === ali[0]);
        (prob.length ? prob : Object.keys(esquema)).forEach((t) => esquema[t].forEach((c) => { if (c.c.startsWith(pref) && out.length < 9) out.push({ t: c.c, k: t }); }));
      }
      return out.length ? { ops: out.slice(0, 9), pref } : null;
    }
    const mw = /([a-z_][a-z0-9_]*)$/i.exec(antes);
    if (!mw || mw[1].length < 2) return null;
    const pref = mw[1].toLowerCase();
    const out: { t: string; k: string }[] = [];
    Object.keys(esquema).forEach((t) => { if (t.startsWith(pref)) out.push({ t, k: "tabla" }); });
    Object.keys(al).forEach((a) => { if (a.startsWith(pref)) out.push({ t: a, k: "alias de " + al[a] }); });
    const usadas: Record<string, string | null> = {};
    Object.keys(al).forEach((a) => { usadas[al[a]] = a; });
    Object.keys(esquema).forEach((t) => { if (new RegExp("\\b" + t + "\\b", "i").test(el.value) && !(t in usadas)) usadas[t] = null; });
    Object.keys(usadas).forEach((t) => esquema[t]?.forEach((c) => { if (c.c.startsWith(pref) && out.length < 12) out.push({ t: (usadas[t] ? usadas[t] + "." : "") + c.c, k: t }); }));
    KWS_AC.forEach((k) => { if (k.toLowerCase().startsWith(pref) && out.length < 12) out.push({ t: k, k: "palabra clave" }); });
    return out.length ? { ops: out.slice(0, 12), pref } : null;
  }

  function mostrar() {
    const r = calcular();
    if (!r || !ta.current) { setAc(null); return; }
    const el = ta.current;
    const ls = el.value.slice(0, el.selectionStart).split("\n");
    const top = Math.max(4, Math.min(12 + ls.length * 21.9 - el.scrollTop, el.clientHeight - 30));
    const left = Math.max(4, Math.min(16 + ls[ls.length - 1].length * 8.15 - el.scrollLeft, el.clientWidth - 230));
    setAc({ ops: r.ops, sel: 0, pref: r.pref, top, left });
  }

  function aplicar(i: number) {
    if (!ac || !ta.current) return;
    const o = ac.ops[i]; const el = ta.current;
    const pos = el.selectionStart, ini = pos - ac.pref.length;
    const nv = el.value.slice(0, ini) + o.t + el.value.slice(pos);
    onChange(nv);
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = ini + o.t.length; el.focus(); });
    setAc(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "Enter") { e.preventDefault(); setAc(null); onRun(); return; }
      if (e.key === "k" || e.key === "K") { e.preventDefault(); setAc(null); onCheck(); return; }
      if (e.key === "l" || e.key === "L") { e.preventDefault(); setAc(null); onFormat(); return; }
      if (e.key === " ") { e.preventDefault(); mostrar(); return; }
    }
    if (ac) {
      if (e.key === "ArrowDown") { e.preventDefault(); setAc({ ...ac, sel: (ac.sel + 1) % ac.ops.length }); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setAc({ ...ac, sel: (ac.sel - 1 + ac.ops.length) % ac.ops.length }); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); aplicar(ac.sel); return; }
      if (e.key === "Escape") { e.preventDefault(); setAc(null); return; }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const s = el.selectionStart, t = el.selectionEnd;
      const nv = el.value.slice(0, s) + "  " + el.value.slice(t);
      onChange(nv);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
    }
  }

  useEffect(() => { sync(); }, [value, sync]);

  return (
    <div className="edwrap">
      <div className="gutter" ref={gut}>{Array.from({ length: Math.max(lineas, 1) }, (_, i) => i + 1).join("\n")}</div>
      <div className="edit">
        <pre ref={pre} dangerouslySetInnerHTML={{ __html: pintar(value) + "\n" }} />
        {!value && <div className="ph">{placeholder || "-- Escribe tu conjuro SQL y pulsa Ctrl+Enter"}</div>}
        <textarea
          ref={ta} value={value} spellCheck={false} autoComplete="off" autoCapitalize="off"
          onChange={(e) => { onChange(e.target.value); setTimeout(mostrar, 0); }}
          onKeyDown={onKey} onScroll={() => { sync(); setAc(null); }}
          onBlur={() => setTimeout(() => setAc(null), 120)}
        />
        {ac && (
          <div className="ac" style={{ top: ac.top, left: ac.left }}>
            {ac.ops.map((o, i) => (
              <div key={o.t + i} className={i === ac.sel ? "sel" : ""} onMouseDown={(ev) => { ev.preventDefault(); aplicar(i); }}>
                {o.t}<span className="k2">{o.k}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- tabla de resultados ---------- */
export function Tabla({ cols, rows, max = 200 }: { cols: string[]; rows: Record<string, unknown>[]; max?: number }) {
  if (!cols.length) return <div className="vacio">Sin columnas.</div>;
  const vis = rows.slice(0, max);
  return (
    <div className="tablawrap">
      <table className="res">
        <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {vis.map((r, i) => (
            <tr key={i}>{cols.map((c) => {
              const v = r[c];
              if (v === null || v === undefined) return <td key={c} className="null">NULL</td>;
              if (typeof v === "number") return <td key={c} className="num">{Math.round(v * 1e6) / 1e6}</td>;
              return <td key={c}>{String(v)}</td>;
            })}</tr>
          ))}
        </tbody>
      </table>
      {rows.length > max && <div className="rowinfo">mostrando {max} de {rows.length} filas</div>}
    </div>
  );
}
