import './style.css';
import { Game } from './game/Game.js';

const loading = document.querySelector('#loading');
const loadingText = document.querySelector('#loading-text');

async function main() {
  try {
    const game = new Game(document.querySelector('#game'));
    await game.init();
    loading.classList.add('hidden');
    document.querySelector('#interface').classList.remove('hidden');
    game.start();
  } catch (error) {
    console.error('Unable to start Gold Coast Streets:', error);
    loadingText.textContent = 'The game could not start. Please check your browser supports WebGL and reload.';
  }
}

main();
