// src/lib/axios.ts
import axios from 'axios';

// Cria a instância base apontando para a sua API Laravel v1
const api = axios.create({
    baseURL: 'http://localhost/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor de REQUISIÇÃO (Injeta o Token antes da chamada sair)
api.interceptors.request.use((config) => {
    // Busca o token onde você tiver salvo (ex: localStorage)
    const token = localStorage.getItem('travel_token');
    
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

// Interceptor de RESPOSTA (Trata erros globalmente quando a API responde)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se a API disser que o token expirou ou é inválido (401)
        if (error.response?.status === 401) {
            localStorage.removeItem('travel_token');
            // Redireciona pro login (descomente quando tiver o Vue Router configurado)
            // window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;