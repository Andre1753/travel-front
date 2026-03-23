import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // A URL onde o Vite roda localmente
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    supportFile: false, // <-- A SOLUÇÃO AQUI: Desliga a exigência do arquivo de suporte
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});