import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { Input } from './Input.js';
import { createWorld } from '../world/createWorld.js';
import { Player } from '../player/Player.js';

export class Game {
  constructor(container) {
    this.container = container;
  }
  async init() {
    await RAPIER.init();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa6d7dc);
    this.scene.fog = new THREE.Fog(0xc0d9d4, 100, 240);
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 350);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
    this.physics = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    createWorld(this.scene, this.physics, RAPIER);
    this.player = new Player(this.scene, this.physics, RAPIER);
    this.input = new Input(this.renderer.domElement);
    this.camera.position.set(0, 4.5, 15);
    this.clock = new THREE.Clock();
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  start() {
    this.renderer.setAnimationLoop(() => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.player.update(dt, this.input);
      this.physics.timestep = dt || 1 / 60;
      this.physics.step();
      this.player.sync();
      const target = this.player.position.clone().add(new THREE.Vector3(0, 1.35, 0));
      const distance = 6.5;
      const horizontal = Math.cos(this.input.pitch) * distance;
      const desired = target.clone().add(new THREE.Vector3(
        Math.sin(this.input.yaw) * horizontal,
        Math.sin(this.input.pitch) * distance + 0.7,
        Math.cos(this.input.yaw) * horizontal,
      ));
      this.camera.position.lerp(desired, 1 - Math.exp(-5 * dt));
      this.camera.lookAt(target);
      this.renderer.render(this.scene, this.camera);
    });
  }
}
