<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { useCities } from '../composables/useCities';

    const props = defineProps<{
        modelValue: string;
        id?: string; // INJEÇÃO DO ID
        label?: string;
        labelClass?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
    }>();

    const emit = defineEmits<{
        (e: 'update:modelValue', value: string): void;
    }>();

    const { cities, isFetchingCities, fetchIBGECities } = useCities();
    const showDropdown = ref(false);

    onMounted(() => {
        fetchIBGECities();
    });

    const internalValue = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val)
    });

    const filteredCities = computed(() => {
        if (!internalValue.value || internalValue.value.length < 2) return [];
        const search = internalValue.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return cities.value
            .filter(c => c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search))
            .slice(0, 10);
    });

    function selectCity(city: string) {
        internalValue.value = city;
        showDropdown.value = false;
    }

    function handleBlur() {
        setTimeout(() => {
            showDropdown.value = false;
            if (internalValue.value && !cities.value.includes(internalValue.value)) {
                internalValue.value = ''; 
            }
        }, 200);
    }
</script>

<template>
    <div class="relative w-full">
        <label v-if="label" :for="id" :class="labelClass || 'block text-sm font-semibold text-gray-700 mb-1'">
            {{ label }} <span v-if="isFetchingCities" class="text-xs text-indigo-500 font-normal ml-1 animate-pulse">(Carregando IBGE...)</span>
        </label>
        
        <input 
            :id="id"
            v-model="internalValue" 
            @focus="showDropdown = true"
            @blur="handleBlur"
            type="text" 
            :required="required"            
            autocomplete="off"
            :placeholder="placeholder || 'Digite o nome da cidade...'"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-shadow disabled:bg-gray-50 disabled:text-gray-400" 
            :disabled="disabled || isFetchingCities"
        />
        
        <ul v-if="showDropdown && filteredCities.length > 0" data-test="city-dropdown" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">                    
            <li 
                v-for="city in filteredCities" 
                :key="city" 
                @mousedown.prevent="selectCity(city)" 
                class="px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex items-center gap-2"
            >
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ city }}
            </li>
        </ul>
    </div>
</template>