<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import api from '../lib/axios';

    const router = useRouter();
    const isLoading = ref(true);
    const errorMessage = ref('');

    // DTO flexível temporário para receber o Resource
    const user = ref<any>(null);

    function goBack() {
        router.push({ name: 'dashboard' });
    }

    onMounted(async () => {
        try {
            const response = await api.get('/me');
            user.value = response.data.data; // Respeita o empacotamento 'data' do Laravel Resource
        } catch (error) {
            errorMessage.value = 'Não foi possível carregar as informações do perfil.';
        } finally {
            isLoading.value = false;
        }
    });
</script>

<template>
    <div class="p-6 md:p-10 max-w-3xl mx-auto font-sans">
        <header class="flex items-center justify-between pb-6 border-b border-gray-200 mb-8">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Meu Perfil</h1>
                <p class="text-gray-500 mt-1 text-sm">Informações da conta e permissões do sistema.</p>
            </div>
            <button @click="goBack" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Voltar
            </button>
        </header>

        <div v-if="isLoading" class="text-center py-20 text-gray-400 font-medium animate-pulse">
            Carregando informações...
        </div>
        
        <div v-else-if="errorMessage" class="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {{ errorMessage }}
        </div>

        <main v-else-if="user" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8">
                <div class="flex items-center gap-5">
                    <div class="h-20 w-20 bg-white rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-lg uppercase">
                        {{ user.name.charAt(0) }}
                    </div>
                    <div class="text-white">
                        <h2 class="text-2xl font-bold">{{ user.name }}</h2>
                        <p class="text-indigo-200 mt-0.5">{{ user.email }}</p>
                    </div>
                </div>
            </div>

            <div class="p-6 md:p-8">
                <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-100 pb-3">Credenciais de Acesso</h3>
                
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
                    <div>
                        <dt class="text-sm font-medium text-gray-500 mb-1">Nível de Permissão</dt>
                        <dd>
                            <span v-if="user.permissions?.is_admin" class="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200 flex items-center gap-1.5 w-max">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                Administrador
                            </span>
                            <span v-else class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">
                                Usuário Padrão
                            </span>
                        </dd>
                    </div>

                    <div>
                        <dt class="text-sm font-medium text-gray-500 mb-1">Conta criada em</dt>
                        <dd class="text-sm text-gray-900 font-semibold">
                                {{ new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                        </dd>
                    </div>
                </dl>
            </div>
        </main>
  </div>
</template>