// src/services/TravelOrderService.ts
import api from '../lib/axios';

// DTO de Saída (Exatamente o que seu Resource do Laravel devolve)
export interface TravelOrder {
    id: string;
    order_number: string;
    origin: string;
    destination: string;
    status: string;
    departure_date: string;
    processed_at: string | null;
}

// DTO de Entrada (O que o seu FormRequest do Laravel exige)
export interface CreateTravelOrderPayload {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
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

    // Aprova ou cancela (Admin)
    async updateStatus(id: string, status: 'aprovado' | 'cancelado') {
        const response = await api.patch(`/travel-orders/${id}/status`, { status });
        return response.data;
    }
};