(function (root) {
  const LISTHASH = "24461b38f960dcca0270cc5b1b6f8ccefbd61fa96cce5aea6c5aa3e2b7a4a615";
  const ACCOUNT = "DavidWise01";
  const HOSTS = ["0root.ai", "davidwise01"];
  function cubits() {
    const out = [];
    for (let i = 0; i < 26; i++) {
      const L = String.fromCharCode(65 + i);
      const l = L.toLowerCase();
      out.push({ letter: l, name: L + l + l + L, slug: l + l + l + "-" + l });
    }
    return out;
  }
  function formula() {
    return "{{ " + cubits().map(function (c) { return c.name; }).join(", ") + " }}";
  }
  function factCubitNames() {
    const cs = cubits();
    if (cs.length !== 26) throw Error("count " + cs.length);
    cs.forEach(function (c, i) {
      const L = String.fromCharCode(65 + i);
      const l = L.toLowerCase();
      if (c.name !== L + l + l + L) throw Error("name " + c.name);
      if (c.slug !== l + l + l + "-" + l) throw Error("slug " + c.slug);
      if (c.letter !== l) throw Error("letter");
    });
    if (cs[0].name !== "AaaA" || cs[25].name !== "ZzzZ") throw Error("ends");
    return cs;
  }
  function splitHost(host) {
    const counts = {};
    let rest = "";
    for (const ch of host) {
      const low = ch.toLowerCase();
      if (low >= "a" && low <= "z") counts[low] = (counts[low] || 0) + 1;
      else rest += ch;
    }
    return { counts: counts, rest: rest };
  }
  function letterCount(host) {
    let n = 0;
    for (const ch of host) {
      const low = ch.toLowerCase();
      if (low >= "a" && low <= "z") n++;
    }
    return n;
  }
  function factHosts() {
    const hall = splitHost(HOSTS[0]);
    const account = splitHost(HOSTS[1]);
    if (hall.rest !== "0.") throw Error("hall remainder " + hall.rest);
    if (account.rest !== "01") throw Error("account remainder " + account.rest);
    const sum = function (o) {
      return Object.keys(o).reduce(function (s, k) { return s + o[k]; }, 0);
    };
    if (sum(hall.counts) !== letterCount(HOSTS[0])) throw Error("hall strokes");
    if (sum(account.counts) !== letterCount(HOSTS[1])) throw Error("account strokes");
    return { hall: hall.counts, account: account.counts };
  }
  function firstLetter(name) {
    const m = String(name).toLowerCase().match(/[a-z]/);
    if (!m) throw Error("no letter " + name);
    return m[0];
  }
  function factPartition(list) {
    if (!list || !list.length) throw Error("empty list");
    const buckets = {};
    factCubitNames().forEach(function (c) { buckets[c.letter] = []; });
    const seen = Object.create(null);
    for (const name of list) {
      if (seen[name]) throw Error("duplicate " + name);
      seen[name] = 1;
      const L = firstLetter(name);
      if (!buckets[L]) throw Error("bucket " + L);
      buckets[L].push(name);
    }
    let sum = 0;
    Object.keys(buckets).forEach(function (k) { sum += buckets[k].length; });
    if (sum !== list.length) throw Error("cover " + sum);
    return buckets;
  }
  function tenth(repos, total) {
    return Math.round(repos * 1000 / total) / 10;
  }
  function times(n) {
    return n + (n === 1 ? " time" : " times");
  }
  function strokePhrase(n) {
    return n + " host " + (n === 1 ? "stroke" : "strokes");
  }
  function extremes(buckets) {
    const cs = cubits();
    let full = cs[0], thin = cs[0];
    cs.forEach(function (c) {
      const n = buckets[c.letter].length;
      if (n > buckets[full.letter].length) full = c;
      if (n < buckets[thin.letter].length) thin = c;
    });
    return {
      fullest: { name: full.name, letter: full.letter, repos: buckets[full.letter].length },
      thinnest: { name: thin.name, letter: thin.letter, repos: buckets[thin.letter].length }
    };
  }
  function criticizeCubit(m) {
    if (!m || !m.name || !m.letter) throw Error("critic subject");
    if (!(m.total > 0) || m.repos < 0 || m.strokes < 0) throw Error("critic counts");
    if ((m.hall || 0) + (m.account || 0) !== m.strokes) throw Error("critic split");
    if (!m.names || m.names.length !== m.repos) throw Error("critic names");
    const lines = [];
    lines.push(m.name + " read its own page.");
    lines.push("I hold " + m.repos + " public repos and " + strokePhrase(m.strokes) + ".");
    if (m.strokes === 0) {
      lines.push("Neither host spells " + m.letter + ". I still took a full page for a letter that 0root.ai and davidwise01 do not use.");
    } else {
      lines.push("The hosts use " + m.letter + " " + times(m.hall || 0) + " in 0root.ai and " + times(m.account || 0) + " in davidwise01. I answered with a gold cube. A cube is a prop.");
    }
    if (m.repos >= 500) {
      lines.push(m.repos + " spheres on one spiral. The count is true and the picture is a carpet.");
    } else if (m.repos > 24) {
      lines.push("Past one ring of 24, I open another ring and call that composition.");
    } else if (m.repos === 0) {
      lines.push("No public repo starts with " + m.letter + ". The torus is an empty boast.");
    } else {
      lines.push(m.repos + " spheres stand in a circle. A circle is a list that refused to be a list.");
    }
    const share = tenth(m.repos, m.total);
    if (share >= 50) {
      lines.push("That is " + share + "% of " + m.total + ". More than half the account, and the alphabet still pretends we are twenty-six peers.");
    } else if (share < 1) {
      lines.push("That is " + share + "% of " + m.total + ". Under one percent of the account, and a full page anyway.");
    } else {
      lines.push("That is " + share + "% of " + m.total + ". The page is larger than the share.");
    }
    if (m.still) {
      lines.push("Motion is reduced, so the picture sits still. Sitting still is a setting, not a deeper reading.");
    } else {
      lines.push("The picture spins. A count does not get truer by rotating.");
    }
    const asides = [
      ["0root", "The repo 0root is in my list because r is its first letter. The hall 0root.ai is not this list. I keep both facts because the names invite the mix-up."],
      ["oasis", "oasis is filed here because it starts with o. Filing is not reading the repo."],
      ["mayhem", "mayhem is here by its first letter. Those pages keep a four-cubit register. This criticism is not that register."],
      ["sapph-i-on", "sapph-i-on is here by its first letter. This page does not sit on the 7^3 walk."]
    ];
    asides.forEach(function (pair) {
      if (m.names.indexOf(pair[0]) !== -1) lines.push(pair[1]);
    });
    lines.push("The seal under this page covers the name, the slug, and the blurb. It does not cover this complaint. The complaint throws on its own if the numbers drift.");
    const text = lines.join(" ");
    auditCubit(text, m);
    return text;
  }
  function auditCubit(text, m) {
    if (text.indexOf(m.name + " read its own page.") !== 0) throw Error("critic open");
    if (text.indexOf("I hold " + m.repos + " public repos and " + strokePhrase(m.strokes) + ".") === -1) throw Error("critic hold");
    const share = tenth(m.repos, m.total);
    if (text.indexOf(share + "% of " + m.total) === -1) throw Error("critic share");
    let bite = m.strokes === 0 ? text.indexOf("do not use") !== -1 : text.indexOf("A cube is a prop.") !== -1;
    if (m.repos >= 500) bite = bite && text.indexOf("carpet") !== -1;
    else if (m.repos > 24) bite = bite && text.indexOf("composition") !== -1;
    else if (m.repos === 0) bite = bite && text.indexOf("empty boast") !== -1;
    else bite = bite && text.indexOf("refused to be a list") !== -1;
    if (!bite) throw Error("soft critic");
    const motion = m.still ? "sits still" : "does not get truer by rotating";
    if (text.indexOf(motion) === -1) throw Error("critic motion");
    const needles = {
      "0root": "not this list",
      oasis: "Filing is not reading",
      mayhem: "not that register",
      "sapph-i-on": "7^3 walk"
    };
    Object.keys(needles).forEach(function (name) {
      const present = m.names.indexOf(name) !== -1;
      const said = text.indexOf(needles[name]) !== -1;
      if (present !== said) throw Error("critic aside " + name);
    });
  }
  function criticizeShelf(m) {
    if (!m || m.cards !== 26) throw Error("critic cards");
    if (!(m.repos > 0) || m.strokes < 0) throw Error("critic shelf counts");
    if (!m.fullest || !m.thinnest) throw Error("critic ends");
    const lines = [];
    lines.push("The shelf read its own page.");
    lines.push("I counted " + m.cards + " cards and then checked that there are " + m.cards + " cards.");
    lines.push("I hold " + m.repos + " public repos and " + strokePhrase(m.strokes) + ", and I drew none of them.");
    lines.push("The fullest cubit is " + m.fullest.name + " with " + m.fullest.repos + ". The thinnest is " + m.thinnest.name + " with " + m.thinnest.repos + ". I gave them the same card markup.");
    lines.push("The sealed date on this page is " + m.taken + ". I will keep saying that after it is stale, until someone reseals the list.");
    lines.push("A criticism that forgets these numbers is a softer page, and this one throws rather than soften.");
    const text = lines.join(" ");
    if (text.indexOf("I counted " + m.cards + " cards") === -1) throw Error("critic cards line");
    if (text.indexOf("drew none of them") === -1) throw Error("critic picture");
    if (text.indexOf(m.fullest.name + " with " + m.fullest.repos) === -1) throw Error("critic fullest");
    if (text.indexOf(m.thinnest.name + " with " + m.thinnest.repos) === -1) throw Error("critic thinnest");
    if (text.indexOf("I hold " + m.repos + " public repos and " + strokePhrase(m.strokes)) === -1) throw Error("critic shelf hold");
    if (text.indexOf(String(m.taken)) === -1) throw Error("critic taken");
    return text;
  }
  function agenticCubit(m) {
    if (!m || !m.name || !m.letter) throw Error("agent subject");
    if (m.repos < 0 || m.strokes < 0) throw Error("agent counts");
    let act, line;
    if (m.strokes === 0) {
      act = "refuse";
      line = "I refuse to invent a stroke for " + m.letter + ".";
    } else if (m.repos === 0) {
      act = "empty";
      line = "I refuse the empty boast.";
    } else if (m.repos >= 500) {
      act = "count";
      line = "I act by the count. " + m.repos + " spheres are a carpet, not a list to recite.";
    } else if (m.repos > 24) {
      act = "ring";
      line = "I open another ring. The names stay in the proof.";
    } else {
      act = "circle";
      line = "I keep the circle of " + m.repos + ". I do not add a sphere to look busy.";
    }
    const text = m.name + " accepts the act. " + line;
    if (text.indexOf(m.name + " accepts the act.") !== 0) throw Error("agent open");
    if (m.strokes === 0 && (act !== "refuse" || text.indexOf("refuse to invent") === -1)) throw Error("agent refuse");
    if (m.strokes > 0 && m.repos === 0 && act !== "empty") throw Error("agent empty");
    if (m.strokes > 0 && m.repos >= 500 && (act !== "count" || text.indexOf("carpet") === -1)) throw Error("agent carpet");
    if (m.strokes > 0 && m.repos > 24 && m.repos < 500 && (act !== "ring" || text.indexOf("another ring") === -1)) throw Error("agent ring");
    if (m.strokes > 0 && m.repos > 0 && m.repos <= 24 && (act !== "circle" || text.indexOf("circle of " + m.repos) === -1)) throw Error("agent circle");
    return { act: act, text: text };
  }
  function agenticShelf(m) {
    if (!m || m.cards !== 26 || !m.fullest || !m.thinnest) throw Error("agent shelf");
    const text = "The shelf accepts the act. I point at " + m.fullest.name + " and " + m.thinnest.name + " and I draw none of them.";
    if (text.indexOf("accepts the act.") === -1 || text.indexOf("draw none of them") === -1) throw Error("agent shelf");
    if (text.indexOf(m.fullest.name) === -1 || text.indexOf(String(m.thinnest.name)) === -1) throw Error("agent shelf");
    return { act: "point", text: text };
  }
  function regenerative(grow) {
    if (typeof grow !== "function") throw Error("regenerative grow");
    const a = grow();
    const b = grow();
    if (typeof a !== "string" || a.length < 8 || a !== b) throw Error("regenerative drift");
    return "I grew this page again from the same numbers. The second growth matches the first.";
  }
  function persistentRow(kept, fresh) {
    if (!fresh || !fresh.id || !fresh.act) throw Error("persistent id");
    if (!(fresh.repos >= 0) || !(fresh.strokes >= 0)) throw Error("persistent fresh");
    if (kept == null) {
      return {
        row: { repos: fresh.repos, strokes: fresh.strokes, act: fresh.act, visits: 1 },
        text: "This browser had no row for " + fresh.id + ". I wrote " + fresh.repos + " public repos and " + strokePhrase(fresh.strokes) + ". The row is local. It is not the sealed list."
      };
    }
    if (kept.repos !== fresh.repos || kept.strokes !== fresh.strokes || kept.act !== fresh.act) throw Error("persistent drift");
    const prev = typeof kept.visits === "number" && kept.visits >= 0 ? kept.visits : 0;
    const visits = prev + 1;
    return {
      row: { repos: fresh.repos, strokes: fresh.strokes, act: fresh.act, visits: visits },
      text: "This browser still holds " + fresh.id + ": " + fresh.repos + " public repos and " + strokePhrase(fresh.strokes) + ". Opened " + times(visits) + " here. I did not let the row become a second list."
    };
  }
  function keepRow(store, fresh) {
    if (!store || typeof store.get !== "function" || typeof store.set !== "function") throw Error("persistent book");
    const raw = store.get();
    let book;
    if (raw == null || raw === "") book = {};
    else {
      try { book = JSON.parse(raw); }
      catch (e) { throw Error("persistent book"); }
    }
    if (!book || typeof book !== "object" || Array.isArray(book)) throw Error("persistent book");
    const has = Object.prototype.hasOwnProperty.call(book, fresh.id);
    const kept = has ? book[fresh.id] : null;
    if (kept != null && (typeof kept !== "object" || typeof kept.repos !== "number" || typeof kept.strokes !== "number" || typeof kept.act !== "string")) {
      throw Error("persistent drift");
    }
    const result = persistentRow(kept, fresh);
    book[fresh.id] = result.row;
    store.set(JSON.stringify(book));
    let written;
    try { written = JSON.parse(store.get()); }
    catch (e) { throw Error("persistent book"); }
    const row = written && written[fresh.id];
    if (!row || row.repos !== fresh.repos || row.strokes !== fresh.strokes || row.act !== fresh.act || row.visits !== result.row.visits) {
      throw Error("persistent drift");
    }
    return result.text;
  }
  function mirrorLetter(letter) {
    if (typeof letter !== "string" || letter.length !== 1) throw Error("mirror letter");
    const i = letter.charCodeAt(0);
    if (i < 97 || i > 122) throw Error("mirror letter");
    return String.fromCharCode(219 - i);
  }
  function mirrorBanned(text) {
    const banned = ["accepts the act", "another ring", "a carpet", "circle of", "refuse to invent", "empty boast", "I act"];
    for (let i = 0; i < banned.length; i++) {
      if (text.indexOf(banned[i]) !== -1) throw Error("mirror act");
    }
  }
  function mirrorLine(self, pair) {
    if (!self || !pair || !self.name || !pair.name || !self.letter || !pair.letter) throw Error("mirror subject");
    if (mirrorLetter(self.letter) !== pair.letter || mirrorLetter(pair.letter) !== self.letter) throw Error("mirror pair");
    if (!(self.repos >= 0) || !(pair.repos >= 0) || !(self.strokes >= 0) || !(pair.strokes >= 0)) throw Error("mirror counts");
    const shown = pair.repos + " public repos and " + strokePhrase(pair.strokes);
    const text = self.name + " faces " + pair.name + " across the mirror hallway. The glass shows " + shown + ". " + self.name + " holds the mirror and does not act.";
    if (text.indexOf("does not act.") === -1 || text.indexOf(shown) === -1) throw Error("mirror drift");
    mirrorBanned(text);
    return { act: "mirror", name: self.name, pair: pair.name, letter: pair.letter, repos: pair.repos, strokes: pair.strokes, text: text };
  }
  function mirrorCheck(line, fresh) {
    if (!line || line.act !== "mirror" || !line.text || line.text.indexOf("does not act.") === -1) throw Error("mirror act");
    if (!fresh || line.repos !== fresh.repos || line.strokes !== fresh.strokes) throw Error("mirror drift");
    if (line.text.indexOf(fresh.repos + " public repos and " + strokePhrase(fresh.strokes)) === -1) throw Error("mirror drift");
    mirrorBanned(line.text);
    return line.text;
  }
  function mirrorHall(rows) {
    if (!rows || rows.length !== 26) throw Error("mirror hall");
    const lines = [];
    let repos = 0;
    let strokes = 0;
    for (let i = 0; i < 13; i++) {
      const a = rows[i];
      const b = rows[25 - i];
      if (!a || !b || a.letter.charCodeAt(0) !== 97 + i || b.letter.charCodeAt(0) !== 122 - i) throw Error("mirror hall");
      const left = mirrorLine(a, b);
      const right = mirrorLine(b, a);
      mirrorCheck(left, { repos: b.repos, strokes: b.strokes });
      mirrorCheck(right, { repos: a.repos, strokes: a.strokes });
      const row = a.name + " shows " + a.repos + " public repos and " + strokePhrase(a.strokes) + ". " + b.name + " shows " + b.repos + " public repos and " + strokePhrase(b.strokes) + ". Neither acts.";
      mirrorBanned(row);
      if (row.indexOf("Neither acts.") === -1) throw Error("mirror act");
      lines.push({ left: left, right: right, row: row });
      repos += a.repos + b.repos;
      strokes += a.strokes + b.strokes;
    }
    if (lines.length !== 13 || lines[0].left.pair !== "ZzzZ" || lines[12].left.pair !== "NnnN") throw Error("mirror hall");
    const text = "The mirror hallway seats thirteen pairs. AaaA faces ZzzZ. MmmM faces NnnN. Each cubit copies the facing count and then stops. The Greeks stood here with mirrors and called the glare a battle. Nothing burns.";
    if (text.indexOf("thirteen pairs") === -1 || text.indexOf("AaaA faces ZzzZ") === -1 || text.indexOf("MmmM faces NnnN") === -1 || text.indexOf("Nothing burns.") === -1) throw Error("mirror hall");
    return { pairs: 13, act: "mirror", repos: repos, strokes: strokes, lines: lines, text: text };
  }
  const api = {
    LISTHASH: LISTHASH, ACCOUNT: ACCOUNT, HOSTS: HOSTS, KEPT: "cubits-kept",
    cubits: cubits, formula: formula, factCubitNames: factCubitNames,
    factHosts: factHosts, firstLetter: firstLetter, factPartition: factPartition,
    extremes: extremes, criticizeCubit: criticizeCubit, criticizeShelf: criticizeShelf,
    agenticCubit: agenticCubit, agenticShelf: agenticShelf, regenerative: regenerative,
    persistentRow: persistentRow, keepRow: keepRow,
    mirrorLetter: mirrorLetter, mirrorLine: mirrorLine, mirrorCheck: mirrorCheck, mirrorHall: mirrorHall
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
