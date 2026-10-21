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
  const api = {
    LISTHASH: LISTHASH, ACCOUNT: ACCOUNT, HOSTS: HOSTS,
    cubits: cubits, formula: formula, factCubitNames: factCubitNames,
    factHosts: factHosts, firstLetter: firstLetter, factPartition: factPartition
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
