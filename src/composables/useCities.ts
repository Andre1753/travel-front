// src/composables/useCities.ts
import { ref } from 'vue';

// VARIÁVEIS GLOBAIS (Fora da função exportada agem como Singleton)
const cities = ref<string[]>([]);
const isFetchingCities = ref(false);
let fetchPromise: Promise<void> | null = null; // Trava de concorrência

export function useCities() {
    async function fetchIBGECities() {
        // Se já tem dados, retorna na hora (Cache hit)
        if (cities.value.length > 0) return; 
        
        // Se outra tela já disparou o fetch no mesmo milissegundo, aguarda o dela (Evita duplicidade de rede)
        if (fetchPromise) return fetchPromise; 

        isFetchingCities.value = true;
        
        fetchPromise = fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
            .then(res => res.json())
            .then(data => {
                cities.value = data.map((city: any) => {
                    const uf = city.microrregiao?.mesorregiao?.UF?.sigla 
                            || city['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla 
                            || '';
                    return uf ? `${city.nome} - ${uf}` : city.nome;
                });
            })
            .catch(error => {
                console.warn('[IBGE API] Falha ao carregar. O Autocomplete foi desativado temporariamente.', error);
            })
            .finally(() => {
                isFetchingCities.value = false;
            });

        return fetchPromise;
    }

    return { cities, isFetchingCities, fetchIBGECities };
}