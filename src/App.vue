<script setup lang="ts">
/**
 * App.vue - Componente Raiz da Aplicação.
 * Atua como o contêiner mestre e injetor de rotas do SPA.
 */
import { RouterView } from 'vue-router';

// Futuramente, é aqui que você importaria componentes globais,
// como um <Toaster /> para exibir alertas de erro/sucesso em qualquer tela.
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
    
    <RouterView />
    
  </div>
</template>