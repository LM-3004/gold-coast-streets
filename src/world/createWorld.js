import * as THREE from 'three';

export function createWorld(scene, physics, RAPIER) {
  const material = (color, roughness = 1, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const materials = {
    grass: material(0x819b72), road: material(0x505c5b), path: material(0xc8c8b7),
    sand: material(0xdfcea4), water: material(0x4caeb5, 0.45, 0.05), white: material(0xece9d9),
    line: material(0xe9e0c3), dark: material(0x344c49), glass: material(0x7ba9a4, 0.35, 0.1),
    trunk: material(0x8c8062), leaf: material(0x547d57), leafLight: material(0x789962),
  };
  const box = (x, y, z, w, h, d, mat, shadows = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = shadows;
    scene.add(mesh);
    return mesh;
  };
  const collider = (x, y, z, w, h, d) => {
    physics.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z));
  };

  scene.add(new THREE.HemisphereLight(0xe6f7f6, 0x9a9471, 2.1));
  const sun = new THREE.DirectionalLight(0xffe6bc, 3.2);
  sun.position.set(-45, 85, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 1, far: 220 });
  sun.shadow.bias = -0.0002;
  sun.target.position.set(0, 0, -30);
  scene.add(sun, sun.target);

  // A single flat physics surface keeps the decorative road and paving easy to traverse.
  box(0, -0.25, 0, 180, 0.5, 260, materials.grass, false);
  collider(0, -0.25, 0, 180, 0.5, 260);
  box(0, 0.015, 0, 20, 0.03, 260, materials.road, false);
  box(-12, 0.035, 0, 4, 0.07, 260, materials.path, false);
  box(12, 0.035, 0, 4, 0.07, 260, materials.path, false);
  box(58, 0.01, 0, 26, 0.02, 260, materials.sand, false);
  box(112, -0.04, 0, 82, 0.08, 260, materials.water, false);
  box(72, 0.015, 0, 2, 0.03, 260, material(0xc6e1d3), false);
  // World edges prevent walking beyond the prototype's supported ground.
  collider(-90, 3, 0, 1, 6, 260);
  collider(89, 3, 0, 1, 6, 260);
  collider(0, 3, -129, 180, 6, 1);
  collider(0, 3, 129, 180, 6, 1);
  for (let z = -125; z < 130; z += 12) {
    box(0, 0.035, z, 0.16, 0.02, 5, materials.line, false);
  }
  for (const x of [-9.2, 9.2]) box(x, 0.035, 0, 0.12, 0.02, 260, materials.line, false);
  // A side street and crossing give the small district a sense of connection.
  box(0, 0.04, -44, 90, 0.04, 12, materials.road, false);
  for (let x = -8; x <= 8; x += 2) box(x, 0.065, -36.8, 1, 0.025, 3, materials.white, false);
  for (let x = -8; x <= 8; x += 2) box(x, 0.065, -51.2, 1, 0.025, 3, materials.white, false);

  const building = (x, z, w, d, h, color, accent) => {
    const wall = material(color);
    const trim = material(accent);
    box(x, h / 2, z, w, h, d, wall);
    collider(x, h / 2, z, w, h, d);
    box(x, h + 0.15, z, w + 0.5, 0.3, d + 0.5, trim);
    // Balconies and windows face the street.
    const face = x < 0 ? x + w / 2 : x - w / 2;
    const side = x < 0 ? 1 : -1;
    for (let y = 3; y < h - 1; y += 3.2) {
      box(face + side * 0.03, y, z, 0.08, 1.65, d * 0.7, materials.glass, false);
      box(face + side * 0.5, y - 1, z, 1, 0.16, d * 0.8, trim);
      box(face + side * 0.92, y - 0.55, z, 0.06, 0.75, d * 0.8, materials.glass, false);
    }
    box(face + side * 0.06, 1.2, z, 0.12, 2.4, Math.min(3, d * 0.4), materials.dark, false);
    box(face + side * 0.8, 2.6, z, 1.6, 0.15, Math.min(5, d * 0.7), trim);
  };
  building(-25, -5, 15, 17, 18, 0xe7e2d3, 0xd4c0a3);
  building(-28, -27, 19, 16, 31, 0xd7d9ca, 0xb9c8c0);
  building(-27, -69, 17, 20, 38, 0xe4dfcf, 0xc5c2ae);
  building(-26, -98, 16, 20, 25, 0xe5d7c3, 0xe9e7da);
  building(-26, 24, 16, 19, 26, 0xd3ddd4, 0xb6c4b8);
  building(-28, 54, 18, 20, 34, 0xe9e5d8, 0xd1c4ad);
  building(25, -10, 14, 18, 15, 0xeee4d0, 0xd3b69a);
  building(26, -72, 16, 19, 24, 0xe4e4d7, 0xc8d4c7);
  building(25, 30, 14, 18, 19, 0xd9e1d5, 0xece5d2);
  building(26, 65, 16, 20, 30, 0xe6dfce, 0xc6c0aa);

  const poleMat = material(0x596460, 0.7, 0.3);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xffe7ac, emissive: 0xd5a657, emissiveIntensity: 0.3 });
  const streetlight = (x, z, side) => {
    box(x, 3.3, z, 0.16, 6.6, 0.16, poleMat);
    box(x - side * 0.75, 6.55, z, 1.6, 0.12, 0.12, poleMat);
    box(x - side * 1.45, 6.46, z, 0.5, 0.12, 0.35, lampMat);
    collider(x, 3, z, 0.35, 6, 0.35);
  };
  for (let z = -110; z <= 110; z += 24) {
    streetlight(-13.4, z, -1);
    streetlight(13.4, z + 12, 1);
  }

  const palm = (x, z, height, scale = 1) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, height, 7), materials.trunk);
    trunk.position.set(x, height / 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    collider(x, height / 2, z, 0.5 * scale, height, 0.5 * scale);
    const crown = new THREE.Group();
    crown.position.set(x, height, z);
    scene.add(crown);
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.65 * scale, 4.5 * scale, 5), i % 2 ? materials.leaf : materials.leafLight);
      leaf.position.set(0, 0, -1.7 * scale);
      leaf.rotation.x = -Math.PI / 2.8;
      const branch = new THREE.Group();
      branch.rotation.y = i * Math.PI * 2 / 9;
      branch.add(leaf);
      crown.add(branch);
      leaf.castShadow = true;
    }
  };
  for (let z = -115; z <= 115; z += 18) {
    if (z < -54 || z > -32) {
      palm(16.5, z, 7 + (Math.abs(z) % 3), 0.9);
      palm(-16.5, z + 5, 7.5, 0.85);
    }
    palm(43, z + 7, 8 + (Math.abs(z) % 2), 1.1);
  }
  // Low planters and benches add detail at pedestrian scale.
  for (let z = -105; z <= 105; z += 30) {
    if (z > -55 && z < -33) continue;
    box(18.5, 0.35, z, 1.8, 0.7, 3.2, materials.path);
    box(18.5, 0.78, z, 1.5, 0.25, 2.9, materials.leaf);
    collider(18.5, 0.4, z, 1.8, 0.8, 3.2);
    box(38, 0.5, z + 8, 0.8, 0.12, 2.4, material(0x9b7756));
    box(38.35, 0.85, z + 8, 0.1, 0.7, 2.4, material(0x9b7756));
  }
}
