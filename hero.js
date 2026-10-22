import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const body = document.body;
const letter = body.dataset.letter;
const NAME = body.dataset.name;
const SLUG = body.dataset.slug;
const BLURB = body.dataset.blurb;
const SEAL = body.dataset.seal;

function reduceMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function paint(msg, fail) {
  const p = document.getElementById('proof');
  p.textContent = msg;
  p.className = fail ? 'fail' : '';
}
async function sha(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
}
function hero(n, strokes) {
  const reduce = reduceMotion();
  const box = document.getElementById('v3');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(box.clientWidth, box.clientHeight);
  box.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const rings = Math.max(1, Math.ceil(n / 24));
  const rad = n === 0 ? 1.8 : 1.15 + (rings - 1) * 0.7;
  scene.background = new THREE.Color(0x05070d);
  scene.fog = new THREE.Fog(0x05070d, rad * 0.55, rad * 4.2 + 8);
  const camera = new THREE.PerspectiveCamera(42, box.clientWidth / Math.max(1, box.clientHeight), 0.1, 800);
  camera.position.set(rad * 0.2, rad * 0.9 + 1.8, rad * 1.35 + 2.2);
  camera.lookAt(0, 0.35, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xfff4e0, 1.15);
  key.position.set(6, 10, 4);
  scene.add(key);
  const reach = rad * 5 + 8;
  const pink = new THREE.PointLight(0xff2bd6, 6 + rad * 0.25, reach);
  pink.position.set(-rad, rad * 0.55, rad * 0.35);
  scene.add(pink);
  const cyan = new THREE.PointLight(0x00f0ff, 5 + rad * 0.2, reach);
  cyan.position.set(rad * 0.85, rad * 0.4, rad);
  scene.add(cyan);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(rad + 3, 72),
    new THREE.MeshStandardMaterial({ color: 0x10141c, roughness: 0.88, metalness: 0.12 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const hue = (letter.charCodeAt(0) - 97) / 26;
  const color = new THREE.Color().setHSL(hue, 0.62, 0.62);
  const planted = [];
  function drop(obj) {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  }
  function grow(count, cubeN) {
    planted.forEach(drop);
    planted.length = 0;
    let sphereCount = 0;
    if (count > 0) {
      const mesh = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.16, 16, 12),
        new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.08 }),
        count
      );
      const dummy = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const ring = Math.floor(i / 24);
        const idx = i % 24;
        const per = Math.min(24, count - ring * 24);
        const a = (idx / per) * Math.PI * 2 + ring * 0.2;
        const rr = 1.15 + ring * 0.7;
        dummy.position.set(Math.cos(a) * rr, 0.2, Math.sin(a) * rr);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      planted.push(mesh);
      sphereCount = mesh.count;
    } else {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.05, 12, 80),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.42, metalness: 0.18 })
      );
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      planted.push(ring);
    }
    let cubeCount = 0;
    if (cubeN > 0) {
      const cubeSize = Math.max(0.28, rad * 0.045);
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
        new THREE.MeshStandardMaterial({ color: 0xd8c48f, emissive: 0x8a6a2a, emissiveIntensity: 0.25, roughness: 0.32, metalness: 0.45 }),
        cubeN
      );
      const dummy = new THREE.Object3D();
      for (let i = 0; i < cubeN; i++) {
        dummy.position.set((i - (cubeN - 1) / 2) * cubeSize * 1.7, cubeSize * 0.5 + 0.15, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      planted.push(mesh);
      cubeCount = mesh.count;
    }
    if (sphereCount !== count) throw Error('spheres ' + sphereCount);
    if (cubeCount !== cubeN) throw Error('cubes ' + cubeCount);
    return { sphereCount: sphereCount, cubeCount: cubeCount };
  }
  const first = grow(n, strokes);
  const second = grow(n, strokes);
  if (first.sphereCount !== second.sphereCount || first.cubeCount !== second.cubeCount) throw Error('regenerative drift');
  if (second.sphereCount !== n || second.cubeCount !== strokes) throw Error('regenerative drift');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.35, 0);
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.45;
  controls.enableDamping = true;
  (function frame() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  })();
  return { grow: grow };
}
function paintSlot(id, text) {
  const el = document.getElementById(id);
  if (!el) throw Error(id + ' missing');
  el.textContent = text;
  if (el.textContent !== text) throw Error(id + ' drift');
}
function browserStore() {
  return {
    get: function () { return localStorage.getItem(KEPT); },
    set: function (v) {
      try { localStorage.setItem(KEPT, v); }
      catch (e) { throw Error('persistent book'); }
    }
  };
}
(async function () {
  try {
    const neonBox = document.querySelector('.panel.neon #v3');
    const head = document.querySelector('.panel:not(.neon) > h2');
    if (!neonBox) throw Error('neon panel');
    if (!head || head.textContent !== 'analytical') throw Error('analytical panel');
    if (await sha(NAME + '|' + SLUG + '|' + BLURB) !== SEAL) throw Error('seal mismatch');
    const res = await fetch('repos.json');
    if (!res.ok) throw Error('list ' + res.status);
    const data = await res.json();
    if (data.account !== ACCOUNT) throw Error('account');
    if (await sha(data.names.join('\n')) !== LISTHASH) throw Error('list hash');
    const buckets = factPartition(data.names);
    const hosts = factHosts();
    const mine = buckets[letter];
    if (!mine) throw Error('letter ' + letter);
    const hallN = hosts.hall[letter] || 0;
    const accountN = hosts.account[letter] || 0;
    const strokes = hallN + accountN;
    const list = document.getElementById('list');
    list.innerHTML = mine.map(function (n) {
      return '<li><a href="https://github.com/DavidWise01/' + encodeURIComponent(n) + '">' + n + '</a></li>';
    }).join('');
    const shown = [...list.querySelectorAll('a')].map(function (a) { return a.textContent; });
    if (shown.join('\n') !== mine.join('\n')) throw Error('render');
    document.getElementById('strokes').textContent = hallN + ' in 0root.ai, ' + accountN + ' in davidwise01';
    const picture = hero(mine.length, strokes);
    const canvas = document.querySelector('#v3 canvas');
    if (!canvas || canvas.width < 1) throw Error('critic canvas');
    const measure = {
      name: NAME,
      letter: letter,
      repos: mine.length,
      strokes: strokes,
      hall: hallN,
      account: accountN,
      total: data.names.length,
      names: mine,
      still: reduceMotion()
    };
    const note = criticizeCubit(measure);
    const slot = document.getElementById('critique');
    if (!slot) throw Error('critic missing');
    slot.textContent = note;
    if (slot.textContent !== note) throw Error('critic drift');
    const act = agenticCubit(measure);
    paintSlot('agentic', act.text);
    paintSlot('regenerative', regenerative(function () { return note + '\n' + act.text; }));
    paintSlot('persistent', keepRow(browserStore(), { id: NAME, repos: mine.length, strokes: strokes, act: act.act }));
    const pairLetter = mirrorLetter(letter);
    const pairCubit = cubits().find(function (c) { return c.letter === pairLetter; });
    if (!pairCubit) throw Error('mirror pair');
    const pairRepos = buckets[pairCubit.letter].length;
    const pairStrokes = (hosts.hall[pairCubit.letter] || 0) + (hosts.account[pairCubit.letter] || 0);
    const mirror = mirrorLine(
      { name: NAME, letter: letter, repos: mine.length, strokes: strokes },
      { name: pairCubit.name, letter: pairCubit.letter, repos: pairRepos, strokes: pairStrokes }
    );
    paintSlot('mirror', mirror.text);
    mirrorCheck(mirror, { repos: pairRepos, strokes: pairStrokes });
    const mirrorLink = document.querySelector('#life a[href="' + pairCubit.slug + '.html"]');
    if (!mirrorLink || mirrorLink.textContent !== pairCubit.name) throw Error('mirror pair');
    const regen = document.getElementById('regen');
    if (!regen) throw Error('regen missing');
    regen.addEventListener('click', function () {
      try {
        const again = picture.grow(mine.length, strokes);
        if (again.sphereCount !== mine.length || again.cubeCount !== strokes) throw Error('regenerative drift');
        const note2 = criticizeCubit(measure);
        const act2 = agenticCubit(measure);
        if (document.getElementById('critique').textContent !== note2) throw Error('regenerative drift');
        if (document.getElementById('agentic').textContent !== act2.text) throw Error('regenerative drift');
        const mirror2 = mirrorLine(
          { name: NAME, letter: letter, repos: mine.length, strokes: strokes },
          { name: pairCubit.name, letter: pairCubit.letter, repos: pairRepos, strokes: pairStrokes }
        );
        if (document.getElementById('mirror').textContent !== mirror2.text) throw Error('regenerative drift');
        const next = document.querySelector('#v3 canvas');
        if (!next || next.width < 1) throw Error('regenerative drift');
        paintSlot('regenerative', regenerative(function () { return note2 + '\n' + act2.text; }));
      } catch (err) {
        paint('FAIL ' + err.message, true);
        throw err;
      }
    });
    paint('LIT ' + NAME + ' holds ' + mine.length + ' public repos and ' + strokes + ' host strokes', false);
  } catch (e) {
    paint('FAIL ' + e.message, true);
    throw e;
  }
})();
