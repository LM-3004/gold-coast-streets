export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0.08;
    this.locked = false;
    window.addEventListener('keydown', (event) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
        event.preventDefault();
        this.keys.add(event.code);
      }
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('blur', () => this.keys.clear());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      if (!this.locked) this.keys.clear();
      document.querySelector('#pause-hint').classList.toggle('hidden', this.locked || !this.started);
    });
    document.addEventListener('mousemove', (event) => {
      if (!this.locked) return;
      this.yaw -= event.movementX * 0.0025;
      this.pitch = Math.max(-0.15, Math.min(0.85, this.pitch + event.movementY * 0.002));
    });
    const lock = async () => {
      try {
        await canvas.requestPointerLock();
        this.started = true;
        document.querySelector('#prompt').classList.add('hidden');
        document.querySelector('#pointer-error').classList.add('hidden');
      } catch (error) {
        console.error('Mouse capture failed:', error);
        document.querySelector('#prompt').classList.remove('hidden');
        document.querySelector('#pointer-error').classList.remove('hidden');
      }
    };
    document.querySelector('#start').addEventListener('click', lock);
    canvas.addEventListener('click', () => {
      if (this.started && !this.locked) lock();
    });
  }
  has(code) {
    return this.locked && this.keys.has(code);
  }
}
