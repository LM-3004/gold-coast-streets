# Gold Coast Streets

A playable third-person browser prototype of a sun-soaked Australian coastal city. The neighbourhood, character and scenery are deliberately lightweight placeholders for a larger open world.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite in a desktop browser. Click **Enter the streets** to capture the mouse. Use **WASD** to move, move the **mouse** to look around, and hold **Shift** to run. Press **Esc** to release the mouse; click the game to capture it again.

```sh
npm run build
npm run preview
```

The prototype uses Three.js for rendering and Rapier for the character controller and environment colliders. Code is organised into `game/` (loop, input and camera), `player/` (character and movement), and `world/` (procedural environment); the HUD and overlays live in `index.html` and `src/style.css`. There is no multiplayer.
