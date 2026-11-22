import * as THREE from 'three';

export class Player {
  constructor(scene, world, RAPIER) {
    this.world = world;
    this.position = new THREE.Vector3(0, 0, 8);
    this.body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 1, 8));
    this.collider = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.4), this.body);
    this.controller = world.createCharacterController(0.03);
    this.controller.enableSnapToGround(0.2);
    this.controller.setApplyImpulsesToDynamicBodies(true);
    this.verticalVelocity = 0;
    this.group = new THREE.Group();
    scene.add(this.group);
    const skin = new THREE.MeshStandardMaterial({ color: 0xc98e6d, roughness: 0.9 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0xe9e5d6, roughness: 0.95 });
    const shorts = new THREE.MeshStandardMaterial({ color: 0x304c54, roughness: 0.95 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x302a26, roughness: 1 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0xe8e5db, roughness: 1 });
    const part = (geometry, material, x, y, z, parent = this.group) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };
    part(new THREE.CapsuleGeometry(0.31, 0.48, 4, 8), shirt, 0, 1.32, 0);
    part(new THREE.SphereGeometry(0.23, 12, 8), skin, 0, 1.94, 0);
    part(new THREE.SphereGeometry(0.235, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), hair, 0, 1.96, 0);
    this.arms = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.38, 1.55, 0);
      this.group.add(pivot);
      part(new THREE.CapsuleGeometry(0.105, 0.42, 4, 8), skin, 0, -0.3, 0, pivot);
      return pivot;
    });
    this.legs = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.16, 0.92, 0);
      this.group.add(pivot);
      part(new THREE.CapsuleGeometry(0.13, 0.28, 4, 8), shorts, 0, -0.2, 0, pivot);
      part(new THREE.CapsuleGeometry(0.095, 0.3, 4, 8), skin, 0, -0.55, 0, pivot);
      part(new THREE.BoxGeometry(0.2, 0.12, 0.3), shoe, 0, -0.82, -0.05, pivot);
      return pivot;
    });
    this.walkTime = 0;
    this.sync();
  }
  update(dt, input) {
    const forward = Number(input.has('KeyW')) - Number(input.has('KeyS'));
    const strafe = Number(input.has('KeyD')) - Number(input.has('KeyA'));
    const direction = new THREE.Vector3(strafe, 0, -forward);
    const moving = direction.lengthSq() > 0;
    if (moving) {
      direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), input.yaw);
      const angle = Math.atan2(-direction.x, -direction.z);
      const difference = Math.atan2(Math.sin(angle - this.group.rotation.y), Math.cos(angle - this.group.rotation.y));
      this.group.rotation.y += difference * Math.min(1, dt * 12);
      this.walkTime += dt * (input.has('ShiftLeft') || input.has('ShiftRight') ? 13 : 9);
    }
    const swing = moving ? Math.sin(this.walkTime) * 0.55 : 0;
    this.legs[0].rotation.x = swing;
    this.legs[1].rotation.x = -swing;
    this.arms[0].rotation.x = -swing * 0.7;
    this.arms[1].rotation.x = swing * 0.7;
    const speed = input.has('ShiftLeft') || input.has('ShiftRight') ? 7 : 4;
    this.verticalVelocity = Math.max(this.verticalVelocity - 9.81 * dt, -20);
    this.controller.computeColliderMovement(this.collider, {
      x: direction.x * speed * dt,
      y: this.verticalVelocity * dt,
      z: direction.z * speed * dt,
    });
    const movement = this.controller.computedMovement();
    if (this.controller.computedGrounded() && this.verticalVelocity < 0) this.verticalVelocity = 0;
    const current = this.body.translation();
    this.body.setNextKinematicTranslation({ x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z });
  }
  sync() {
    const pos = this.body.translation();
    this.position.set(pos.x, pos.y - 0.95, pos.z);
    this.group.position.copy(this.position);
  }
}
