// src/main.ts
import { createApp } from 'vue';
import './style.css'; // O Vite passará este arquivo pelo plugin @tailwindcss/vite
import App from './App.vue';
import router from './router';

/**
 * Inicialização do App Vue 3 com Tipagem Estrita.
 */
const app = createApp(App);

app.use(router);
app.mount('#app');