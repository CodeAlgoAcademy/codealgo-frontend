/* CodeAlgo Analytics dashboard. Plain JS, no build step. */
(function () {
  "use strict";

  const DAY = 86400000;
  const SITE = location.hostname === "localhost" || location.hostname === "127.0.0.1" ? "http://localhost:3000" : "https://codealgoacademy.com";
  const FILTER_KEYS = ["country", "region", "city", "device", "browser", "os", "source", "medium", "campaign", "referrer", "role", "entry", "exit", "ref", "lang", "screen", "page"];
  const TITLES = {
    overview: "Overview", realtime: "Realtime", acquisition: "Acquisition", audience: "Audience", pages: "Pages",
    clicks: "Clicks", heatmaps: "Heatmaps", journeys: "Journeys", events: "Events", funnels: "Funnels",
    retention: "Retention", visitors: "Visitors", performance: "Performance",
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const view = $("#view");
  let charts = [];
  let timer = null;
  let renderToken = 0;

  // ------------------------------------------------------------------ state

  const state = { tab: "overview", range: "7d", from: null, to: null, internal: false, goal: "signup_completed", filters: {}, opts: {} };

  function readHash() {
    const raw = location.hash.replace(/^#/, "");
    const [tab, qs] = raw.split("?");
    state.tab = TITLES[tab] ? tab : "overview";
    const p = new URLSearchParams(qs || "");
    state.range = p.get("range") || state.range;
    state.from = p.get("from") ? Number(p.get("from")) : null;
    state.to = p.get("to") ? Number(p.get("to")) : null;
    state.internal = p.get("internal") === "1";
    state.goal = p.get("goal") || "signup_completed";
    state.filters = {};
    FILTER_KEYS.forEach((k) => { if (p.get(k) !== null) state.filters[k] = p.get(k); });
    state.opts = {};
    for (const [k, v] of p.entries()) if (k.startsWith("o_")) state.opts[k.slice(2)] = v;
  }

  function writeHash(replace) {
    const p = new URLSearchParams();
    if (state.range !== "7d") p.set("range", state.range);
    if (state.range === "custom" && state.from) { p.set("from", state.from); p.set("to", state.to); }
    if (state.internal) p.set("internal", "1");
    if (state.goal !== "signup_completed") p.set("goal", state.goal);
    Object.entries(state.filters).forEach(([k, v]) => p.set(k, v));
    Object.entries(state.opts).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") p.set("o_" + k, v); });
    const qs = p.toString();
    const next = "#" + state.tab + (qs ? "?" + qs : "");
    if (next === location.hash) { render(); return; }
    if (replace) { history.replaceState(null, "", next); render(); } else location.hash = next;
  }

  function window_() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    switch (state.range) {
      case "today": return [startOfDay, Date.now()];
      case "yesterday": return [startOfDay - DAY, startOfDay];
      case "30d": return [Date.now() - 30 * DAY, Date.now()];
      case "90d": return [Date.now() - 90 * DAY, Date.now()];
      case "365d": return [Date.now() - 365 * DAY, Date.now()];
      case "custom": return [state.from || Date.now() - 7 * DAY, state.to || Date.now()];
      default: return [Date.now() - 7 * DAY, Date.now()];
    }
  }

  function setOpt(key, value) { state.opts[key] = value; writeHash(); }
  function addFilter(key, value) {
    if (!FILTER_KEYS.includes(key)) return;
    state.filters[key] = value === null || value === undefined ? "(none)" : String(value);
    writeHash();
  }

  // -------------------------------------------------------------------- api

  async function api(route, params, init) {
    const [from, to] = window_();
    const p = new URLSearchParams({ from, to, tzo: new Date().getTimezoneOffset(), goal: state.goal });
    if (state.internal) p.set("internal", "1");
    Object.entries(state.filters).forEach(([k, v]) => p.set(k, v));
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) p.set(k, v); });
    const res = await fetch(`/api/${route}?${p}`, Object.assign({ credentials: "same-origin" }, init || {}));
    if (!res.ok) throw new Error(`${route}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  function post(route, body, params) {
    return api(route, params, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  // ------------------------------------------------------------- formatting

  const esc = (s) => String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const n = (v) => (v === null || v === undefined || isNaN(v) ? "-" : Math.round(v).toLocaleString());
  const pct = (v, d) => (v === null || v === undefined || isNaN(v) ? "-" : (v * 100).toFixed(d === undefined ? 1 : d) + "%");
  const dec = (v, d) => (v === null || v === undefined || isNaN(v) ? "-" : Number(v).toFixed(d === undefined ? 2 : d));
  function dur(ms) {
    if (ms === null || ms === undefined || isNaN(ms)) return "-";
    const s = Math.round(ms / 1000);
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }
  const when = (ts) => (ts ? new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "-");
  const clock = (ts) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
  const ago = (ts) => {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return s + "s ago";
    if (s < 3600) return Math.round(s / 60) + "m ago";
    if (s < 86400) return Math.round(s / 3600) + "h ago";
    return Math.round(s / 86400) + "d ago";
  };
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const FLAGS = (cc) => (cc && cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) + " " : "");

  function delta(cur, prev, inverse) {
    if (!prev || cur === null || cur === undefined) return `<span class="flat">no prior data</span>`;
    const d = (cur - prev) / prev;
    if (!isFinite(d)) return "";
    const good = inverse ? d < 0 : d > 0;
    const cls = Math.abs(d) < 0.005 ? "flat" : good ? "up" : "down";
    return `<span class="${cls}">${d > 0 ? "+" : ""}${(d * 100).toFixed(1)}%</span> <span class="muted">vs prev</span>`;
  }

  // ----------------------------------------------------------------- charts

  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  const PALETTE = ["#3b5bdb", "#12b76a", "#f79009", "#7a5af8", "#ee46bc", "#06aed4", "#f04438", "#667085"];

  function chart(canvas, config) {
    Chart.defaults.color = css("--muted");
    Chart.defaults.borderColor = css("--border");
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    const c = new Chart(canvas, config);
    charts.push(c);
    return c;
  }

  function lineChart(canvas, labels, datasets, opts) {
    return chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: datasets.map((d, i) => Object.assign({
          borderColor: d.color || PALETTE[i], backgroundColor: (d.color || PALETTE[i]) + "22",
          borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.25, fill: i === 0,
        }, d)),
      },
      options: Object.assign({
        responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: datasets.length > 1, labels: { boxWidth: 10 } } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } } },
      }, opts || {}),
    });
  }

  function barChart(canvas, labels, data, opts) {
    return chart(canvas, {
      type: "bar",
      data: { labels, datasets: [{ data, backgroundColor: css("--accent"), borderRadius: 4, maxBarThickness: 36 }] },
      options: Object.assign({
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } },
      }, opts || {}),
    });
  }

  // ----------------------------------------------------------------- tables

  /**
   * cols: [{key, label, fmt, num, bar, filter}] - `bar` draws the share bar
   * behind that column, `filter` makes a row click add that filter.
   */
  function table(el, cols, rows, opts) {
    opts = opts || {};
    let sortKey = opts.sort || null;
    let sortDir = -1;
    function draw() {
      const data = [...rows];
      if (sortKey) data.sort((a, b) => {
        const x = a[sortKey], y = b[sortKey];
        if (typeof x === "number" || typeof y === "number") return ((x || 0) - (y || 0)) * sortDir;
        return String(x || "").localeCompare(String(y || "")) * sortDir;
      });
      const barCol = cols.find((c) => c.bar);
      const max = barCol ? Math.max(1, ...data.map((r) => Number(r[barCol.bar]) || 0)) : 1;
      if (!data.length) { el.innerHTML = `<div class="empty">No data for this range</div>`; return; }
      el.innerHTML = `<div class="table-wrap ${opts.long ? "long" : ""}"><table><thead><tr>${cols
        .map((c) => `<th class="${c.num ? "num" : ""}" data-k="${c.key}">${esc(c.label)}${sortKey === c.key ? (sortDir < 0 ? " ↓" : " ↑") : ""}</th>`)
        .join("")}</tr></thead><tbody>${data
        .slice(0, opts.limit || 500)
        .map((r, i) => `<tr class="${opts.onClick ? "click" : ""}" data-i="${i}">${cols
          .map((c) => {
            const raw = r[c.key];
            const shown = c.fmt ? c.fmt(raw, r) : esc(raw);
            if (c.bar) {
              const w = ((Number(r[c.bar]) || 0) / max) * 100;
              return `<td class="key" title="${esc(raw)}"><div class="barbg" style="width:${w}%"></div><span>${shown}</span></td>`;
            }
            return `<td class="${c.num ? "num" : ""}">${shown}</td>`;
          })
          .join("")}</tr>`)
        .join("")}</tbody></table></div>`;
      el.querySelectorAll("th").forEach((th) => th.addEventListener("click", () => {
        const k = th.dataset.k;
        if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = -1; }
        draw();
      }));
      if (opts.onClick) el.querySelectorAll("tbody tr").forEach((tr) => tr.addEventListener("click", () => opts.onClick(data[Number(tr.dataset.i)])));
    }
    draw();
    el._rows = rows;
    el._cols = cols;
  }

  function csv(rows, cols, name) {
    const lines = [cols.map((c) => c.label).join(",")];
    rows.forEach((r) => lines.push(cols.map((c) => {
      const v = r[c.key];
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function card(title, body, tools) {
    return `<div class="card"><h3><span>${title}</span><span class="tools">${tools || ""}</span></h3>${body}</div>`;
  }

  function wireCsv(root) {
    root.querySelectorAll("[data-csv]").forEach((b) => b.addEventListener("click", () => {
      const el = $("#" + b.dataset.csv, root);
      if (el && el._rows) csv(el._rows, el._cols, b.dataset.csv);
    }));
  }
  const csvBtn = (id) => `<button class="small ghost" data-csv="${id}">CSV</button>`;

  // Standard visitor / session / bounce columns for a breakdown row.
  function dimCols(label, fmtKey) {
    return [
      { key: "k", label, bar: "visitors", fmt: fmtKey || ((v) => esc(v)) },
      { key: "visitors", label: "Visitors", num: true, fmt: n },
      { key: "sessions", label: "Sessions", num: true, fmt: n },
      { key: "bounce", label: "Bounce", num: true, fmt: (v) => pct(v, 0) },
      { key: "engaged", label: "Engaged", num: true, fmt: dur },
      { key: "conversions", label: "Conv.", num: true, fmt: n },
      { key: "cr", label: "Conv. rate", num: true, fmt: (v) => pct(v) },
    ];
  }
  const withCr = (rows) => rows.map((r) => Object.assign({}, r, { cr: r.sessions ? r.conversions / r.sessions : null }));

  async function breakdownInto(el, dim, label, fmtKey, filterKey) {
    const d = await api("breakdown", { dim, limit: 100 });
    table(el, dimCols(label, fmtKey), withCr(d.rows), {
      onClick: filterKey ? (r) => addFilter(filterKey, r.k === "(none)" ? null : r.k) : null,
    });
  }

  // ---------------------------------------------------------------- views

  const VIEWS = {};

  VIEWS.overview = async function (root) {
    root.innerHTML = `
      <div class="kpis" id="kpis"></div>
      <div class="card" style="margin-bottom:14px">
        <h3><span>Visitors</span><span class="tools">
          <select id="metric"><option value="visitors">Visitors</option><option value="sessions">Sessions</option><option value="pageviews">Pageviews</option></select>
          <button class="small ghost" id="annotate">+ Note</button></span></h3>
        <div class="chart-box tall"><canvas id="ts"></canvas></div>
        <div id="notes" class="small muted"></div>
      </div>
      <div class="grid g3">
        ${card("Top pages", `<div id="t-pages"></div>`)}
        ${card("Sources", `<div id="t-src"></div>`)}
        ${card("Countries", `<div id="t-country"></div>`)}
        ${card("Entry pages", `<div id="t-entry"></div>`)}
        ${card("Devices", `<div class="chart-box short"><canvas id="c-dev"></canvas></div>`)}
        ${card("New vs returning", `<div class="chart-box short"><canvas id="c-nr"></canvas></div>`)}
      </div>`;

    const o = await api("overview");
    const c = o.current, p = o.previous;
    const cr = c.sessions ? c.converters / c.visitors : null;
    const pcr = p.sessions ? p.converters / p.visitors : null;
    const kpis = [
      ["Live now", n(o.live), `<span class="muted">last 5 min</span>`, "live"],
      ["Visitors", n(c.visitors), delta(c.visitors, p.visitors)],
      ["Sessions", n(c.sessions), delta(c.sessions, p.sessions)],
      ["Pageviews", n(c.pageviews), delta(c.pageviews, p.pageviews)],
      ["Pages / session", dec(c.pps), delta(c.pps, p.pps)],
      ["Avg engaged time", dur(c.engaged), delta(c.engaged, p.engaged)],
      ["Bounce rate", pct(c.bounce), delta(c.bounce, p.bounce, true)],
      ["Clicks", n(c.clicks), delta(c.clicks, p.clicks)],
      ["New visitors", n(c.new_visitors), delta(c.new_visitors, p.new_visitors)],
      ["Logged in users", n(c.users), delta(c.users, p.users)],
      [`Goal: ${esc(o.goal)}`, n(c.conversions), delta(c.conversions, p.conversions)],
      ["Visitor conv. rate", pct(cr, 2), delta(cr, pcr)],
    ];
    $("#kpis", root).innerHTML = kpis.map(([l, v, d, cls]) => `<div class="kpi ${cls || ""}"><div class="label">${l}</div><div class="value">${v}</div><div class="delta">${d}</div></div>`).join("");

    const hourly = o.bucket < DAY;
    const fmtB = (b) => new Date(b).toLocaleString([], hourly ? { hour: "numeric", day: "numeric", month: "short" } : { month: "short", day: "numeric" });
    function drawTs(metric) {
      charts.filter((ch) => ch.canvas.id === "ts").forEach((ch) => ch.destroy());
      charts = charts.filter((ch) => ch.canvas.id !== "ts");
      const labels = o.series.map((r) => fmtB(r.b));
      const sets = [{ label: "This period", data: o.series.map((r) => r[metric]) }];
      if (metric === "visitors" && o.prevSeries.length) sets.push({ label: "Previous period", data: o.prevSeries.slice(-labels.length).map((r) => r.visitors), borderDash: [5, 4], color: "#98a2b3", fill: false });
      lineChart($("#ts", root), labels, sets);
    }
    drawTs("visitors");
    $("#metric", root).addEventListener("change", (e) => drawTs(e.target.value));
    $("#notes", root).innerHTML = o.annotations.length
      ? "Notes: " + o.annotations.map((a) => `<span title="${esc(a.created_by)}">${new Date(a.ts).toLocaleDateString()} ${esc(a.text)} <a href="#" data-del="${a.id}">x</a></span>`).join(" · ")
      : "";
    root.querySelectorAll("[data-del]").forEach((a) => a.addEventListener("click", async (e) => {
      e.preventDefault();
      await api("annotations", { id: a.dataset.del }, { method: "DELETE" });
      render();
    }));
    $("#annotate", root).addEventListener("click", async () => {
      const text = prompt("Note for the chart (e.g. 'Instagram ad went live')");
      if (!text) return;
      const day = prompt("Date (YYYY-MM-DD), blank for today", "");
      const ts = day ? new Date(day + "T12:00:00").getTime() : Date.now();
      await post("annotations", { text, ts });
      render();
    });

    const [pages, dev, nr] = await Promise.all([api("pages"), api("breakdown", { dim: "device" }), api("breakdown", { dim: "newret" })]);
    table($("#t-pages", root), [
      { key: "path", label: "Page", bar: "views" },
      { key: "views", label: "Views", num: true, fmt: n },
      { key: "visitors", label: "Visitors", num: true, fmt: n },
    ], pages.rows, { limit: 10, onClick: (r) => addFilter("page", r.path) });
    await Promise.all([
      (async () => {
        const d = await api("breakdown", { dim: "source", limit: 10 });
        table($("#t-src", root), [{ key: "k", label: "Source", bar: "visitors" }, { key: "visitors", label: "Visitors", num: true, fmt: n }, { key: "conversions", label: "Conv.", num: true, fmt: n }], d.rows, { onClick: (r) => addFilter("source", r.k) });
      })(),
      (async () => {
        const d = await api("breakdown", { dim: "country", limit: 10 });
        table($("#t-country", root), [{ key: "k", label: "Country", bar: "visitors", fmt: (v) => FLAGS(v) + esc(v) }, { key: "visitors", label: "Visitors", num: true, fmt: n }], d.rows, { onClick: (r) => addFilter("country", r.k) });
      })(),
      (async () => {
        const d = await api("breakdown", { dim: "entry", limit: 10 });
        table($("#t-entry", root), [{ key: "k", label: "Landing page", bar: "sessions" }, { key: "sessions", label: "Sessions", num: true, fmt: n }, { key: "bounce", label: "Bounce", num: true, fmt: (v) => pct(v, 0) }], d.rows, { onClick: (r) => addFilter("entry", r.k) });
      })(),
    ]);
    chart($("#c-dev", root), { type: "doughnut", data: { labels: dev.rows.map((r) => r.k), datasets: [{ data: dev.rows.map((r) => r.visitors), backgroundColor: PALETTE, borderWidth: 0 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: "right" } }, onClick: (_e, els) => els[0] && addFilter("device", dev.rows[els[0].index].k) } });
    chart($("#c-nr", root), { type: "doughnut", data: { labels: nr.rows.map((r) => r.k), datasets: [{ data: nr.rows.map((r) => r.sessions), backgroundColor: PALETTE, borderWidth: 0 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: "right" } } } });
  };

  VIEWS.realtime = async function (root) {
    const d = await api("realtime");
    root.innerHTML = `
      <div class="grid g3" style="margin-bottom:14px">
        <div class="kpi live"><div class="label"><span class="live-dot"></span> Active visitors (5 min)</div><div class="value" style="font-size:40px">${n(d.active)}</div><div class="delta muted">updates every 10s</div></div>
        ${card("On which pages now", `<div id="rt-pages"></div>`)}
        ${card("Where from", `<div id="rt-src"></div>`)}
      </div>
      ${card("Pageviews per minute, last 30 minutes", `<div class="chart-box short"><canvas id="rt-c"></canvas></div>`)}
      <div style="height:14px"></div>
      ${card("Live feed", `<div id="rt-feed"></div>`)}`;
    const mins = [];
    for (let t = Math.floor((d.now - 29 * 60000) / 60000) * 60000; t <= d.now; t += 60000) mins.push(t);
    const byMin = new Map(d.perMinute.map((r) => [r.b, r.pageviews]));
    barChart($("#rt-c", root), mins.map((t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })), mins.map((t) => byMin.get(t) || 0), { animation: false });
    table($("#rt-pages", root), [{ key: "path", label: "Page", bar: "n" }, { key: "n", label: "Visitors", num: true, fmt: n }], d.pagesNow);
    table($("#rt-src", root), [{ key: "source", label: "Source", bar: "n" }, { key: "n", label: "Visitors", num: true, fmt: n }], d.sourcesNow);
    table($("#rt-feed", root), [
      { key: "ts", label: "Time", fmt: (v) => clock(v) },
      { key: "type", label: "Event", fmt: (v, r) => `<span class="type ${esc(v)}">${esc(r.name && v === "custom" ? r.name : v)}</span>` },
      { key: "path", label: "Page" },
      { key: "label", label: "Detail", fmt: (v) => esc(v || "") },
      { key: "country", label: "Where", fmt: (v, r) => FLAGS(v) + esc(r.city || v || "") },
      { key: "device", label: "Device" },
      { key: "source", label: "Source" },
    ], d.feed, { long: true, onClick: (r) => { state.opts.vid = r.vid; state.tab = "visitors"; writeHash(); } });
    timer = setTimeout(() => { if (state.tab === "realtime") render(true); }, 10000);
  };

  VIEWS.acquisition = async function (root) {
    const dims = [["source", "Source", "source"], ["medium", "Medium", "medium"], ["campaign", "Campaign", "campaign"], ["referrer", "Referring site", "referrer"], ["ref", "Referral partner code", "ref"], ["content", "utm_content", null], ["term", "utm_term", null], ["entry", "Landing page", "entry"]];
    const cur = state.opts.dim || "source";
    root.innerHTML = `
      <div class="card" style="margin-bottom:14px"><h3><span>Channels over time</span></h3><div class="chart-box"><canvas id="acq-c"></canvas></div></div>
      <div class="card"><h3><span>Breakdown</span><span class="tools">${csvBtn("acq-t")}</span></h3>
      <div class="tabs">${dims.map(([k, l]) => `<button data-d="${k}" class="${k === cur ? "active" : ""}">${l}</button>`).join("")}</div>
      <div id="acq-t"></div><p class="small muted">Click a row to filter the whole dashboard by it. Conversion rate is sessions that fired the goal event.</p></div>`;
    root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => setOpt("dim", b.dataset.d)));
    wireCsv(root);
    const def = dims.find((x) => x[0] === cur) || dims[0];
    await breakdownInto($("#acq-t", root), def[0], def[1], null, def[2]);

    // Medium over time, stacked. One query per medium keeps the API simple.
    const media = (await api("breakdown", { dim: "medium", limit: 6 })).rows.map((r) => r.k);
    const series = await Promise.all(media.map((m) => api("overview", { medium: m === "(none)" ? "(none)" : m })));
    const labels = (series[0] && series[0].series.map((r) => new Date(r.b).toLocaleDateString([], { month: "short", day: "numeric" }))) || [];
    const allB = [...new Set(series.flatMap((s) => s.series.map((r) => r.b)))].sort((a, b) => a - b);
    lineChart($("#acq-c", root), allB.map((b) => new Date(b).toLocaleDateString([], { month: "short", day: "numeric" })) || labels,
      series.map((s, i) => {
        const m = new Map(s.series.map((r) => [r.b, r.visitors]));
        return { label: media[i], data: allB.map((b) => m.get(b) || 0), fill: false };
      }));
  };

  VIEWS.audience = async function (root) {
    root.innerHTML = `
      <div class="grid g2" style="margin-bottom:14px">
        ${card("Visits by hour of day (local)", `<div class="chart-box short"><canvas id="a-hour"></canvas></div>`)}
        ${card("Visits by weekday", `<div class="chart-box short"><canvas id="a-wd"></canvas></div>`)}
      </div>
      <div class="grid g2">
        ${card("Countries", `<div id="a-country"></div>`, csvBtn("a-country"))}
        ${card("Regions", `<div id="a-region"></div>`, csvBtn("a-region"))}
        ${card("Cities", `<div id="a-city"></div>`, csvBtn("a-city"))}
        ${card("Account type", `<div id="a-role"></div>`)}
        ${card("Device", `<div id="a-device"></div>`)}
        ${card("Browser", `<div id="a-browser"></div>`)}
        ${card("Operating system", `<div id="a-os"></div>`)}
        ${card("Screen", `<div id="a-screen"></div>`)}
        ${card("Language", `<div id="a-lang"></div>`)}
        ${card("New vs returning", `<div id="a-nr"></div>`)}
      </div>`;
    wireCsv(root);
    const [hour, wd] = await Promise.all([api("breakdown", { dim: "hour", limit: 24 }), api("breakdown", { dim: "weekday", limit: 7 })]);
    const hmap = new Map(hour.rows.map((r) => [Number(r.k), r.sessions]));
    barChart($("#a-hour", root), [...Array(24).keys()].map((h) => `${h}:00`), [...Array(24).keys()].map((h) => hmap.get(h) || 0));
    const wmap = new Map(wd.rows.map((r) => [Number(r.k), r.sessions]));
    barChart($("#a-wd", root), WEEKDAYS, WEEKDAYS.map((_, i) => wmap.get(i) || 0));
    await Promise.all([
      breakdownInto($("#a-country", root), "country", "Country", (v) => FLAGS(v) + esc(v), "country"),
      breakdownInto($("#a-region", root), "region", "Region", null, "region"),
      breakdownInto($("#a-city", root), "city", "City", null, "city"),
      breakdownInto($("#a-role", root), "role", "Role", (v) => esc(v === "(none)" ? "logged out" : v), "role"),
      breakdownInto($("#a-device", root), "device", "Device", null, "device"),
      breakdownInto($("#a-browser", root), "browser", "Browser", null, "browser"),
      breakdownInto($("#a-os", root), "os", "OS", null, "os"),
      breakdownInto($("#a-screen", root), "screen", "Screen", null, "screen"),
      breakdownInto($("#a-lang", root), "lang", "Language", null, "lang"),
      breakdownInto($("#a-nr", root), "newret", "Type", null, null),
    ]);
  };

  VIEWS.pages = async function (root) {
    root.innerHTML = card("All pages", `<div id="p-t"></div><p class="small muted">Engaged is visible, focused time on the page. Scroll is the average deepest point reached. Click a row for where people came from and went next.</p>`, csvBtn("p-t"));
    wireCsv(root);
    const d = await api("pages");
    table($("#p-t", root), [
      { key: "path", label: "Page", bar: "views" },
      { key: "views", label: "Views", num: true, fmt: n },
      { key: "visitors", label: "Visitors", num: true, fmt: n },
      { key: "engaged", label: "Avg engaged", num: true, fmt: dur },
      { key: "scroll", label: "Avg scroll", num: true, fmt: (v) => (v === null ? "-" : Math.round(v) + "%") },
      { key: "entries", label: "Entrances", num: true, fmt: n },
      { key: "bounce", label: "Bounce", num: true, fmt: (v) => pct(v, 0) },
      { key: "exit_rate", label: "Exit rate", num: true, fmt: (v) => pct(v, 0) },
      { key: "clicks", label: "Clicks", num: true, fmt: n },
      { key: "rage", label: "Rage", num: true, fmt: (v) => (v ? `<span class="down">${n(v)}</span>` : "0") },
      { key: "errors", label: "JS errors", num: true, fmt: (v) => (v ? `<span class="down">${n(v)}</span>` : "0") },
    ], d.rows, { long: true, onClick: (r) => { state.tab = "journeys"; state.opts.path = r.path; writeHash(); } });
  };

  VIEWS.clicks = async function (root) {
    const pages = (await api("pages")).rows.map((r) => r.path);
    const cur = state.opts.cpath || "";
    root.innerHTML = `
      <div class="toolbar"><label>Page <select id="cp"><option value="">All pages</option>${pages.map((p) => `<option ${p === cur ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></label></div>
      <div class="card" style="margin-bottom:14px"><h3><span>Most clicked elements</span><span class="tools">${csvBtn("c-top")}</span></h3>
        <div id="c-top"></div>
        <p class="small muted">CTR is unique clickers over unique visitors to that page. Set <code>data-track="name"</code> on an element in the site to give it a stable name here.</p></div>
      <div class="grid g3">
        ${card("Rage clicks", `<div id="c-rage"></div><p class="small muted">3+ fast clicks in one spot. Usually something that looks clickable and is not, or is slow.</p>`)}
        ${card("Dead clicks", `<div id="c-dead"></div><p class="small muted">Clicks on text and images that do nothing.</p>`)}
        ${card("Outbound links", `<div id="c-out"></div>`)}
      </div>`;
    $("#cp", root).addEventListener("change", (e) => setOpt("cpath", e.target.value));
    wireCsv(root);
    const d = await api("clicks", { path: cur || null });
    const label = (v, r) => `${esc(v || "(no text)")} <span class="muted mono">${esc(r.el || "")}</span>`;
    table($("#c-top", root), [
      { key: "label", label: "Element", bar: "clicks", fmt: label },
      { key: "path", label: "Page" },
      { key: "href", label: "Goes to", fmt: (v) => esc(v || "") },
      { key: "clicks", label: "Clicks", num: true, fmt: n },
      { key: "visitors", label: "Clickers", num: true, fmt: n },
      { key: "ctr", label: "CTR", num: true, fmt: (v) => pct(v) },
    ], d.top, { long: true, onClick: (r) => { state.tab = "heatmaps"; state.opts.path = r.path; writeHash(); } });
    const small = [{ key: "label", label: "Element", bar: "n", fmt: label }, { key: "path", label: "Page" }, { key: "n", label: "Count", num: true, fmt: n }, { key: "sessions", label: "Sessions", num: true, fmt: n }];
    table($("#c-rage", root), small, d.rage);
    table($("#c-dead", root), small, d.dead);
    table($("#c-out", root), [{ key: "href", label: "Link", bar: "n", fmt: (v) => esc(String(v || "").replace(/^https?:\/\//, "")) }, { key: "n", label: "Clicks", num: true, fmt: n }], d.outbound);
  };

  VIEWS.heatmaps = async function (root) {
    const pages = (await api("pages")).rows.map((r) => r.path);
    const path = state.opts.path || pages[0] || "/";
    const device = state.opts.hdevice || "desktop";
    const mode = state.opts.mode || "clicks";
    const opacity = Number(state.opts.op || "0.75");
    root.innerHTML = `
      <div class="toolbar">
        <label>Page <select id="hp">${[...new Set([path, ...pages])].map((p) => `<option ${p === path ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
        <div class="tabs" style="margin:0">${["desktop", "tablet", "mobile"].map((d) => `<button data-dev="${d}" class="${d === device ? "active" : ""}">${d}</button>`).join("")}</div>
        <div class="tabs" style="margin:0">${["clicks", "scroll"].map((m) => `<button data-mode="${m}" class="${m === mode ? "active" : ""}">${m} map</button>`).join("")}</div>
        <label>overlay <input type="range" id="op" min="0.1" max="1" step="0.05" value="${opacity}"></label>
        <a href="${SITE + path}" target="_blank" rel="noopener">open page</a>
      </div>
      <div class="card"><div id="hinfo" class="small muted" style="margin-bottom:8px"></div><div class="heat-wrap" id="hwrap"><div class="heat-stage" id="stage"></div></div>
      <p class="small muted">The page behind the overlay is the live site today, so a layout that changed since the clicks happened will not line up. Clicks are stored as a fraction of page width and pixels from the top, grouped by device width.</p></div>`;
    $("#hp", root).addEventListener("change", (e) => setOpt("path", e.target.value));
    root.querySelectorAll("[data-dev]").forEach((b) => b.addEventListener("click", () => setOpt("hdevice", b.dataset.dev)));
    root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => setOpt("mode", b.dataset.mode)));

    const d = await api("heatmap", { path, hdevice: device });
    const vw = Math.round(d.vw);
    const dh = Math.max(800, Math.min(20000, Math.round(d.dh)));
    const wrap = $("#hwrap", root);
    const stage = $("#stage", root);
    const scale = Math.min(1, (wrap.clientWidth - 2) / vw);
    stage.style.width = vw + "px";
    stage.style.height = dh + "px";
    stage.style.transform = `scale(${scale})`;
    wrap.style.height = Math.min(dh * scale, window.innerHeight * 0.78) + "px";
    const spacer = document.createElement("div");
    spacer.style.height = dh * scale + "px";
    spacer.style.width = "1px";
    stage.innerHTML = `<iframe src="${SITE + path}?ca_heatmap=1" width="${vw}" height="${dh}" sandbox="allow-scripts allow-same-origin" loading="lazy" title="page preview"></iframe><canvas width="${vw}" height="${dh}"></canvas>`;
    stage.style.position = "absolute";
    wrap.style.position = "relative";
    wrap.appendChild(spacer);
    const canvas = stage.querySelector("canvas");
    canvas.style.opacity = opacity;
    $("#op", root).addEventListener("input", (e) => { canvas.style.opacity = e.target.value; state.opts.op = e.target.value; });

    const ctx = canvas.getContext("2d");
    if (mode === "clicks") {
      $("#hinfo", root).textContent = `${d.points.length.toLocaleString()} clicks on ${path} (${device}, ~${vw}px wide, page ~${dh}px tall)`;
      drawHeat(ctx, d.points.map((p) => [p.x * vw, p.y, p.type === "rage" ? 3 : 1]), vw, dh);
    } else {
      const total = d.scroll.reduce((s, r) => s + r.n, 0);
      $("#hinfo", root).textContent = `${total.toLocaleString()} page views measured. Percent of views that scrolled at least this far.`;
      // Reach at band b = views whose deepest point is >= b.
      const counts = new Array(11).fill(0);
      d.scroll.forEach((r) => { counts[Math.min(10, Math.max(0, r.band / 10))] += r.n; });
      let remaining = total;
      for (let i = 0; i <= 10; i++) {
        const reach = total ? remaining / total : 0;
        const y0 = (i / 10) * dh, y1 = ((i + 1) / 10) * dh;
        ctx.fillStyle = `hsla(${Math.round(reach * 120)}, 85%, 50%, 0.55)`;
        ctx.fillRect(0, y0, vw, y1 - y0);
        ctx.fillStyle = "#fff";
        ctx.font = "600 28px sans-serif";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 6;
        if (i < 10) ctx.fillText(`${Math.round(reach * 100)}% reached ${i * 10}%`, 16, y0 + 40);
        ctx.shadowBlur = 0;
        remaining -= counts[i];
      }
    }
  };

  function drawHeat(ctx, points, w, h) {
    if (!points.length) {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(0, 0, w, 90);
      ctx.fillStyle = "#fff";
      ctx.font = "600 26px sans-serif";
      ctx.fillText("No clicks recorded for this page and device in this range", 20, 55);
      return;
    }
    const r = Math.max(18, Math.round(w / 45));
    const shadow = document.createElement("canvas");
    shadow.width = w; shadow.height = h;
    const s = shadow.getContext("2d");
    const alpha = Math.min(0.35, Math.max(0.03, 12 / Math.sqrt(points.length)));
    points.forEach(([x, y, weight]) => {
      const g = s.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${Math.min(1, alpha * weight)})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      s.fillStyle = g;
      s.fillRect(x - r, y - r, r * 2, r * 2);
    });
    const img = s.getImageData(0, 0, w, h);
    const px = img.data;
    // Blue -> green -> yellow -> red by density.
    for (let i = 3; i < px.length; i += 4) {
      const a = px[i] / 255;
      if (!a) continue;
      const hue = (1 - Math.min(1, a * 1.2)) * 240;
      const [rr, gg, bb] = hsl(hue / 360, 1, 0.5);
      px[i - 3] = rr; px[i - 2] = gg; px[i - 1] = bb; px[i] = Math.min(255, 60 + a * 220);
    }
    ctx.putImageData(img, 0, 0);
  }

  function hsl(h, s, l) {
    const f = (n) => {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    };
    return [f(0), f(8), f(4)];
  }

  VIEWS.journeys = async function (root) {
    const pages = (await api("pages")).rows.map((r) => r.path);
    const path = state.opts.path || pages[0] || "/";
    root.innerHTML = `
      <div class="toolbar"><label>Page <select id="jp">${[...new Set([path, ...pages])].map((p) => `<option ${p === path ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></label></div>
      <div class="card" style="margin-bottom:14px"><div class="journey"><div><h3>Came from</h3><div id="j-prev"></div></div><div class="center">${esc(path)}</div><div><h3>Went to</h3><div id="j-next"></div></div></div></div>
      ${card("Most common journeys", `<div id="j-top"></div><p class="small muted">First five distinct pages of each session. Click a journey step on the left or right to walk the path.</p>`, csvBtn("j-top"))}`;
    $("#jp", root).addEventListener("change", (e) => setOpt("path", e.target.value));
    wireCsv(root);
    const d = await api("paths", { path });
    const flow = (el, rows) => {
      const max = Math.max(1, ...rows.map((r) => r.n));
      const total = rows.reduce((s, r) => s + r.n, 0) || 1;
      el.innerHTML = rows.length ? rows.map((r) => `<div class="flow-row" data-p="${esc(r.path)}"><div class="barbg" style="width:${(r.n / max) * 100}%"></div><span>${esc(r.path)}</span><span class="muted">${n(r.n)} · ${pct(r.n / total, 0)}</span></div>`).join("") : `<div class="empty">Nothing yet</div>`;
      el.querySelectorAll("[data-p]").forEach((x) => x.addEventListener("click", () => { if (!x.dataset.p.startsWith("(")) setOpt("path", x.dataset.p); }));
    };
    flow($("#j-prev", root), d.prev);
    flow($("#j-next", root), d.next);
    table($("#j-top", root), [{ key: "journey", label: "Journey", bar: "n" }, { key: "n", label: "Sessions", num: true, fmt: n }], d.journeys, { long: true });
  };

  VIEWS.events = async function (root) {
    const name = state.opts.ev || "";
    root.innerHTML = `
      <div class="grid g2">
        ${card("Custom events", `<div id="e-list"></div><p class="small muted">Sent from the site with <code>track("name", {props})</code>. Click one to break it down.</p>`, csvBtn("e-list"))}
        ${card(name ? `Properties of <code>${esc(name)}</code>` : "Properties", `<div id="e-props">${name ? "" : `<div class="empty">Pick an event</div>`}</div>`)}
      </div>
      <div style="height:14px"></div>
      ${name ? card(`Recent <code>${esc(name)}</code>`, `<div id="e-recent"></div>`) : ""}`;
    wireCsv(root);
    const d = await api("events", { name: name || null });
    table($("#e-list", root), [
      { key: "name", label: "Event", bar: "n" },
      { key: "n", label: "Count", num: true, fmt: n },
      { key: "visitors", label: "Visitors", num: true, fmt: n },
      { key: "last_seen", label: "Last", fmt: (v) => ago(v) },
    ], d.list, { onClick: (r) => setOpt("ev", r.name) });
    if (!name) return;
    table($("#e-props", root), [{ key: "key", label: "Property" }, { key: "value", label: "Value", bar: "n" }, { key: "n", label: "Count", num: true, fmt: n }], d.props);
    table($("#e-recent", root), [
      { key: "ts", label: "When", fmt: when },
      { key: "path", label: "Page" },
      { key: "props", label: "Props", fmt: (v) => `<span class="mono">${esc(v || "")}</span>` },
      { key: "source", label: "Source" },
      { key: "country", label: "Country", fmt: (v) => FLAGS(v) + esc(v || "") },
      { key: "uid", label: "User", fmt: (v) => esc(v || "") },
    ], d.recent, { long: true, onClick: (r) => { state.tab = "visitors"; state.opts.vid = r.vid; writeHash(); } });
  };

  VIEWS.funnels = async function (root) {
    const saved = (await api("funnels")).rows.map((f) => Object.assign(f, { steps: JSON.parse(f.steps) }));
    let steps;
    try { steps = state.opts.steps ? JSON.parse(state.opts.steps) : null; } catch (e) { steps = null; }
    if (!steps) steps = saved[0] ? saved[0].steps : [{ kind: "path", value: "/" }, { kind: "path", value: "/signup*" }];
    const scope = state.opts.scope || "session";

    root.innerHTML = `
      <div class="grid g2" style="grid-template-columns: 360px 1fr">
        <div class="card">
          <h3>Saved</h3>
          <div id="f-saved">${saved.map((f) => `<div class="flow-row" data-id="${f.id}"><span>${esc(f.name)}</span><span><button class="small ghost" data-del="${f.id}">delete</button></span></div>`).join("") || `<div class="empty">None yet</div>`}</div>
          <h3 style="margin-top:16px">Steps</h3>
          <div id="f-steps"></div>
          <button class="small" id="f-add">+ step</button>
          <p class="small muted">Page steps match the path exactly, or use <code>*</code> as a wildcard (<code>/signup*</code>). Event steps match a custom event name. Click steps match button text or selector.</p>
          <label class="small">Count within <select id="f-scope"><option value="session" ${scope === "session" ? "selected" : ""}>one session</option><option value="visitor" ${scope === "visitor" ? "selected" : ""}>any session in range (same browser)</option></select></label>
          <div style="margin-top:12px;display:flex;gap:8px"><button class="primary" id="f-run">Run</button><button id="f-save">Save as...</button></div>
        </div>
        <div class="card"><h3><span>Conversion</span><span class="tools" id="f-sum"></span></h3><div id="f-out"><div class="empty">Loading</div></div></div>
      </div>`;

    function drawSteps() {
      $("#f-steps", root).innerHTML = steps.map((s, i) => `<div class="step-row">
        <select data-i="${i}" data-f="kind">${["path", "event", "click"].map((k) => `<option ${k === s.kind ? "selected" : ""}>${k}</option>`).join("")}</select>
        <input data-i="${i}" data-f="value" value="${esc(s.value)}" placeholder="${s.kind === "path" ? "/pricing" : s.kind === "event" ? "signup_completed" : "Start free trial"}">
        <button class="small ghost" data-rm="${i}">x</button></div>`).join("");
      $("#f-steps", root).querySelectorAll("[data-f]").forEach((el) => el.addEventListener("change", () => { steps[el.dataset.i][el.dataset.f] = el.value; }));
      $("#f-steps", root).querySelectorAll("[data-rm]").forEach((el) => el.addEventListener("click", () => { steps.splice(Number(el.dataset.rm), 1); drawSteps(); }));
    }
    drawSteps();
    $("#f-add", root).addEventListener("click", () => { steps.push({ kind: "path", value: "" }); drawSteps(); });
    $("#f-run", root).addEventListener("click", () => { state.opts.scope = $("#f-scope", root).value; setOpt("steps", JSON.stringify(steps)); });
    $("#f-save", root).addEventListener("click", async () => {
      const name = prompt("Funnel name");
      if (!name) return;
      await post("funnels", { name, steps });
      render();
    });
    root.querySelectorAll("#f-saved [data-id]").forEach((el) => el.addEventListener("click", (e) => {
      if (e.target.dataset.del) return;
      const f = saved.find((x) => String(x.id) === el.dataset.id);
      setOpt("steps", JSON.stringify(f.steps));
    }));
    root.querySelectorAll("[data-del]").forEach((el) => el.addEventListener("click", async () => {
      if (!confirm("Delete this funnel?")) return;
      await api("funnels", { id: el.dataset.del }, { method: "DELETE" });
      render();
    }));

    const r = await post("funnel", { steps }, { scope });
    const out = $("#f-out", root);
    if (!r.steps.length) { out.innerHTML = `<div class="empty">Add a step</div>`; return; }
    const top = r.steps[0].count || 1;
    out.innerHTML = r.steps.map((s, i) => {
      const prev = i ? r.steps[i - 1].count : s.count;
      const stepRate = prev ? s.count / prev : 0;
      return `<div class="funnel-step">
        <div class="muted">${i + 1}</div>
        <div><div class="small" style="margin-bottom:3px"><span class="type">${esc(s.kind)}</span> ${esc(s.value)}</div>
          <div class="funnel-bar"><div class="fill" style="width:${(s.count / top) * 100}%"></div><div class="txt">${n(s.count)}</div></div></div>
        <div class="small">${i ? `<b>${pct(stepRate)}</b> of prev<br><span class="down">-${n(prev - s.count)}</span> dropped<br><span class="muted">median ${dur(s.median_ms)}</span>` : `<b>${pct(s.count / top, 0)}</b> start`}</div>
      </div>`;
    }).join("");
    const last = r.steps[r.steps.length - 1];
    $("#f-sum", root).innerHTML = `<b>${pct(last.count / top, 2)}</b>&nbsp;overall`;
  };

  VIEWS.retention = async function (root) {
    const unit = state.opts.unit || "week";
    const by = state.opts.by || "visitors";
    root.innerHTML = `
      <div class="toolbar">
        <div class="tabs" style="margin:0">${["day", "week", "month"].map((u) => `<button data-u="${u}" class="${u === unit ? "active" : ""}">by ${u}</button>`).join("")}</div>
        <div class="tabs" style="margin:0">${[["visitors", "Browsers"], ["users", "Logged in users"]].map(([k, l]) => `<button data-b="${k}" class="${k === by ? "active" : ""}">${l}</button>`).join("")}</div>
        <span class="small muted">Tip: use Last 90 days or longer for weekly and monthly cohorts.</span>
      </div>
      <div class="kpis" id="r-k"></div>
      <div class="card" style="margin-bottom:14px"><h3>Retention curve</h3><div class="chart-box"><canvas id="r-c"></canvas></div></div>
      ${card("Cohorts", `<div id="r-t" class="table-wrap long"></div><p class="small muted">Each row is everyone first seen in that ${unit}. Columns are the share who came back ${unit}s later. Country, device and source filters apply to how the cohort arrived.</p>`)}`;
    root.querySelectorAll("[data-u]").forEach((b) => b.addEventListener("click", () => setOpt("unit", b.dataset.u)));
    root.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => setOpt("by", b.dataset.b)));

    const d = await api("retention", { unit, by, periods: unit === "day" ? 14 : 12 });
    const stick = d.mau ? d.dau / d.mau : null;
    $("#r-k", root).innerHTML = [
      ["Avg daily active", n(d.dau)],
      ["Active last 30 days", n(d.mau)],
      ["Stickiness (DAU/MAU)", pct(stick)],
      ["Came back at least once", pct(d.returning_share)],
      ["Sessions each", dec(d.sessions_per)],
    ].map(([l, v]) => `<div class="kpi"><div class="label">${l}</div><div class="value">${v}</div></div>`).join("");

    const periods = d.periods;
    const fmtStart = (ts) => new Date(ts).toLocaleDateString([], unit === "month" ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" });
    const now = Date.now();
    const unitMs = unit === "day" ? DAY : unit === "week" ? 7 * DAY : 30 * DAY;
    const rows = d.table.filter((r) => r.size > 0);
    if (!rows.length) { $("#r-t", root).innerHTML = `<div class="empty">No cohorts in this range</div>`; return; }
    const accent = css("--accent");
    const cell = (v, size, future) => {
      if (future) return `<td></td>`;
      const r = size ? v / size : 0;
      return `<td style="background:${accent}${Math.round(Math.min(1, r * 1.6) * 200 + 20).toString(16).padStart(2, "0")};color:${r > 0.4 ? "#fff" : "inherit"}" title="${n(v)} of ${n(size)}">${pct(r, 0)}</td>`;
    };
    $("#r-t", root).innerHTML = `<table class="cohort"><thead><tr><th>Cohort</th><th>Size</th>${[...Array(periods + 1).keys()].map((k) => `<th>${unit[0].toUpperCase()}${k}</th>`).join("")}</tr></thead><tbody>${rows
      .map((r) => `<tr><td class="left">${fmtStart(r.start)}</td><td>${n(r.size)}</td>${r.counts.map((v, k) => cell(v, r.size, r.start + k * unitMs > now)).join("")}</tr>`)
      .join("")}</tbody></table>`;

    // Weighted average curve over cohorts old enough to have that column.
    const curve = [...Array(periods + 1).keys()].map((k) => {
      let num = 0, den = 0;
      rows.forEach((r) => { if (r.start + k * unitMs <= now) { num += r.counts[k]; den += r.size; } });
      return den ? (num / den) * 100 : null;
    });
    lineChart($("#r-c", root), curve.map((_, k) => `${unit} ${k}`), [{ label: "% returning", data: curve }], {
      scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + "%" } }, x: { grid: { display: false } } },
      plugins: { legend: { display: false } },
    });
  };

  VIEWS.visitors = async function (root) {
    const vid = state.opts.vid;
    if (vid) return visitorProfile(root, vid);
    const q = state.opts.q || "";
    const users = state.opts.users === "1";
    root.innerHTML = `
      <div class="toolbar"><input id="vq" placeholder="visitor id prefix or user id" value="${esc(q)}" size="34"><button id="vgo">Search</button>
        <label><input type="checkbox" id="vu" ${users ? "checked" : ""}> logged in only</label></div>
      ${card("Recently active", `<div id="v-t"></div>`, csvBtn("v-t"))}`;
    wireCsv(root);
    $("#vgo", root).addEventListener("click", () => setOpt("q", $("#vq", root).value.trim()));
    $("#vq", root).addEventListener("keydown", (e) => { if (e.key === "Enter") setOpt("q", e.target.value.trim()); });
    $("#vu", root).addEventListener("change", (e) => setOpt("users", e.target.checked ? "1" : ""));
    const d = await api("visitors", { q, users: users ? "1" : null });
    table($("#v-t", root), [
      { key: "vid", label: "Visitor", fmt: (v) => `<span class="mono">${esc(String(v).slice(0, 8))}</span>` },
      { key: "uid", label: "User", fmt: (v, r) => (v ? `${esc(v)} <span class="muted">${esc(r.role || "")}</span>` : `<span class="muted">anon</span>`) },
      { key: "first_ts", label: "First seen", fmt: when },
      { key: "last_ts", label: "Last seen", fmt: ago },
      { key: "sessions", label: "Sessions", num: true, fmt: n },
      { key: "pageviews", label: "Pages", num: true, fmt: n },
      { key: "first_source", label: "First source" },
      { key: "first_path", label: "Landed on" },
      { key: "country", label: "Country", fmt: (v) => FLAGS(v) + esc(v || "") },
      { key: "device", label: "Device" },
    ], d.rows, { long: true, onClick: (r) => setOpt("vid", r.vid) });
  };

  async function visitorProfile(root, vid) {
    root.innerHTML = `<div class="empty">Loading visitor</div>`;
    const d = await api("visitor", { vid });
    const v = d.visitor || {};
    const bySession = new Map();
    d.events.forEach((e) => { if (!bySession.has(e.sid)) bySession.set(e.sid, []); bySession.get(e.sid).push(e); });
    root.innerHTML = `
      <div class="toolbar"><button id="back">Back to list</button><span class="mono muted">${esc(vid)}</span></div>
      <div class="kpis">
        ${[["User", v.uid ? `${esc(v.uid)} ${esc(v.role || "")}` : "anonymous"], ["First seen", when(v.first_ts)], ["Last seen", ago(v.last_ts)], ["Sessions", n(v.sessions)], ["Pageviews", n(v.pageviews)], ["First source", esc(v.first_source || "-")], ["Landed on", esc(v.first_path || "-")], ["Where", FLAGS(v.country) + esc(v.country || "") + " · " + esc(v.device || "")]]
          .map(([l, x]) => `<div class="kpi"><div class="label">${l}</div><div class="value" style="font-size:15px">${x}</div></div>`).join("")}
      </div>
      ${card("Timeline", `<div class="timeline">${d.sessions.map((s) => {
        const evs = (bySession.get(s.sid) || []).slice().reverse();
        return `<div class="sess"><div><b>${when(s.start_ts)}</b> <span class="muted">${dur(s.end_ts - s.start_ts)} · ${n(s.pageviews)} pages · ${esc(s.source)}/${esc(s.medium)}${s.campaign ? " · " + esc(s.campaign) : ""} · ${esc(s.browser)} ${esc(s.os)} · ${esc(s.city || "")}</span></div>
          ${evs.filter((e) => e.type !== "engage").map((e) => `<div class="ev"><span class="muted">${clock(e.ts)}</span><span><span class="type ${esc(e.type)}">${esc(e.type === "custom" || e.type === "vital" ? e.name : e.type)}</span></span><span>${esc(e.path)} ${e.label ? `<span class="muted">· ${esc(e.label)}</span>` : ""}${e.type === "scroll" ? ` <span class="muted">· ${Math.round(e.value)}%</span>` : ""}${e.type === "vital" ? ` <span class="muted">· ${dec(e.value, e.name === "CLS" ? 3 : 0)}</span>` : ""}${e.props ? ` <span class="mono muted">${esc(e.props)}</span>` : ""}</span></div>`).join("")}</div>`;
      }).join("") || `<div class="empty">No sessions</div>`}</div>`)}`;
    $("#back", root).addEventListener("click", () => setOpt("vid", ""));
  }

  VIEWS.performance = async function (root) {
    const d = await api("performance");
    const unitOf = (name) => (name === "CLS" ? "" : "ms");
    const fmtV = (name, v) => (v === null || v === undefined ? "-" : name === "CLS" ? dec(v, 3) : n(v) + " ms");
    const rate = (name, v) => {
      const lim = d.summary.find((s) => s.name === name);
      if (!lim || v === null || v === undefined) return "";
      return v <= lim.limits[0] ? "good" : v <= lim.limits[1] ? "ni" : "poor";
    };
    root.innerHTML = `
      <div class="vitals" style="margin-bottom:14px">${d.summary.map((s) => `<div class="kpi"><div class="label">${s.name} p75 <span class="pill ${rate(s.name, s.p75)}">${{ good: "good", ni: "needs work", poor: "poor" }[rate(s.name, s.p75)] || ""}</span></div>
        <div class="value">${fmtV(s.name, s.p75)}</div>
        <div class="delta muted">${n(s.samples)} samples · good under ${s.limits[0]}${unitOf(s.name)}</div>
        ${s.samples ? `<div class="dist"><div style="width:${s.good * 100}%"></div><div style="width:${(1 - s.good - s.poor) * 100}%"></div><div style="width:${s.poor * 100}%"></div></div>` : ""}</div>`).join("")}</div>
      <div class="grid g2">
        ${card("Slowest pages (p75)", `<div id="pf-t"></div>`, csvBtn("pf-t"))}
        ${card("JavaScript errors", `<div id="pf-e"></div>`, csvBtn("pf-e"))}
      </div>`;
    wireCsv(root);
    const vcol = (name) => ({ key: name, label: name, num: true, fmt: (v) => (v === null ? "-" : `<span class="pill ${rate(name, v)}">${name === "CLS" ? dec(v, 3) : n(v)}</span>`) });
    table($("#pf-t", root), [{ key: "path", label: "Page", bar: "samples" }, vcol("LCP"), vcol("INP"), vcol("CLS"), vcol("TTFB"), { key: "samples", label: "n", num: true, fmt: n }], d.perPage, { sort: "LCP" });
    table($("#pf-e", root), [
      { key: "message", label: "Error", bar: "n", fmt: (v, r) => `${esc(v)}<br><span class="muted mono">${esc(r.source || "")}</span>` },
      { key: "n", label: "Count", num: true, fmt: n },
      { key: "sessions", label: "Sessions", num: true, fmt: n },
      { key: "paths", label: "Pages", fmt: (v) => esc(String(v || "").split(",").slice(0, 3).join(", ")) },
      { key: "last_seen", label: "Last", fmt: ago },
    ], d.errors);
  };

  // ----------------------------------------------------------------- shell

  function drawChips() {
    const chips = Object.entries(state.filters);
    $("#chips").innerHTML = chips.map(([k, v]) => `<span class="chip">${esc(k)}: <b>${esc(v)}</b><button data-rm="${esc(k)}" title="remove">x</button></span>`).join("") +
      (chips.length > 1 ? `<button class="small ghost" id="clear">clear all</button>` : "");
    $("#chips").querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => { delete state.filters[b.dataset.rm]; writeHash(); }));
    const clear = $("#clear");
    if (clear) clear.addEventListener("click", () => { state.filters = {}; writeHash(); });
  }

  async function render(quiet) {
    const token = ++renderToken;
    clearTimeout(timer);
    charts.forEach((c) => c.destroy());
    charts = [];
    document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.tab === state.tab));
    $("#title").textContent = TITLES[state.tab];
    $("#range").value = state.range;
    $("#custom").hidden = state.range !== "custom";
    $("#internal").checked = state.internal;
    $("#goal").value = state.goal;
    drawChips();
    const root = document.createElement("div");
    // A quiet render (realtime auto refresh) builds off screen and swaps, so
    // the page does not flash. Everything else renders in place, because the
    // heatmap and the charts measure their container while they draw.
    if (quiet) root.style.display = "none";
    else view.classList.add("loading");
    view.replaceChildren(...(quiet ? [...view.children, root] : [root]));
    try {
      await VIEWS[state.tab](root);
      if (token !== renderToken) return;
      root.style.display = "";
      view.replaceChildren(root);
      charts.forEach((c) => c.resize());
    } catch (err) {
      if (token !== renderToken) return;
      view.innerHTML = `<div class="card err">Could not load: ${esc(err.message)}</div>`;
      console.error(err);
    } finally {
      if (token === renderToken) view.classList.remove("loading");
    }
  }

  function init() {
    try {
      const t = localStorage.getItem("ca_theme");
      if (t) document.documentElement.dataset.theme = t;
    } catch (e) { /* storage blocked */ }
    readHash();
    window.addEventListener("hashchange", () => { readHash(); render(); });
    $("#range").addEventListener("change", (e) => {
      state.range = e.target.value;
      if (state.range === "custom") {
        const [f, t] = [Date.now() - 30 * DAY, Date.now()];
        $("#dfrom").value = new Date(f).toISOString().slice(0, 10);
        $("#dto").value = new Date(t).toISOString().slice(0, 10);
        state.from = f; state.to = t;
      }
      writeHash();
    });
    const custom = () => {
      state.from = new Date($("#dfrom").value + "T00:00:00").getTime();
      state.to = new Date($("#dto").value + "T23:59:59").getTime();
      if (state.from && state.to) writeHash();
    };
    $("#dfrom").addEventListener("change", custom);
    $("#dto").addEventListener("change", custom);
    $("#internal").addEventListener("change", (e) => { state.internal = e.target.checked; writeHash(); });
    $("#goal").addEventListener("change", (e) => { state.goal = e.target.value.trim() || "signup_completed"; writeHash(); });
    $("#refresh").addEventListener("click", () => render());
    $("#theme").addEventListener("click", () => {
      const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      const next = dark ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("ca_theme", next); } catch (e) { /* ignore */ }
      render(true);
    });
    fetch("/api/me").then((r) => r.json()).then((d) => { $("#who").textContent = "Signed in as " + d.email; }).catch(() => {});
    render();
  }

  init();
})();
