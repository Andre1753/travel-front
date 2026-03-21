/**
 * src/services/AuthService.ts
 * * Camada de Serviço de Domínio para Autenticação.
 * Responsável exclusivamente por orquestrar a comunicação HTTP referente a acessos.
 */

// Importamos a instância do Axios (que criamos lá atrás, contendo a BaseURL)
import api from '../lib/axios';

/**
 * DTO de Entrada: O que o nosso formulário envia para a API.
 * Reflete o FormRequest do Laravel.
 */
export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * DTO de Saída: O contrato exato que a API do Laravel devolve em caso de sucesso.
 */
export interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    // Se a sua API retornar os dados do usuário junto no login, adicione aqui:
    // user: { id: string; name: string; email: string; }
}

export const AuthService = {
    /**
     * Submete as credenciais do usuário e obtém o JWT.
     * * @param {LoginPayload} payload Credenciais preenchidas na View.
     * @returns {Promise<LoginResponse>} Contrato contendo o Token.
     * @throws Lança um erro (Exceção HTTP) caso o Laravel retorne 401 ou 422.
     */
    async login(payload: LoginPayload): Promise<LoginResponse> {
        // A tipagem <LoginResponse> no post garante que o response.data tenha o formato correto
        const response = await api.post<LoginResponse>('/login', payload);
        
        return response.data;
    },

    /**
     * Invalida o token do lado do servidor (se a sua API possuir essa rota).
     * O Pinia cuidará de apagar o token do LocalStorage, este método avisa o Back-end.
     */
    async logout(): Promise<void> {
        await api.post('/logout');
    }
};