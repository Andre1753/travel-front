/**
 * src/services/AuditService.ts
 * Serviço de Domínio para Compliance e Auditoria.
 */
import api from '../lib/axios';

export interface AuditUser {
    id: string;
    name: string;
}

export interface AuditModifications {
    old?: Record<string, any>;
    new?: Record<string, any>;
}

export interface AuditLog {
    id: string;
    event: string;
    user: AuditUser | null;
    modifications: AuditModifications;
    ip_address: string;
    created_at: string;
}

export const AuditService = {
    /**
     * Recupera a timeline de auditoria de um Pedido de Viagem específico.
     */
    async getTravelOrderAudits(orderId: string): Promise<AuditLog[]> {
        const response = await api.get<{ data: AuditLog[] }>(`/travel-orders/${orderId}/audits`);
        return response.data.data;
    }
};