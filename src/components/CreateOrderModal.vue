<script setup lang="ts">
import { reactive, ref } from 'vue';
import { TravelOrderService, type CreateTravelOrderPayload } from '../services/TravelOrderService';

// Props para controlar visibilidade recebida do componente Pai
defineProps<{ isOpen: boolean }>();

// Emits para avisar o Pai que o modal fechou ou que um pedido foi criado
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void; // O Pai usa isso para recarregar a lista!
}>();

const isLoading = ref(false);
const errorMessage = ref('');

// DTO estrito
const form = reactive<CreateTravelOrderPayload>({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
});

async function handleSubmit() {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        await TravelOrderService.create(form);
        
        // Limpa o formulário para o próximo uso
        form.origin = '';
        form.destination = '';
        form.departure_date = '';
        form.return_date = '';
        
        // Avisa o Dashboard que deu sucesso e fecha
        emit('created');
        emit('close');
    } catch (error: any) {
        errorMessage.value = error.response?.data?.message || 'Erro ao criar o pedido. Verifique os dados.';
        console.error('[CreateOrderModal] Error:', error);
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
  <Teleport to="body">
    <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
        @click="emit('close')"
    ></div>

    <div 
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
        :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
            <h2 class="text-xl font-bold text-gray-900">Nova Viagem</h2>
            <p class="text-xs text-gray-500 mt-1">Preencha os detalhes do trajeto</p>
        </div>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-700 transition p-2 rounded-full hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit" id="createOrderForm" class="space-y-5">
            
            <div v-if="errorMessage" class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                {{ errorMessage }}
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Origem *</label>
                <input v-model="form.origin" type="text" required placeholder="Ex: Belo Horizonte, MG" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-sm shadow-sm" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Destino *</label>
                <input v-model="form.destination" type="text" required placeholder="Ex: Florianópolis, SC" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-sm shadow-sm" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Data de Ida *</label>
                <input v-model="form.departure_date" type="date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-sm shadow-sm text-gray-700" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Data de Volta <span class="text-gray-400 font-normal">(Opcional)</span></label>
                <input v-model="form.return_date" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-sm shadow-sm text-gray-700" />
            </div>
        </form>
      </div>

      <div class="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
        <button type="button" @click="emit('close')" :disabled="isLoading" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-60">
            Cancelar
        </button>
        <button type="submit" form="createOrderForm" :disabled="isLoading" class="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-60 flex items-center gap-2">
            {{ isLoading ? 'Enviando...' : 'Solicitar Viagem' }}
        </button>
      </div>

    </div>
  </Teleport>
</template>