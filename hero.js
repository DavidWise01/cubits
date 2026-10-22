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
  scene.fog = new THREE.Fog(0x14120e, rad * 0.4, rad * 4 + 10);
  const camera = new THREE.PerspectiveCamera(42, box.clientWidth / Math.max(1, box.clientHeight), 0.1, 800);
  camera.position.set(rad * 0.2, rad * 0.9 + 1.8, rad * 1.35 + 2.2);
  camera.lookAt(0, 0.35, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xfff4e0, 1.35);
  key.position.set(6, 10, 4);
  scene.add(key);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(rad + 3, 72),
    new THREE.MeshStandardMaterial({ color: 0x1c1914, roughness: 0.92 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const hue = (letter.charCodeAt(0) - 97) / 26;
  const color = new THREE.Color().setHSL(hue, 0.62, 0.62);
  let sphereCount = 0;
  if (n > 0) {
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.16, 16, 12),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.08 }),
      n
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const ring = Math.floor(i / 24);
      const idx = i % 24;
      const per = Math.min(24, n - ring * 24);
      const a = (idx / per) * Math.PI * 2 + ring * 0.2;
      const rr = 1.15 + ring * 0.7;
      dummy.position.set(Math.cos(a) * rr, 0.2, Math.sin(a) * rr);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
    sphereCount = mesh.count;
  } else {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.05, 12, 80),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.42, metalness: 0.18 })
    );
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
  }
  let cubeCount = 0;
  if (strokes > 0) {
    const cubeSize = Math.max(0.28, rad * 0.045);
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
      new THREE.MeshStandardMaterial({ color: 0xd8c48f, roughness: 0.32, metalness: 0.45 }),
      strokes
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < strokes; i++) {
      dummy.position.set((i - (strokes - 1) / 2) * cubeSize * 1.7, cubeSize * 0.5 + 0.15, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
    cubeCount = mesh.count;
  }
  if (sphereCount !== n) throw Error('spheres ' + sphereCount);
  if (cubeCount !== strokes) throw Error('cubes ' + cubeCount);
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
}
(async function () {
  try {
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
    hero(mine.length, strokes);
    const canvas = document.querySelector('#v3 canvas');
    if (!canvas || canvas.width < 1) throw Error('critic canvas');
    const note = criticizeCubit({
      name: NAME,
      letter: letter,
      repos: mine.length,
      strokes: strokes,
      hall: hallN,
      account: accountN,
      total: data.names.length,
      names: mine,
      still: reduceMotion()
    });
    const slot = document.getElementById('critique');
    if (!slot) throw Error('critic missing');
    slot.textContent = note;
    if (slot.textContent !== note) throw Error('critic drift');
    paint('LIT ' + NAME + ' holds ' + mine.length + ' public repos and ' + strokes + ' host strokes', false);
  } catch (e) {
    paint('FAIL ' + e.message, true);
    throw e;
  }
})();
