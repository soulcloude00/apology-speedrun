(() => {
  "use strict";

  // Set this to your deployed URL (e.g. "apologyspeedrun.com") so it shows on share images.
  const SITE = "";
  const PENALTY = 2.5;
  const MASH_NEEDED = 7;
  const LAUNCH_UTC = Date.UTC(2026, 10, 14);
  const GRADES = [
    [5, "S", "Statement Before the Story", "#f2c94c"],
    [8, "A", "Ahead of the Discourse", "#3ad07a"],
    [12, "B", "Standard Notes App Procedure", "#5aa9ff"],
    [18, "C", "Trending for the Wrong Reasons", "#c38bff"],
    [26, "D", "Main Character of the Day", "#ff9f43"],
    [Infinity, "F", "Congressional Hearing Scheduled", "#ff4d4d"],
  ];
  const TWIST_LABEL = { ceo: "⚡ CEO grabbed the phone", escalate: "⚡ Story escalated", legal: "⚡ Legal entered the room" };
  const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Helvetica Neue", Inter, Arial, sans-serif';
  const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
  const SERIF = '"Instrument Serif", Georgia, serif';

  const $ = (s) => document.querySelector(s);
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  // ---------- helpers ----------
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pickOne = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function dailyNumber() {
    const d = new Date();
    return Math.max(1, Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - LAUNCH_UTC) / 864e5) + 1);
  }
  function fmt(t) {
    if (t >= 60) {
      const m = Math.floor(t / 60);
      return `${m}:${(t - m * 60).toFixed(2).padStart(5, "0")}`;
    }
    return t.toFixed(2);
  }
  function fmtK(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
    return String(n);
  }
  const quoteTweets = (t) => Math.round(90 * t * t + 260 * t);
  function siteLabel() {
    if (SITE) return SITE;
    if (location.protocol.startsWith("http") && location.host) return location.host + location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
    return "Corporate Apology Speedrun";
  }
  function shareUrl() {
    if (SITE) return "https://" + SITE.replace(/^https?:\/\//, "");
    if (location.protocol.startsWith("http")) return location.origin + location.pathname;
    return "";
  }

  // ---------- sound ----------
  const sfx = (() => {
    let ac = null;
    const on = () => store.get("cas-mute") !== true;
    function beep(freq, dur = 0.08, type = "square", vol = 0.035, slide = 0, delay = 0) {
      if (!on()) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const t = ac.currentTime + delay;
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(ac.destination);
        o.start(t); o.stop(t + dur + 0.02);
      } catch { /* no audio */ }
    }
    return {
      tick: () => beep(660, 0.07),
      go: () => beep(990, 0.16),
      pick: () => beep(520, 0.05, "triangle", 0.07),
      buzz: () => beep(150, 0.32, "sawtooth", 0.05, 0.5),
      twist: () => { beep(880, 0.1); beep(660, 0.1, "square", 0.035, 0, 0.11); beep(440, 0.22, "square", 0.035, 0, 0.22); },
      mash: () => beep(300 + Math.random() * 260, 0.04, "square", 0.03),
      notif: () => beep(1250, 0.035, "sine", 0.025),
      done: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.13, "triangle", 0.06, 0, i * 0.09)),
    };
  })();

  // ---------- round building ----------
  function makeOpts(slot, rnd, trapCount) {
    const normal = shuffle(slot.options, rnd).slice(0, 4 - trapCount);
    const traps = shuffle(slot.traps, rnd).slice(0, trapCount).map((t) => ({ ...t, trap: true }));
    return shuffle([...normal, ...traps], rnd);
  }

  let lastRandomScandal = -1;
  function buildRound(mode) {
    let rnd, scandalIdx, dailyNo = null;
    if (mode === "daily") {
      dailyNo = dailyNumber();
      rnd = mulberry32(hashStr("daily-" + todayKey()));
      const order = shuffle(SCANDALS.map((_, i) => i), mulberry32(424242));
      scandalIdx = order[(dailyNo - 1) % order.length];
    } else {
      rnd = mulberry32((Math.random() * 2 ** 32) >>> 0);
      do { scandalIdx = Math.floor(Math.random() * SCANDALS.length); } while (scandalIdx === lastRandomScandal && SCANDALS.length > 1);
      lastRandomScandal = scandalIdx;
    }

    const steps = SLOTS.map((slot) => ({ type: "pick", key: slot.key, slot, opts: makeOpts(slot, rnd, 1) }));
    const forced = mode === "random" && new URLSearchParams(location.search).get("twist");
    const twist = ["ceo", "escalate", "legal"].includes(forced) ? forced : pickOne(["ceo", "escalate", "legal"], rnd);
    let update = null, ceo = null;
    if (twist === "escalate") {
      update = pickOne(ESCALATIONS, rnd);
      steps.splice(3, 0,
        { type: "twist", kind: "escalate" },
        { type: "pick", key: "update", slot: UPDATE_SLOT, opts: makeOpts(UPDATE_SLOT, rnd, 1) });
    } else if (twist === "legal") {
      const at = 1 + Math.floor(rnd() * 3);
      steps[at] = { ...steps[at], opts: makeOpts(steps[at].slot, rnd, 2), legal: true };
      steps.splice(at, 0, { type: "twist", kind: "legal" });
    } else {
      ceo = { name: pickOne(CEO_NAMES, rnd), line: pickOne(CEO_LINES, rnd) };
      steps.splice(2 + Math.floor(rnd() * 2), 0, { type: "twist", kind: "ceo" });
    }
    const sig = steps.map((s) => s.type === "twist" ? s.kind : s.key).join(">");
    return { mode, dailyNo, scandal: SCANDALS[scandalIdx], steps, twist, update, ceo, sig };
  }

  // ---------- state ----------
  let round = null;
  let run = null;
  let raf = 0;
  let timers = [];
  let lastResult = null;

  const fill = (t) => t.replace(/\{(\w+)\}/g, (m, k) => (round.scandal[k] ?? m));
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function show(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === "screen-" + name));
    window.scrollTo(0, 0);
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); }

  function renderHeadline() {
    const h = $("#headline");
    h.textContent = round.scandal.headline;
    if (run.escalated) {
      const u = document.createElement("span");
      u.className = "update";
      u.innerHTML = "<b>UPDATE:</b> ";
      u.append(fill(round.update));
      h.append(u);
    }
  }

  function start(mode, rerun = false) {
    clearTimers();
    if (!rerun || !round) round = buildRound(mode);
    const pb = store.get("cas-pb");
    run = {
      step: 0, picks: [], splits: [], penalty: 0, t0: 0, pausedAt: null, playing: false,
      pb: pb && pb.sig === round.sig ? pb : null,
      replies: [], usedReplies: new Set(), lastReplyAt: 0, escalated: false, ceoLet: false, mash: 0,
    };
    renderHeadline();
    $("#note-date").textContent = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    $("#timer").textContent = "0.00";
    $("#qt").textContent = "0";
    $("#penalty").textContent = "";
    $("#options").innerHTML = "";
    $("#step-label").textContent = "";
    $("#twist").className = "twist";
    $("#feed").innerHTML = "";
    renderDraft();
    renderSplits($("#splits"));
    show("play");

    const cd = $("#countdown");
    cd.classList.add("show");
    ["3", "2", "1"].forEach((n, i) => later(() => { cd.innerHTML = `<span>${n}</span>`; sfx.tick(); }, i * 550));
    later(() => {
      cd.classList.remove("show");
      cd.innerHTML = "";
      sfx.go();
      run.t0 = performance.now();
      run.lastReplyAt = run.t0;
      run.playing = true;
      renderStep();
      tick();
    }, 3 * 550);
  }

  const elapsed = () => ((run.pausedAt ?? performance.now()) - run.t0) / 1000 + run.penalty;
  const busy = () => !run || !run.playing || run.pausedAt != null;

  function tick() {
    if (!run.playing) return;
    const t = elapsed();
    $("#timer").textContent = fmt(t);
    $("#qt").textContent = quoteTweets(t).toLocaleString("en-US");
    if (run.pausedAt == null && performance.now() - run.lastReplyAt > 2600) addReply("waiting");
    raf = requestAnimationFrame(tick);
  }

  // ---------- steps ----------
  function stepLabel(step) {
    return step.type === "twist" ? TWIST_LABEL[step.kind] : step.slot.label.split(" (")[0];
  }

  function renderStep() {
    const step = round.steps[run.step];
    const box = $("#options");
    box.classList.remove("enter");
    box.innerHTML = "";
    if (step.type === "twist") return runTwist(step);

    const picks = round.steps.filter((s) => s.type === "pick");
    const n = picks.indexOf(step) + 1;
    $("#step-label").innerHTML = `<b>${n}/${picks.length}</b> · ${step.slot.label}` +
      (step.legal ? ' <span class="legal-warn">⚖ Legal is watching: 2 lines get flagged</span>' : "");
    step.opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "opt" + (step.legal ? " opt-legal" : "");
      b.innerHTML = `<kbd>${i + 1}</kbd><span></span>`;
      b.querySelector("span").textContent = fill(o.t);
      b.addEventListener("click", () => pick(i));
      box.appendChild(b);
    });
    void box.offsetWidth;
    box.classList.add("enter");
  }

  function completeStep() {
    run.splits.push(elapsed());
    run.step++;
    renderDraft();
    renderSplits($("#splits"));
    if (run.step >= round.steps.length) finish();
    else renderStep();
  }

  function pick(i) {
    if (busy()) return;
    const step = round.steps[run.step];
    if (step.type !== "pick") return;
    const opt = step.opts[i];
    if (!opt) return;
    if (opt.trap) {
      run.penalty += PENALTY;
      sfx.buzz();
      toast(`LEGAL INTERVENED +${PENALTY.toFixed(1)}s`, opt.why);
      $("#penalty").textContent = `+${run.penalty.toFixed(1)}s legal`;
      const tm = $("#timer");
      tm.classList.add("flash");
      later(() => tm.classList.remove("flash"), 500);
    } else sfx.pick();
    run.picks.push({ ...opt, key: step.key });
    later(() => addReply(replyCategory(opt, step.key)), 250 + Math.random() * 300);
    completeStep();
  }

  // ---------- twists ----------
  function pause() { run.pausedAt = performance.now(); }
  function resume() { run.t0 += performance.now() - run.pausedAt; run.pausedAt = null; }

  function showTwist(html, kind) {
    const el = $("#twist");
    el.className = "twist show twist-" + kind;
    el.innerHTML = html;
    sfx.twist();
  }
  function hideTwist() { $("#twist").className = "twist"; }

  function runTwist(step) {
    $("#step-label").innerHTML = `<b>PLOT TWIST</b> · clock paused`;
    if (step.kind === "escalate") {
      pause();
      showTwist(`<div class="twist-tag">Plot twist</div><h2>The story just got worse.</h2><p><b>UPDATE:</b> ${escapeHtml(fill(round.update))}</p>`, "escalate");
      later(() => {
        run.escalated = true;
        renderHeadline();
        addReply("update");
        hideTwist(); resume(); completeStep();
      }, 2000);
    } else if (step.kind === "legal") {
      pause();
      showTwist(`<div class="twist-tag">Plot twist</div><h2>Legal has entered the room.</h2><p>Next step: <b>two</b> lines won't survive review. Read carefully.</p>`, "legal");
      later(() => { hideTwist(); resume(); completeStep(); }, 1700);
    } else {
      // CEO: interactive and the clock keeps running
      run.mash = 0;
      $("#step-label").innerHTML = `<b>PLOT TWIST</b> · the clock is running`;
      showTwist(`
        <div class="twist-tag">Plot twist</div>
        <h2>📞 ${escapeHtml(round.ceo.name)} (CEO) grabbed the phone.</h2>
        <p>He wants to add: <q>${escapeHtml(round.ceo.line)}</q></p>
        <div class="ceo-actions">
          <button class="opt ceo-let" id="ceo-let"><kbd>1</kbd><span>Let him post it <small>(instant)</small></span></button>
          <button class="opt ceo-mash" id="ceo-mash"><kbd>2</kbd><span>Talk him down <small>mash! <b id="mash-n">0</b>/${MASH_NEEDED}</small></span><i class="mash-bar" id="mash-bar"></i></button>
        </div>`, "ceo");
      $("#ceo-let").addEventListener("click", ceoLet);
      $("#ceo-mash").addEventListener("click", ceoMash);
    }
  }

  function ceoLet() {
    if (busy() || round.steps[run.step].kind !== "ceo") return;
    run.ceoLet = true;
    run.picks.push({ t: round.ceo.line, key: "ceo", s: 0, d: 0, c: 2 });
    sfx.buzz();
    toast("He hit post.", "Comms team has left the chat.");
    hideTwist();
    later(() => addReply("ceo"), 300);
    completeStep();
  }
  function ceoMash() {
    if (busy() || round.steps[run.step].kind !== "ceo") return;
    run.mash++;
    sfx.mash();
    const n = $("#mash-n"), bar = $("#mash-bar");
    if (n) n.textContent = run.mash;
    if (bar) bar.style.width = (run.mash / MASH_NEEDED) * 100 + "%";
    if (run.mash >= MASH_NEEDED) {
      sfx.go();
      toast("CEO talked down.", "He's \"taking some time to reflect\" (Bali).");
      hideTwist();
      completeStep();
    }
  }

  // ---------- replies ----------
  function replyCategory(opt, key) {
    if (opt.trap) return "trap";
    if (key === "update" && Math.random() < 0.5) return "update";
    const { s = 0, d = 0, c = 0 } = opt;
    const m = Math.max(s, d, c);
    return c === m ? "c" : d === m ? "d" : "s";
  }

  function addReply(cat) {
    if (!run || !run.playing) return;
    const pool = REPLIES[cat].filter((t) => !run.usedReplies.has(t));
    if (!pool.length) return;
    const text = pickOne(pool);
    run.usedReplies.add(text);
    run.lastReplyAt = performance.now();
    const base = Math.max(40, quoteTweets(elapsed()) / 3);
    const boost = { trap: 4, ceo: 3.5, update: 2, waiting: 0.5 }[cat] || 1;
    const reply = {
      cat, text: fill(text),
      handle: pickOne(HANDLES),
      likes: Math.round(base * boost * (0.6 + Math.random())),
      hue: Math.floor(Math.random() * 360),
    };
    run.replies.push(reply);
    sfx.notif();

    const el = document.createElement("div");
    el.className = "reply reply-" + cat;
    el.innerHTML = `<span class="av" style="background:hsl(${reply.hue} 55% 55%)">${reply.handle[0].toUpperCase()}</span>
      <div class="reply-body"><div class="reply-head"><b>@${reply.handle}</b><span>· now</span></div><p></p></div>
      <span class="likes">♥ ${fmtK(reply.likes)}</span>`;
    el.querySelector("p").textContent = reply.text;
    const feed = $("#feed");
    feed.prepend(el);
    while (feed.children.length > 4) feed.lastChild.remove();
  }

  function topReply() {
    const rs = run.replies.filter((r) => r.cat !== "waiting");
    const pool = rs.length ? rs : run.replies;
    if (!pool.length) return null;
    const best = pool.reduce((a, b) => (b.likes > a.likes ? b : a));
    return { ...best, likes: Math.max(best.likes, Math.round(quoteTweets(run.splits[run.splits.length - 1]) * 1.4)) };
  }

  let toastTimer = 0;
  function toast(title, sub) {
    const el = $("#toast");
    el.innerHTML = "";
    el.append(title);
    if (sub) { const s = document.createElement("small"); s.textContent = sub; el.append(s); }
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
  }
  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- draft ----------
  const PARA_OF = { open: 0, ack: 1, explain: 1, update: 1, action: 2, close: 2 };
  function paragraphs(picks) {
    const paras = [[], [], []];
    let ceo = null;
    for (const p of picks) {
      if (p.key === "ceo") ceo = [{ text: `P.S. ${p.t} — ${round.ceo.name}, CEO`, italic: true }];
      else paras[PARA_OF[p.key]].push({ text: fill(p.t), redacted: !!p.trap, bold: p.key === "open" });
    }
    const out = paras.filter((p) => p.length);
    if (run.step >= round.steps.length) out.push([{ text: `— The ${round.scandal.co} Team` }]);
    if (ceo) out.push(ceo);
    return out;
  }

  function renderDraft() {
    const body = $("#draft");
    body.innerHTML = "";
    const paras = paragraphs(run.picks);
    if (!paras.length) {
      body.innerHTML = '<p class="note-empty">Drafting… <span class="caret"></span></p>';
      return;
    }
    paras.forEach((para, pi) => {
      const p = document.createElement("p");
      if (para[0].bold) p.className = "title";
      if (para[0].italic) p.className = "ceo-ps";
      para.forEach((s, si) => {
        if (si) p.append(" ");
        const span = document.createElement("span");
        span.className = "seg" + (s.redacted ? " redacted" : "");
        span.textContent = s.text;
        p.append(span);
      });
      if (pi === paras.length - 1 && run.step < round.steps.length) {
        p.append(" ");
        const c = document.createElement("span");
        c.className = "caret";
        p.append(c);
      }
      body.append(p);
    });
  }

  function renderSplits(list) {
    const pb = run.pb;
    list.innerHTML = "";
    round.steps.forEach((step, i) => {
      const li = document.createElement("li");
      const t = run.splits[i];
      const done = t != null;
      li.className = (done ? "done" : i === run.step ? "current" : "") + (step.type === "twist" ? " twist-row" : "");
      const name = document.createElement("span");
      name.textContent = stepLabel(step);
      const pickIdx = round.steps.slice(0, i).filter((s) => s.type === "pick").length;
      if (done && step.type === "pick" && run.picks.filter((p) => p.key !== "ceo")[pickIdx]?.trap) {
        const m = document.createElement("span");
        m.className = "trap-mark";
        m.textContent = " ⚖";
        name.append(m);
      }
      const time = document.createElement("span");
      time.textContent = done ? fmt(t) : "—";
      const delta = document.createElement("span");
      delta.className = "delta";
      if (done && pb && pb.splits && pb.splits[i] != null) {
        const d = t - pb.splits[i];
        delta.textContent = (d <= 0 ? "−" : "+") + Math.abs(d).toFixed(2);
        delta.classList.add(d <= 0 ? "ahead" : "behind");
      }
      li.append(name, time, delta);
      list.append(li);
    });
  }

  // ---------- scoring ----------
  function verdictFor(st, traps) {
    if (traps >= 4) return "Accidental Whistleblower";
    if (traps >= 2) return "Leaked Draft Energy";
    if (run.ceoLet) return "CEO Has Entered the Chat";
    const m = Math.max(st.s, st.d, st.c);
    if (st.s === m && st.s >= 5) return "Suspiciously Human";
    if (st.d === m) return "Teflon Statement";
    if (st.c === m) return "Brand Voice Incident";
    return "Notes App Classic";
  }

  function finish() {
    run.playing = false;
    cancelAnimationFrame(raf);
    hideTwist();
    sfx.done();
    const total = run.splits[run.splits.length - 1];
    $("#timer").textContent = fmt(total);
    $("#qt").textContent = quoteTweets(total).toLocaleString("en-US");
    $("#options").innerHTML = "";
    $("#step-label").innerHTML = "<b>Posted.</b> Turning off replies…";

    const st = run.picks.reduce((a, p) => ({ s: a.s + (p.s || 0), d: a.d + (p.d || 0), c: a.c + (p.c || 0) }), { s: 0, d: 0, c: 0 });
    const traps = run.picks.filter((p) => p.trap).length;
    const [, letter, title, color] = GRADES.find((g) => total < g[0]);
    const stock = st.d * 0.6 - st.s * 0.5 - traps * 1.7 - (run.ceoLet ? 2.2 : 0) + (10 - total) * 0.25;
    const legal = ["thrilled", "concerned", "drafting resignations", "in witness protection", "in witness protection", "gone", "gone"][traps];

    const pb = store.get("cas-pb");
    const newPB = !pb || total < pb.total;
    if (newPB) store.set("cas-pb", { total, splits: run.splits.slice(), sig: round.sig });
    if (round.mode === "daily") {
      const key = "cas-daily-" + todayKey();
      const best = store.get(key);
      if (best == null || total < best) store.set(key, total);
    }

    lastResult = {
      total, letter, title, color, traps, stock, legal, newPB,
      verdict: verdictFor(st, traps),
      penalty: run.penalty,
      qt: quoteTweets(total),
      top: topReply(),
    };
    updateChips();
    later(showResult, 800);
  }

  // ---------- result + share image ----------
  async function showResult() {
    const r = lastResult;
    $("#pb-banner").hidden = !r.newPB;
    $("#share-hint").textContent = "Tip: copy the image, then paste it into your post.";
    $("#twist-note").textContent = TWIST_LABEL[round.twist].replace("⚡ ", "Plot twist: ");
    renderSplits($("#result-splits"));
    show("result");
    try { await document.fonts.ready; await Promise.all([document.fonts.load(`140px ${MONO}`), document.fonts.load(`40px ${SERIF}`)]); } catch { /* fonts optional */ }
    drawShot($("#shot"), r);
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  const bodyFont = (wd, size) => `${wd.italic ? "italic " : ""}${wd.bold ? 700 : 400} ${size}px ${SANS}`;
  function layoutBody(ctx, paras, size, maxW) {
    const lh = size * 1.36, gap = size * 0.55, lines = [];
    let y = 0;
    paras.forEach((para, pi) => {
      const words = [];
      para.forEach((seg) => seg.text.split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, red: seg.redacted, bold: seg.bold, italic: seg.italic })));
      let line = [], x = 0;
      for (const wd of words) {
        ctx.font = bodyFont(wd, size);
        const ww = ctx.measureText(wd.w).width;
        const sp = ctx.measureText(" ").width;
        if (line.length && x + ww > maxW) { lines.push({ y, words: line }); y += lh; line = []; x = 0; }
        line.push({ ...wd, x, ww, sp });
        x += ww + sp;
      }
      if (line.length) { lines.push({ y, words: line }); y += lh; }
      if (pi < paras.length - 1) y += gap;
    });
    return { lines, height: y };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawShot(canvas, r) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height, PAD = 56;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fbfaf7";
    ctx.fillRect(0, 0, W, H);

    // Breaking strip (+ update line when the story escalated)
    let hs = 32, hl;
    do { ctx.font = `700 ${hs}px ${SANS}`; hl = wrap(ctx, round.scandal.headline, W - PAD * 2); hs -= 2; } while (hl.length > 2 && hs > 18);
    hs += 2;
    const stripH = run.escalated ? 222 : 158;
    ctx.fillStyle = "#d62f2f";
    ctx.fillRect(0, 0, W, stripH);
    ctx.font = `800 22px ${MONO}`;
    const label = round.mode === "daily" ? `BREAKING · DAILY SCANDAL #${round.dailyNo}` : "BREAKING";
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = "#111";
    roundRect(ctx, PAD - 12, 24, lw + 24, 36, 6); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, PAD, 50);
    ctx.font = `700 ${hs}px ${SANS}`;
    hl.slice(0, 2).forEach((l, i) => ctx.fillText(l, PAD, 102 + i * (hs + 10)));
    if (run.escalated) {
      let us = 27, txt = "UPDATE: " + fill(round.update);
      do { ctx.font = `600 ${us}px ${SANS}`; us--; } while (ctx.measureText(txt).width > W - PAD * 2 - 24 && us > 16);
      ctx.fillStyle = "#ffe14d";
      roundRect(ctx, PAD - 12, 162, W - PAD * 2 + 24, 44, 8); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.fillText(txt, PAD, 193);
    }

    // Notes chrome
    const nb = stripH + 56;
    ctx.fillStyle = "#e2a800";
    ctx.font = `500 34px ${SANS}`;
    ctx.fillText("‹ Notes", PAD - 12, nb);
    ctx.strokeStyle = "#e2a800"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W - PAD - 8, nb - 12, 20, 0, Math.PI * 2); ctx.stroke();
    [-8, 0, 8].forEach((dx) => { ctx.beginPath(); ctx.arc(W - PAD - 8 + dx, nb - 12, 2.6, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#9b968c";
    ctx.font = `400 24px ${SANS}`;
    ctx.textAlign = "center";
    ctx.fillText($("#note-date").textContent, W / 2, nb + 46);
    ctx.textAlign = "left";

    // Body
    const top = nb + 82, maxH = 832 - top, maxW = W - PAD * 2;
    const paras = paragraphs(run.picks);
    let size = 42, lay;
    do { lay = layoutBody(ctx, paras, size, maxW); size -= 2; } while (lay.height > maxH && size > 20);
    size += 2;
    ctx.textBaseline = "top";
    lay.lines.forEach((line) => {
      line.words.forEach((wd, wi) => {
        const x = PAD + wd.x, y = top + line.y;
        ctx.fillStyle = "#141311";
        if (wd.red) {
          const next = line.words[wi + 1];
          ctx.fillRect(x - 2, y + size * 0.08, wd.ww + (next && next.red ? wd.sp : 0) + 4, size * 1.12);
        } else {
          if (wd.italic) ctx.fillStyle = "#5b5650";
          ctx.font = bodyFont(wd, size);
          ctx.fillText(wd.w, x, y);
        }
      });
    });
    ctx.textBaseline = "alphabetic";

    // Verdict stamp
    const sy = Math.min(top + lay.height + 46, 846);
    ctx.save();
    ctx.translate(W - PAD - 200, sy);
    ctx.rotate(-0.07);
    ctx.font = `800 30px ${MONO}`;
    const stamp = r.verdict.toUpperCase();
    const sw = ctx.measureText(stamp).width + 40;
    ctx.globalAlpha = 0.88;
    ctx.strokeStyle = "#d62f2f"; ctx.lineWidth = 5;
    roundRect(ctx, -sw / 2, -30, sw, 60, 10); ctx.stroke();
    ctx.fillStyle = "#d62f2f";
    ctx.textAlign = "center";
    ctx.fillText(stamp, 0, 11);
    ctx.restore();
    ctx.textAlign = "left";

    // Top reply card
    if (r.top) {
      const cy = 896, ch = 108;
      ctx.fillStyle = "#efe9de";
      roundRect(ctx, PAD - 16, cy, W - PAD * 2 + 32, ch, 18); ctx.fill();
      ctx.fillStyle = `hsl(${r.top.hue} 55% 55%)`;
      ctx.beginPath(); ctx.arc(PAD + 26, cy + ch / 2, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `700 26px ${SANS}`;
      ctx.textAlign = "center";
      ctx.fillText(r.top.handle[0].toUpperCase(), PAD + 26, cy + ch / 2 + 9);
      ctx.textAlign = "left";
      ctx.fillStyle = "#6d675c";
      ctx.font = `600 22px ${SANS}`;
      ctx.fillText(`@${r.top.handle} · Top reply`, PAD + 70, cy + 40);
      ctx.fillStyle = "#d62f2f";
      ctx.textAlign = "right";
      ctx.fillText(`♥ ${fmtK(r.top.likes)}`, W - PAD, cy + 40);
      ctx.textAlign = "left";
      ctx.fillStyle = "#141311";
      let rs = 28;
      do { ctx.font = `500 ${rs}px ${SANS}`; rs--; } while (ctx.measureText(r.top.text).width > W - PAD * 2 - 80 && rs > 18);
      ctx.fillText(r.top.text, PAD + 70, cy + 80);
    }

    // Speedrun band
    const B = 1020;
    ctx.fillStyle = "#111110";
    ctx.fillRect(0, B, W, H - B);
    ctx.fillStyle = r.color;
    ctx.fillRect(0, B, W, 8);

    ctx.fillStyle = "#8d877b";
    ctx.font = `700 22px ${MONO}`;
    ctx.fillText("FINAL TIME", PAD, B + 62);
    ctx.fillStyle = "#fff";
    ctx.font = `800 132px ${MONO}`;
    ctx.fillText(fmt(r.total) + "s", PAD - 6, B + 190);

    ctx.font = `500 24px ${MONO}`;
    ctx.fillStyle = r.penalty > 0 ? "#ff6b6b" : "#3ad07a";
    ctx.fillText(r.penalty > 0 ? `incl. +${r.penalty.toFixed(1)}s legal penalties` : "0 legal penalties ✓", PAD, B + 234);

    const gx = W - PAD - 176, gy = B + 46;
    ctx.fillStyle = r.color;
    roundRect(ctx, gx, gy, 176, 176, 22); ctx.fill();
    ctx.fillStyle = "#111";
    ctx.font = `700 20px ${MONO}`;
    ctx.textAlign = "center";
    ctx.fillText("GRADE", gx + 88, gy + 36);
    ctx.font = `150px ${SERIF}`;
    ctx.fillText(r.letter, gx + 88, gy + 158);
    ctx.textAlign = "left";

    ctx.fillStyle = "#fff";
    ctx.font = `italic 46px ${SERIF}`;
    ctx.fillText(`“${r.title}”`, PAD, B + 300);

    const reactions = [
      `🔁 ${fmtK(r.qt)} quote tweets`,
      `${r.stock >= 0 ? "📈" : "📉"} Stock ${r.stock >= 0 ? "+" : "−"}${Math.abs(r.stock).toFixed(1)}%`,
      `⚖️ Legal: ${r.legal}`,
    ].join("   ");
    let rs = 25;
    do { ctx.font = `500 ${rs}px ${SANS}`; rs--; } while (ctx.measureText(reactions).width > W - PAD * 2 && rs > 14);
    ctx.fillStyle = "#bdb7ab";
    ctx.fillText(reactions, PAD, B + 350);

    ctx.fillStyle = "#6f6a60";
    ctx.font = `500 21px ${MONO}`;
    ctx.fillText(`${siteLabel()} · can you apologize faster?`, PAD, B + 392);
  }

  function shareText() {
    const r = lastResult;
    const where = round.mode === "daily" ? `Daily Scandal #${round.dailyNo}` : round.scandal.co;
    const extras = [];
    if (r.traps) extras.push(`${r.traps} line${r.traps > 1 ? "s" : ""} redacted by Legal`);
    if (run.ceoLet) extras.push("the CEO got the phone");
    const lines = [
      `I issued a corporate apology in ${fmt(r.total)}s (${where})`,
      `Grade ${r.letter}: "${r.title}"`,
      `Verdict: ${r.verdict}${extras.length ? " · " + extras.join(" · ") : ""}`,
      "",
      "Can you apologize faster?",
    ];
    const url = shareUrl();
    return lines.join("\n") + (url ? "\n" + url : "") + "\n#ApologySpeedrun";
  }

  const canvasBlob = () => new Promise((res) => $("#shot").toBlob(res, "image/png"));
  const fileName = () => `apology-speedrun-${fmt(lastResult.total).replace(/[:.]/g, "-")}s.png`;

  async function copyImage() {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": canvasBlob() })]);
      $("#share-hint").textContent = "Image copied. Paste it into your post.";
    } catch {
      $("#share-hint").textContent = "Your browser blocked copying. Use Download instead.";
    }
  }
  async function download() {
    const blob = await canvasBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function nativeShare() {
    try {
      const file = new File([await canvasBlob()], fileName(), { type: "image/png" });
      await navigator.share({ files: [file], text: shareText() });
    } catch { /* cancelled */ }
  }

  // ---------- chrome ----------
  function updateChips() {
    const pb = store.get("cas-pb");
    const chip = $("#pb-chip");
    chip.hidden = !pb;
    if (pb) chip.textContent = `PB ${fmt(pb.total)}s`;
    const db = store.get("cas-daily-" + todayKey());
    $("#daily-tag").textContent = `Daily Scandal #${dailyNumber()}`;
    $("#daily-best").textContent = db != null ? `Your best today: ${fmt(db)}s` : "";
  }
  function updateMute() { $("#mute").textContent = store.get("cas-mute") === true ? "🔇" : "🔊"; }

  function buildTicker() {
    const items = shuffle(SCANDALS.map((s) => s.headline), Math.random);
    const html = items.map((h) => `<span>${escapeHtml(h)}</span>`).join("");
    $("#ticker").innerHTML = html + html;
  }

  function goHome() { clearTimers(); if (run) run.playing = false; hideTwist(); updateChips(); show("start"); }

  $("#btn-daily").addEventListener("click", () => start("daily"));
  $("#btn-random").addEventListener("click", () => start("random"));
  $("#home").addEventListener("click", goHome);
  $("#mute").addEventListener("click", () => { store.set("cas-mute", store.get("cas-mute") !== true); updateMute(); });
  $("#btn-retry").addEventListener("click", () => start(round.mode, true));
  $("#btn-new").addEventListener("click", () => start("random"));
  $("#btn-post").addEventListener("click", () => {
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText()), "_blank", "noopener");
  });
  $("#btn-copy").addEventListener("click", copyImage);
  $("#btn-download").addEventListener("click", download);
  try {
    if (navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] })) {
      const b = $("#btn-share");
      b.hidden = false;
      b.addEventListener("click", nativeShare);
    }
  } catch { /* no share API */ }

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const active = document.querySelector(".screen.active").id;
    if (active === "screen-play" && run && run.playing) {
      const step = round.steps[run.step];
      if (step && step.type === "twist" && step.kind === "ceo") {
        if (e.key === "1" && !e.repeat) { e.preventDefault(); ceoLet(); }
        else if ((e.key === "2" || e.key === " ") && !e.repeat) { e.preventDefault(); ceoMash(); }
      } else if (/^[1-4]$/.test(e.key) && !e.repeat) { e.preventDefault(); pick(+e.key - 1); }
      if (e.key === "Escape") goHome();
      return;
    }
    if (e.repeat) return;
    if (active === "screen-start" && e.key === "Enter" && document.activeElement === document.body) start("daily");
    else if (active === "screen-result" && (e.key === "r" || e.key === "R")) start(round.mode, true);
    else if (active === "screen-result" && (e.key === "n" || e.key === "N")) start("random");
    else if (e.key === "Escape") goHome();
  });

  buildTicker();
  updateChips();
  updateMute();
})();
