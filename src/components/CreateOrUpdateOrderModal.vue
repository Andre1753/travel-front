<script setup lang="ts">
    import { ref, reactive, watch, computed } from 'vue';
    import { TravelOrderService, type TravelOrder } from '../services/TravelOrderService';
    import CityAutocomplete from './CityAutocomplete.vue'; // <-- INJEÇÃO DO COMPONENTE

    const props = defineProps<{ 
        isOpen: boolean;
        orderToEdit?: TravelOrder | null;
    }>();

    const emit = defineEmits<{
        (e: 'close'): void;
        (e: 'created'): void; 
        (e: 'updated'): void;
    }>();

    const isLoading = ref(false);
    const errorMsg = ref('');

    const form = reactive({
        origin: '',
        destination: '',
        departure_date: '',
        return_date: ''
    });

    const todayString = computed(() => {
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    });

    watch(() => form.departure_date, (newDepartureDate) => {
        if (newDepartureDate && form.return_date && form.return_date < newDepartureDate) {
            form.return_date = '';
        }
    });

    watch(() => props.isOpen, (newVal) => {
        if (newVal) {
            errorMsg.value = '';
            if (props.orderToEdit) {
                form.origin = props.orderToEdit.origin;
                form.destination = props.orderToEdit.destination;
                form.departure_date = props.orderToEdit.departure_date;
                form.return_date = props.orderToEdit.return_date || '';
            } else {
                form.origin = '';
                form.destination = '';
                form.departure_date = '';
                form.return_date = '';
            }
        }
    });

    async function handleSubmit() {
        isLoading.value = true;
        errorMsg.value = '';

        try {
            const payload = { ...form, return_date: form.return_date || null };
            if (props.orderToEdit) {
                await TravelOrderService.update(props.orderToEdit.id, payload);
                emit('updated');
            } else {
                await TravelOrderService.create(payload);
                emit('created');
            }
            emit('close');
        } catch (error: any) {
            errorMsg.value = error.response?.status === 422 
                ? 'Preencha todos os campos obrigatórios corretamente.' 
                : 'Ocorreu um erro ao processar o pedido. Tente novamente.';
        } finally {
            isLoading.value = false;
        }
    }
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>
            
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-visible transform transition-all">
                <div class="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t-2xl">
                    <h2 class="text-xl font-extrabold text-gray-900">
                        {{ orderToEdit ? 'Editar Pedido de Viagem' : 'Novo Pedido de Viagem' }}
                    </h2>
                    <button @click="emit('close')" class="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
                    <div v-if="errorMsg" class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                        {{ errorMsg }}
                    </div>

                    <CityAutocomplete id="modal-origin" v-model="form.origin" label="Origem *" :required="true"/>
                    <CityAutocomplete id="modal-destination" v-model="form.destination" label="Destino *" :required="true"/>

                    <div class="grid grid-cols-2 gap-4 pt-1">
                        <div>
                            <label for="modal-departure-date" class="block text-sm font-semibold text-gray-700 mb-1">Data da Ida *</label>
                            <input id="modal-departure-date" v-model="form.departure_date" type="date" :min="todayString" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-shadow text-gray-700" />
                        </div>
                        <div>
                            <label for="modal-return-date" class="block text-sm font-semibold text-gray-700 mb-1">Data da Volta</label>
                            <input id="modal-return-date" v-model="form.return_date" type="date" :min="form.departure_date || todayString" :disabled="!form.departure_date" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-shadow text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" />
                        </div>
                    </div>

                    <div class="pt-5 flex justify-end gap-3 mt-6 border-t border-gray-100">
                        <button type="button" @click="emit('close')" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">Cancelar</button>
                        <button type="submit" :disabled="isLoading" class="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition shadow-md disabled:opacity-50 flex items-center gap-2">
                            <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {{ isLoading ? 'Processando...' : (orderToEdit ? 'Salvar Alterações' : 'Enviar Solicitação') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>