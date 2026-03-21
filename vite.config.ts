/**
 * vite.config.ts
 * Configuração do Vite com segregação de portas para evitar conflitos com o Backend.
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    // Engenharia de Conflito: Mudamos para a 3000 (padrão de apps front-end)
    port: 3000, 
    // Se rodar no Docker futuramente, o host '0.0.0.0' é obrigatório
    host: true, 
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})