// src/services/TravelOrderService.ts
import api from '../lib/axios';

export interface TravelOrder {
    id: string;
    order_number: string;
    requester_name?: string; // Propriedade exigida pelo Admin
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string | null; // Propriedade do Modal
    status: 'solicitado' | 'aprovado' | 'cancelado';
    created_at?: string; // Propriedade da View
    processed_at?: string | null; // Propriedade da View
}

// DTO de Entrada (O que o seu FormRequest do Laravel exige)
export interface CreateTravelOrderPayload {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string | null;
}

export const TravelOrderService = {
    // Lista os pedidos
    async getAll(filters?: any) {
        const response = await api.get('/travel-orders', { 
            params: filters 
        });
        return response.data;
    },

    // Cria um pedido
    async create(payload: CreateTravelOrderPayload) {
        const response = await api.post('/travel-orders', payload);
        return response.data;
    },

    //Edita detalhes do pedido quando nao foi processado.
    async update(id: string, payload: {
        origin: string;
        destination: string;
        departure_date: string;
        return_date?: string | null;
    }) {
        const response = await api.put(`/travel-orders/${id}`, payload);
        return response.data;
    },

    // Aprova ou cancela (Admin)
    async updateStatus(id: string, status: 'aprovado' | 'cancelado') {
        const response = await api.patch(`/travel-orders/${id}/status`, { status });
        return response.data;
    }
};