<script setup lang="ts">
    import Swal from 'sweetalert2';
    import { ref, reactive, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import api from '../lib/axios'; 
    import { TravelOrderService, type TravelOrder } from '../services/TravelOrderService';
    import CreateOrUpdateOrderModal from '../components/CreateOrUpdateOrderModal.vue';
    import AuditTimelineModal from '../components/AuditTimelineModal.vue';
    import CityAutocomplete from '../components/CityAutocomplete.vue';

    const router = useRouter();

    // Estados
    const orders = ref<TravelOrder[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref('');
    const isAdmin = ref(false);
    const isUpdatingStatus = ref(false); // Trava botões durante a requisição de aprovar/rejeitar

    // Modais e Controle de Edição
    const isModalOpen = ref(false);
    const orderToEdit = ref<TravelOrder | null>(null);

    const isAuditModalOpen = ref(false);
    const selectedOrderForAudit = ref<TravelOrder | null>(null);

    const filters = reactive({
        status: '',
        search: '', 
        origin: '',
        destination: '',
        start_date: '',
        end_date: ''
    });

    function handleLogout() {
        localStorage.removeItem('travel_token');
        router.push({ name: 'login' });
    }

    async function fetchOrders() {
        isLoading.value = true;
        errorMessage.value = '';
        try {
            const response = await TravelOrderService.getAll(filters);
            orders.value = response.data; 
        } catch (error) {
            errorMessage.value = 'Erro ao carregar os pedidos. Tente novamente mais tarde.';
        } finally {
            isLoading.value = false;
        }
    }

    // Abre o modal limpo para criação
    function openCreateModal() {
        orderToEdit.value = null;
        isModalOpen.value = true;
    }

    // Abre o modal preenchido para edição
    function openEditModal(order: TravelOrder) {
        orderToEdit.value = order;
        isModalOpen.value = true;
    }

    // Ação de Gestor: Aprovar ou Rejeitar com SweetAlert2
    async function handleUpdateStatus(orderId: string, status: 'aprovado' | 'cancelado') {
        const isApproval = status === 'aprovado';

        const result = await Swal.fire({
            title: isApproval ? 'Aprovar Pedido?' : 'Rejeitar Pedido?',
            text: isApproval 
                ? 'O solicitante será notificado da aprovação e o fluxo seguirá.' 
                : 'Esta ação é irreversível. O pedido será permanentemente cancelado.',
            icon: isApproval ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: isApproval ? 'Sim, Aprovar' : 'Sim, Rejeitar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-2xl shadow-2xl border border-gray-100',
                title: 'text-xl font-extrabold text-gray-900',
                confirmButton: isApproval 
                    ? 'bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-600 transition shadow-sm mx-2 cursor-pointer' // <-- Pointer adicionado
                    : 'bg-rose-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-rose-700 transition shadow-sm mx-2 cursor-pointer', // <-- Pointer adicionado
                cancelButton: 'bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm mx-2 cursor-pointer', // <-- Pointer adicionado
            }
        });

        if (!result.isConfirmed) return;
        
        isUpdatingStatus.value = true;
        try {
            await TravelOrderService.updateStatus(orderId, status);
            await fetchOrders(); 
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Pedido ${status} com sucesso!`,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                customClass: {
                    popup: 'rounded-xl shadow-lg border border-gray-100'
                }
            });

        } catch (error) {
            console.error('[Dashboard] Erro ao atualizar status:', error);
            Swal.fire({
                title: 'Falha na Operação',
                text: 'Não foi possível atualizar o status. Verifique se o pedido já foi processado por outro gestor.',
                icon: 'error',
                confirmButtonText: 'Entendi',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-2xl shadow-2xl border border-gray-100',
                    confirmButton: 'bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm mx-2 cursor-pointer' // <-- Pointer adicionado
                }
            });
        } finally {
            isUpdatingStatus.value = false;
        }
    }

    // Abre o modal de auditoria
    function openAudit(order: TravelOrder) {
        selectedOrderForAudit.value = order;
        isAuditModalOpen.value = true;
    }

    function clearFilters() {
        filters.status = '';
        filters.search = '';
        filters.origin = '';
        filters.destination = '';
        filters.start_date = '';
        filters.end_date = '';
        fetchOrders();
    }

    onMounted(async () => {
        try {
            const meResponse = await api.get('/me');
            isAdmin.value = meResponse.data.data.permissions.is_admin;
        } catch (e) {
            console.warn('[Dashboard] Não foi possível carregar permissões.');
        }
        fetchOrders();
    });
</script>

<template>
    <div class="p-6 md:p-10 max-w-7xl mx-auto font-sans">
        <header class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-8 gap-4">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight"><span v-if="!isAdmin">Meus </span>Pedidos de Viagem</h1>
                <p class="text-gray-500 mt-1 text-sm">Gerencie suas solicitações corporativas.</p>
            </div>
            
            <div class="flex items-center gap-3">
                <button @click="openCreateModal" class="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-md cursor-pointer">
                    Novo Pedido
                </button>

                <button @click="router.push({ name: 'profile' })" class="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition shadow-sm cursor-pointer">
                    👤 Perfil
                </button>
                
                <button @click="handleLogout" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:text-rose-600 transition shadow-sm group cursor-pointer">
                    🚪 Sair
                </button>
            </div>
        </header>

        <section class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Filtros de Busca</h2>
            </div>

            <form @submit.prevent="fetchOrders" class="space-y-5"> 
                <div v-if="isAdmin" class="w-full">
                    <label for="filter-search" class="sr-only">Buscar Solicitante</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input id="filter-search" v-model="filters.search" type="text" placeholder="Buscar por nome do solicitante..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition shadow-sm" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                    <div class="w-full">
                        <label for="filter-status" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                        <select id="filter-status" v-model="filters.status" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white text-sm transition shadow-sm">
                            <option value="">Todos</option>
                            <option value="solicitado">Solicitado</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    
                    <CityAutocomplete 
                        id="filter-origin"
                        v-model="filters.origin" 
                        label="Origem" 
                        label-class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                        placeholder="Ex: São Paulo" 
                    />
                    
                    <CityAutocomplete 
                        id="filter-destination"
                        v-model="filters.destination" 
                        label="Destino" 
                        label-class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                        placeholder="Ex: Rio de Janeiro" 
                    />

                    <div class="w-full">
                        <label for="filter-start-date" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ida (Início)</label>
                        <input id="filter-start-date" v-model="filters.start_date" type="date" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition text-gray-700 shadow-sm" />
                    </div>
                    <div class="w-full">
                        <label for="filter-end-date" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ida (Fim)</label>
                        <input id="filter-end-date" v-model="filters.end_date" type="date" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition text-gray-700 shadow-sm" />
                    </div>
                </div>
                
                <div class="flex gap-3 justify-end pt-2">
                    <button type="button" @click="clearFilters" :disabled="isLoading" class="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm disabled:opacity-60 cursor-pointer">
                        Limpar
                    </button>
                    <button type="submit" :disabled="isLoading" class="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md disabled:opacity-60 flex items-center gap-2 cursor-pointer">
                        <span v-if="isLoading">Filtrando...</span>
                        <span v-else>Aplicar Filtros</span>
                    </button>
                </div>
            </form>
        </section>

        <div v-if="isLoading" class="text-center py-16 text-gray-400 font-medium animate-pulse">
            Carregando...
        </div>
        <div v-else-if="errorMessage" class="text-center py-12 text-red-600 bg-red-50 rounded-xl border border-red-100">
            {{ errorMessage }}
        </div>

        <main v-else>
            <div v-if="orders.length === 0" class="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm text-gray-400">
                Nenhum pedido encontrado. <br> <span class="text-sm mt-1 block">Ajuste os filtros ou crie uma nova solicitação.</span>
            </div>

            <ul v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <li v-for="order in orders" :key="order.id" class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-visible">
                    <div>  
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex flex-col">
                                <span class="text-xs font-mono px-3 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-200 w-fit">
                                    {{ order.order_number }}
                                </span>
                            </div>
                            <span 
                                :class="{
                                'bg-amber-100 text-amber-800 border-amber-200': order.status === 'solicitado',
                                'bg-emerald-100 text-emerald-800 border-emerald-200': order.status === 'aprovado',
                                'bg-rose-100 text-rose-800 border-rose-200': order.status === 'cancelado'
                                }"
                                class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border h-fit"
                            >
                                {{ order.status }}
                            </span>
                        </div>
                            
                        <div class="mb-2">
                            <p class="text-[11px] font-medium text-gray-400 mt-2 flex items-center gap-1.5" v-if="order.created_at">
                                <svg class="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Solicitado em {{ new Date(order.created_at).toLocaleDateString('pt-BR') }}
                            </p>
                                
                            <p v-if="isAdmin" class="flex items-center gap-1.5 text-xs text-gray-500 mb-3 border-b border-gray-50 pb-3">
                                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <span>Solicitante: <span class="font-semibold text-gray-800">{{ order.requester_name }}</span></span>
                            </p>
                            
                            <div class="flex items-start gap-3 mt-3">
                                <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-inner mt-1">✈️</div>
                                <div>
                                    <p class="font-bold text-gray-900 leading-tight">{{ order.origin }} <br> <span class="text-gray-400 font-normal text-sm block my-0.5">para</span> {{ order.destination }}</p>
                                    <p class="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        Ida: {{ order.departure_date }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-gray-50 pt-4 mt-4 footer-card"> 
                        <div v-if="isAdmin" class="space-y-3">
                            <div v-if="order.status === 'solicitado'" class="grid grid-cols-2 gap-2">
                                <button 
                                    @click="handleUpdateStatus(order.id, 'cancelado')" 
                                    :disabled="isUpdatingStatus" 
                                    class="px-3 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
                                >
                                    Rejeitar
                                </button>
                                <button 
                                    @click="handleUpdateStatus(order.id, 'aprovado')" 
                                    :disabled="isUpdatingStatus" 
                                    class="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    Aprovar
                                </button>
                            </div>

                            <div v-else class="text-center pb-2">
                                <p class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">
                                    {{ order.status === 'aprovado' ? 'Aprovado em' : 'Cancelado em' }}
                                </p>
                                <p class="text-xs font-bold text-gray-700">
                                    {{ order.processed_at ? new Date(order.processed_at).toLocaleString('pt-BR') : 'Data não registrada' }}
                                </p>
                            </div>

                            <button @click="openAudit(order)" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 w-full pt-3 border-t border-gray-50 transition-colors cursor-pointer footer-audit-btn">
                                <span>Visualizar Auditoria</span>
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>

                        <div v-else class="flex flex-col items-center justify-center gap-1 w-full">
                            <p v-if="order.processed_at" class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                                {{ order.status === 'aprovado' ? 'Aprovado em' : 'Cancelado em' }}
                            </p>
                            <p v-if="order.processed_at" class="text-xs font-bold text-gray-700">
                                {{ new Date(order.processed_at).toLocaleString('pt-BR') }}
                            </p>
                            
                            <div v-else class="w-full text-center">
                                <p class="text-xs italic text-amber-600 font-medium mb-3">
                                    Aguardando análise do gestor...
                                </p>
                                <button 
                                    @click="openEditModal(order)" 
                                    class="px-4 py-2 w-full bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition shadow-sm cursor-pointer"
                                >
                                    ✏️ Editar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </main>

        <CreateOrUpdateOrderModal 
            :is-open="isModalOpen" 
            :order-to-edit="orderToEdit"
            @close="isModalOpen = false"
            @created="fetchOrders" 
            @updated="fetchOrders"
        />

        <AuditTimelineModal 
            :is-open="isAuditModalOpen"
            :order="selectedOrderForAudit"
            @close="isAuditModalOpen = false"
        />
    </div>
</template>