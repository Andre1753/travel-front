<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../services/AuthService'; 

const router = useRouter();

// Estado do formulário
const form = reactive({
    email: 'user@email.com',
    password: 'password',
});

// ESTADO DE ENGENHARIA: Controle de visibilidade da senha
const showPassword = ref(false);

const isLoading = ref(false);
const errorMessage = ref('');

/**
 * Alterna a visibilidade da senha.
 * UX Tip: Manter o foco no input após alternar ajuda usuários de teclado/leitores de tela.
 */
function togglePassword() {
    showPassword.value = !showPassword.value;
}

async function handleLogin() {
    isLoading.value = true;
    errorMessage.value = '';
    
    try {
        const response = await AuthService.login(form);
        localStorage.setItem('travel_token', response.access_token);
        router.push({ name: 'dashboard' });
    } catch (error: any) {
        errorMessage.value = error.response?.data?.error || 'Falha na autenticação.';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-950">Travel Corporate</h1>
        <p class="text-gray-600">Acesse sua conta</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <div v-if="errorMessage" class="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
          {{ errorMessage }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input v-model="form.email" id="email" type="email" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition shadow-sm" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <div class="relative">
            <input 
              v-model="form.password"
              id="password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition shadow-sm pr-12"
            />
            
            <button 
              type="button"
              @click="togglePassword"
              class="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-blue-600 transition-colors focus:outline-none"
              :aria-label="showPassword ? 'Esconder senha' : 'Mostrar senha'"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="isLoading" class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 shadow-md transition-all">
          {{ isLoading ? 'Autenticando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>