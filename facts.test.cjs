const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const f = require('./facts.js');
const data = require('./repos.json');
function sha(t){ return crypto.createHash('sha256').update(t).digest('hex'); }
if (data.account !== 'DavidWise01') throw Error('account');
if (data.taken !== '2026-10-21') throw Error('taken');
if (data.names.length !== 2142) throw Error('count ' + data.names.length);
if (sha(data.names.join('\n')) !== f.LISTHASH) throw Error('hash');
const sorted = data.names.slice().sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : (a < b ? -1 : a > b ? 1 : 0));
if (sorted.join('\n') !== data.names.join('\n')) throw Error('sort');
f.factCubitNames();
if (f.formula() !== "{{ AaaA, BbbB, CccC, DddD, EeeE, FffF, GggG, HhhH, IiiI, JjjJ, KkkK, LllL, MmmM, NnnN, OooO, PppP, QqqQ, RrrR, SssS, TttT, UuuU, VvvV, WwwW, XxxX, YyyY, ZzzZ }}") throw Error('formula');
const hosts = f.factHosts();
const buckets = f.factPartition(data.names);
const expect = { '0root': 'r', oasis: 'o', mayhem: 'm', 'sapph-i-on': 's', ud0: 'u', 'DavidWise01.github.io': 'd', '1-bit-engine-v1': 'b' };
for (const name of Object.keys(expect)) {
  if (f.firstLetter(name) !== expect[name]) throw Error('letter ' + name);
  if (!buckets[expect[name]].includes(name)) throw Error('missing ' + name);
}
let repos = 0, strokes = 0;
for (const c of f.cubits()) {
  repos += buckets[c.letter].length;
  strokes += (hosts.hall[c.letter] || 0) + (hosts.account[c.letter] || 0);
  const html = fs.readFileSync(path.join(__dirname, c.slug + '.html'));
  if (html.includes(13)) throw Error('cr ' + c.slug);
  const text = html.toString('utf8');
  const blurb = 'Cubit ' + c.letter.toUpperCase() + ' holds the letter ' + c.letter + ' from 0root.ai and from davidwise01.';
  const want = sha(c.name + '|' + c.slug + '|' + blurb);
  const dlw = JSON.parse(fs.readFileSync(path.join(__dirname, 'seals', c.slug + '.dlw'), 'utf8'));
  if (dlw.seal !== want || !text.includes(want)) throw Error('seal ' + c.slug);
}
if (repos !== 2142) throw Error('repos ' + repos);
if (strokes !== 15) throw Error('strokes ' + strokes);
const index = fs.readFileSync(path.join(__dirname, 'index.html'));
if (index.includes(13)) throw Error('cr index');
const indexText = index.toString('utf8');
if (!indexText.includes(f.formula())) throw Error('index formula');
if ((indexText.match(/class="card"/g) || []).length !== 26) throw Error('cards');
const indexSeal = sha('The Twenty-Six Cubits|cubits|Twenty-six cubits, AaaA through ZzzZ, hold 0root.ai and davidwise01.');
if (!indexText.includes(indexSeal)) throw Error('index seal');
const ends = f.extremes(buckets);
if (ends.fullest.name !== 'TttT' || ends.fullest.repos !== 1113) throw Error('fullest ' + ends.fullest.name + ' ' + ends.fullest.repos);
const shelf = f.criticizeShelf({ cards: 26, repos: 2142, strokes: 15, fullest: ends.fullest, thinnest: ends.thinnest, taken: '2026-10-21' });
if (!shelf.includes('drew none of them') || !shelf.includes('TttT with 1113')) throw Error('shelf voice');
let threw = false;
try { f.criticizeCubit({ name: 'AaaA', letter: 'a', repos: 1, strokes: 0, hall: 0, account: 0, total: 2142, names: ['nope', 'extra'] }); }
catch (e) { threw = e.message === 'critic names'; }
if (!threw) throw Error('soft path');
for (const c of f.cubits()) {
  const mine = buckets[c.letter];
  const hallN = hosts.hall[c.letter] || 0;
  const accountN = hosts.account[c.letter] || 0;
  const voice = f.criticizeCubit({
    name: c.name, letter: c.letter, repos: mine.length, strokes: hallN + accountN,
    hall: hallN, account: accountN, total: 2142, names: mine, still: false
  });
  if (voice.indexOf(c.name + ' read its own page.') !== 0) throw Error('voice ' + c.name);
  const html = fs.readFileSync(path.join(__dirname, c.slug + '.html'), 'utf8');
  if (!html.includes('id="critique"') || !html.includes('>analytical<')) throw Error('panel ' + c.slug);
  if (html.includes('\r')) throw Error('cr voice ' + c.slug);
  const neonAt = html.indexOf('class="panel neon"');
  const v3At = html.indexOf('id="v3"');
  const headAt = html.indexOf('<h2>analytical</h2>');
  if (!(neonAt >= 0 && neonAt < v3At && v3At < headAt)) throw Error('shell ' + c.slug);
  if (!html.includes('{{ act || react || change }}')) throw Error('neon tag ' + c.slug);
  if (!html.includes('id="agentic"') || !html.includes('id="regenerative"') || !html.includes('id="persistent"') || !html.includes('id="regen"')) throw Error('life ' + c.slug);
  if (!html.includes('agentic · regenerative · persistent')) throw Error('life line ' + c.slug);
  const strokesN = (hosts.hall[c.letter] || 0) + (hosts.account[c.letter] || 0);
  const ag = f.agenticCubit({ name: c.name, letter: c.letter, repos: mine.length, strokes: strokesN });
  if (ag.text.indexOf(c.name + ' accepts the act.') !== 0) throw Error('agent ' + c.name);
  if (strokesN === 0 && ag.act !== 'refuse') throw Error('act ' + c.name);
  else if (strokesN > 0 && mine.length >= 500 && ag.act !== 'count') throw Error('act ' + c.name);
  else if (strokesN > 0 && mine.length > 24 && mine.length < 500 && ag.act !== 'ring') throw Error('act ' + c.name);
  else if (strokesN > 0 && mine.length > 0 && mine.length <= 24 && ag.act !== 'circle') throw Error('act ' + c.name);
  const grown = f.regenerative(function () { return ag.text; });
  if (grown.indexOf('second growth matches') === -1) throw Error('regen ' + c.name);
  const fresh = { id: c.name, repos: mine.length, strokes: strokesN, act: ag.act };
  let mem = null;
  const store = { get: function () { return mem; }, set: function (v) { mem = v; } };
  const first = f.keepRow(store, fresh);
  if (first.indexOf('had no row') === -1) throw Error('keep ' + c.name);
  const second = f.keepRow(store, fresh);
  if (second.indexOf('still holds') === -1 || second.indexOf('Opened 2 times') === -1) throw Error('kept ' + c.name);
  let drifted = false;
  try { f.keepRow({ get: function () { return JSON.stringify({ [c.name]: { repos: mine.length + 1, strokes: strokesN, act: ag.act, visits: 1 } }); }, set: function () { throw Error('wrote drift'); } }, fresh); }
  catch (e) { drifted = e.message === 'persistent drift'; }
  if (!drifted) throw Error('drift ' + c.name);
}
if (!indexText.includes('id="critique"')) throw Error('index critic');
if (!indexText.includes('<h2>analytical</h2>')) throw Error('index analytical');
const iNeon = indexText.indexOf('class="panel neon"');
const iFormula = indexText.indexOf('id="formula"');
const iHead = indexText.indexOf('<h2>analytical</h2>');
const iProof = indexText.indexOf('id="proof"');
if (!(iNeon >= 0 && iNeon < iFormula && iFormula < iHead && iHead < iProof)) throw Error('index shell');
if (!indexText.includes('{{ act || react || change }}')) throw Error('index neon');
if (!indexText.includes('id="agentic"') || !indexText.includes('id="regen"') || !indexText.includes('agentic · regenerative · persistent')) throw Error('index life');
const shelfAct = f.agenticShelf({ cards: 26, fullest: ends.fullest, thinnest: ends.thinnest });
if (shelfAct.act !== 'point' || shelfAct.text.indexOf('TttT') === -1 || shelfAct.text.indexOf('draw none of them') === -1) throw Error('shelf act');
let flipped = 0;
let regenThrew = false;
try { f.regenerative(function () { return 'grow-' + (flipped++); }); }
catch (e) { regenThrew = e.message === 'regenerative drift'; }
if (!regenThrew) throw Error('regen soft');
let bookThrew = false;
try { f.keepRow({ get: function () { return '{'; }, set: function () {} }, { id: 'AaaA', repos: 1, strokes: 0, act: 'refuse' }); }
catch (e) { bookThrew = e.message === 'persistent book'; }
if (!bookThrew) throw Error('book soft');
const still = f.criticizeCubit({
  name: 'XxxX', letter: 'x', repos: buckets.x.length, strokes: 0, hall: 0, account: 0,
  total: 2142, names: buckets.x, still: true
});
if (!still.includes('sits still') || !still.includes('do not use')) throw Error('still voice');
const facts = fs.readFileSync(path.join(__dirname, 'facts.js'));
const hero = fs.readFileSync(path.join(__dirname, 'hero.js'));
if (facts.includes(13) || hero.includes(13)) throw Error('cr js');
console.log('CUBITS PASS', repos, 'repos', strokes, 'strokes', ends.thinnest.name, ends.thinnest.repos, f.LISTHASH);
