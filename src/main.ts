import './style.css';
import { AnimeBattleApp } from './ui/app';

const appRoot = document.getElementById('app');
if (appRoot) {
  new AnimeBattleApp(appRoot);
}
