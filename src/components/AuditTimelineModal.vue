<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TravelOrder } from '../services/TravelOrderService';
import { AuditService, type AuditLog } from '../services/AuditService';

const props = defineProps<{ 
    isOpen: boolean;
    order: TravelOrder | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const audits = ref<AuditLog[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');

// Reatividade: Quando o modal abre e tem um pedido, busca a API
watch(() => props.isOpen, async (newVal) => {
    if (newVal && props.order) {
        await fetchAudits();
    } else {
        audits.value = [];
        errorMessage.value = '';
    }
});

async function fetchAudits() {
    if (!props.order) return;
    isLoading.value = true;
    errorMessage.value = '';
    
    try {
        const result: any = await AuditService.getTravelOrderAudits(props.order.id);
        
        // CORREÇÃO DE ENGENHARIA (O BUG ESTAVA AQUI)
        // O Laravel empacota o Resource dentro de "data". 
        // Verificamos se vem o objeto { data: [...] } ou direto o array.
        audits.value = result.data ? result.data : result;
        
    } catch (error) {
        console.error('[AuditModal] Falha ao carregar auditoria:', error);
        errorMessage.value = 'Não foi possível carregar a timeline de auditoria.';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="relative z-50">
        
        <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>

        <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
            
            <div class="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="text-lg font-extrabold text-gray-900">Auditoria do Pedido</h2>
                    <p class="text-xs text-indigo-600 font-mono font-semibold mt-1">{{ order?.order_number }}</p>
                </div>
                <button @click="emit('close')" class="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-white">
                
                <div v-if="isLoading" class="flex flex-col items-center justify-center h-40 space-y-3">
                    <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p class="text-gray-400 text-sm font-medium animate-pulse">Carregando histórico...</p>
                </div>
                
                <div v-else-if="errorMessage" class="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200 text-center">
                    {{ errorMessage }}
                </div>
                
                <div v-else class="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4 pt-2">
                    
                    <div v-if="!audits || audits.length === 0" class="text-sm text-gray-400 italic ml-4">
                        Nenhum registro de auditoria encontrado para este pedido.
                    </div>

                    <div v-else v-for="log in audits" :key="log.id" class="relative pl-6 group">
                        <div class="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-500 group-hover:scale-125 transition-transform duration-200"></div>
                        
                        <div class="bg-gray-50 hover:bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div class="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    {{ log.event }}
                                </span>
                                <span class="text-[10px] text-gray-400 font-mono bg-white px-2 py-1 rounded border border-gray-50">
                                    {{ new Date(log.created_at).toLocaleString('pt-BR') }}
                                </span>
                            </div>
                            
                            <p class="text-sm text-gray-800 mb-1">
                                Autor: <span class="font-bold text-indigo-700">{{ log.user?.name || 'Sistema' }}</span>
                            </p>
                            <p class="text-xs text-gray-400 font-mono mb-2">IP: {{ log.ip_address }}</p>
                            
                            <div v-if="log.event === 'updated' && log.modifications.new" class="mt-3 pt-3 border-t border-gray-100">
                                <p class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Alterações:</p>
                                <ul class="text-xs space-y-2">
                                    <li v-for="(val, key) in log.modifications.new" :key="key" class="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-1">
                                        <span class="font-mono text-gray-500 font-semibold">{{ key }}:</span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-rose-600 line-through bg-rose-50 px-1 rounded">{{ log.modifications.old?.[key] || 'n/a' }}</span> 
                                            <span>➡️</span> 
                                            <span class="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">{{ val }}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    </div>
  </Teleport>
</template>