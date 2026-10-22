import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const body = document.body;
const NAME = body.dataset.name;
const SLUG = body.dataset.slug;
const BLURB = body.dataset.blurb;
const SEAL = body.dataset.seal;

function paint(msg, fail) {
  const p = document.getElementById('proof');
  p.textContent = msg;
  p.className = fail ? 'fail' : '';
}
async function sha(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
}
function letterTex(name, hue) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  const ink = new THREE.Color().setHSL(hue, 0.7, 0.62);
  g.fillStyle = '#05070d';
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = '#' + ink.getHexString();
  g.lineWidth = 8;
  g.strokeRect(8, 8, 240, 112);
  g.fillStyle = '#eaf6ff';
  g.font = '600 40px ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(name, 128, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function centerTex() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const g = canvas.getContext('2d');
  g.fillStyle = '#070b12';
  g.fillRect(0, 0, 512, 320);
  const left = g.createLinearGradient(0, 0, 220, 0);
  left.addColorStop(0, 'rgba(255,43,214,0.55)');
  left.addColorStop(1, 'rgba(255,43,214,0)');
  g.fillStyle = left;
  g.fillRect(0, 0, 256, 320);
  const right = g.createLinearGradient(512, 0, 292, 0);
  right.addColorStop(0, 'rgba(0,240,255,0.5)');
  right.addColorStop(1, 'rgba(0,240,255,0)');
  g.fillStyle = right;
  g.fillRect(256, 0, 256, 320);
  g.fillStyle = 'rgba(234,246,255,0.85)';
  g.fillRect(252, 24, 8, 272);
  g.font = '600 42px ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffb3ec';
  g.fillText('ZzzZ', 128, 160);
  g.fillStyle = '#d7fff8';
  g.fillText('AaaA', 384, 160);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function hallway(box) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(box.clientWidth, box.clientHeight);
  box.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070d);
  scene.fog = new THREE.Fog(0x05070d, 8, 22);
  const camera = new THREE.PerspectiveCamera(42, box.clientWidth / Math.max(1, box.clientHeight), 0.1, 80);
  camera.position.set(0, 1.7, 7.2);
  camera.lookAt(0, 1.15, -2);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xfff4e0, 1.05);
  key.position.set(4, 8, 6);
  scene.add(key);
  const pink = new THREE.PointLight(0xff2bd6, 8, 24);
  pink.position.set(-2.4, 1.6, 2);
  scene.add(pink);
  const cyan = new THREE.PointLight(0x00f0ff, 7, 24);
  cyan.position.set(2.4, 1.4, 1);
  scene.add(cyan);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 18),
    new THREE.MeshStandardMaterial({ color: 0x10141c, roughness: 0.9, metalness: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const faces = [];
  const hit = [];
  cubits().forEach(function (cubit, index) {
    const side = index < 13 ? 0 : 1;
    const slot = side === 0 ? index : 25 - index;
    const x = side === 0 ? -1.62 : 1.62;
    const z = 6 - slot;
    const hue = (cubit.letter.charCodeAt(0) - 97) / 26;
    const color = new THREE.Color().setHSL(hue, 0.55, 0.42);
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.42, 0.78),
      new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.22, metalness: 0.72, roughness: 0.18 })
    );
    slab.position.set(x, 0.84, z);
    slab.userData.slug = cubit.slug;
    scene.add(slab);
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.36),
      new THREE.MeshBasicMaterial({ map: letterTex(cubit.name, hue) })
    );
    plate.position.set(x + (x < 0 ? 0.08 : -0.08), 0.95, z);
    plate.lookAt(0, 0.95, z);
    plate.userData.slug = cubit.slug;
    scene.add(plate);
    faces.push(plate);
    hit.push(slab, plate);
  });
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 2.55),
    new THREE.MeshBasicMaterial({ color: 0xff2bd6 })
  );
  frame.position.set(0, 1.2, -6.52);
  frame.material.fog = false;
  scene.add(frame);
  const center = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.25),
    new THREE.MeshBasicMaterial({ map: centerTex() })
  );
  center.position.set(0, 1.2, -6.4);
  center.material.fog = false;
  scene.add(center);
  scene.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  const view = new THREE.Vector3();
  camera.getWorldDirection(view);
  if (view.z >= -0.5) throw Error('mirror facing');
  const q = new THREE.Quaternion();
  const n = new THREE.Vector3();
  faces.forEach(function (plate) {
    plate.getWorldQuaternion(q);
    n.set(0, 0, 1).applyQuaternion(q);
    const toward = new THREE.Vector3(-plate.position.x, 0, 0).normalize();
    if (n.dot(toward) < 0.9) throw Error('mirror facing');
  });
  floor.getWorldQuaternion(q);
  n.set(0, 0, 1).applyQuaternion(q);
  if (n.y < 0.9) throw Error('mirror facing');
  center.getWorldQuaternion(q);
  n.set(0, 0, 1).applyQuaternion(q);
  if (n.z < 0.9) throw Error('mirror facing');
  if (faces.length !== 26) throw Error('mirror hall');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.15, -1);
  controls.autoRotate = false;
  controls.enableDamping = true;
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  renderer.domElement.addEventListener('click', function (ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(hit, false);
    if (hits[0] && hits[0].object.userData.slug) location.href = hits[0].object.userData.slug + '.html';
  });
  addEventListener('resize', function () {
    const w = box.clientWidth;
    const h = Math.max(1, box.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
  });
  (function frame() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  })();
  return { panes: faces.length };
}
function paintSlot(id, text) {
  const el = document.getElementById(id);
  if (!el) throw Error(id + ' missing');
  el.textContent = text;
  if (el.textContent !== text) throw Error(id + ' drift');
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
    const rows = cubits().map(function (c) {
      return {
        name: c.name,
        letter: c.letter,
        repos: buckets[c.letter].length,
        strokes: (hosts.hall[c.letter] || 0) + (hosts.account[c.letter] || 0)
      };
    });
    const hall = mirrorHall(rows);
    let expectRepos = 0;
    let expectStrokes = 0;
    rows.forEach(function (row) {
      expectRepos += row.repos;
      expectStrokes += row.strokes;
    });
    if (hall.repos !== expectRepos || hall.repos !== data.names.length || hall.strokes !== expectStrokes) throw Error('mirror drift');
    if (hall.act !== 'mirror') throw Error('mirror act');
    paintSlot('mirror', hall.text);
    const ul = document.getElementById('pairs');
    if (!ul) throw Error('mirror hall');
    ul.innerHTML = hall.lines.map(function (p) {
      const left = cubits().find(function (c) { return c.name === p.left.name; });
      const right = cubits().find(function (c) { return c.name === p.right.name; });
      if (!left || !right) throw Error('mirror pair');
      const row = p.row
        .replace(left.name, '<a href="' + left.slug + '.html">' + left.name + '</a>')
        .replace(right.name, '<a href="' + right.slug + '.html">' + right.name + '</a>');
      return '<li>' + row + '</li>';
    }).join('');
    const shown = [...ul.querySelectorAll('li')].map(function (li) { return li.textContent; });
    if (shown.length !== 13) throw Error('mirror hall');
    shown.forEach(function (t, i) {
      if (t !== hall.lines[i].row) throw Error('mirror drift');
    });
    const picture = hallway(document.getElementById('v3'));
    if (picture.panes !== 26) throw Error('mirror hall');
    const canvas = document.querySelector('#v3 canvas');
    if (!canvas || canvas.width < 1) throw Error('mirror facing');
    paintSlot('regenerative', regenerative(function () { return hall.text; }));
    paintSlot('persistent', keepRow({
      get: function () { return localStorage.getItem(KEPT); },
      set: function (v) {
        try { localStorage.setItem(KEPT, v); }
        catch (e) { throw Error('persistent book'); }
      }
    }, { id: 'mirror', repos: hall.repos, strokes: hall.strokes, act: 'mirror' }));
    const regen = document.getElementById('regen');
    if (!regen) throw Error('regen missing');
    regen.addEventListener('click', function () {
      try {
        const again = mirrorHall(rows);
        if (again.text !== hall.text || again.pairs !== 13) throw Error('regenerative drift');
        if (picture.panes !== 26) throw Error('regenerative drift');
        const next = [...document.querySelectorAll('#pairs li')].map(function (li) { return li.textContent; });
        if (next.length !== 13) throw Error('regenerative drift');
        next.forEach(function (t, i) {
          if (t !== again.lines[i].row) throw Error('regenerative drift');
        });
        paintSlot('regenerative', regenerative(function () { return again.text; }));
      } catch (err) {
        paint('FAIL ' + err.message, true);
        throw err;
      }
    });
    paint('LIT 13 pairs hold ' + hall.repos + ' public repos and ' + hall.strokes + ' host strokes and do not act', false);
  } catch (e) {
    paint('FAIL ' + e.message, true);
    throw e;
  }
})();
