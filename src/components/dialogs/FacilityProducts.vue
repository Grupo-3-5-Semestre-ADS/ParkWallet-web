<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1000px"
    persistent
    :title="`Produtos de: ${facilityName}`"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-text style="min-height: 400px; max-height: 70vh; overflow-y: auto;">
        <DefaultTable
          v-if="facilityId"
          search-placeholder="Buscar Produto no Estabelecimento"
          :table-items="products"
          :headers="headers"
          :loading="isLoading"
          :add-button-text="''"
          :show-add-button="false"
          :show-map-button="false"
          @load-more="loadMoreFacilityProducts"
          :key="`facility-products-${facilityId}`"
        />
        <v-alert v-if="errorLoadingProducts" type="error" class="mt-4">
          {{ errorLoadingProducts }}
        </v-alert>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {ref, watch, onMounted} from 'vue';
import DefaultTable from "@/components/DefaultTable.vue";
import {getFacilityProducts} from '@/services/facilitiesService.js';

interface Product {
  id: number | null;
  name: string;
  description: string;
  price: number;
  facilityId: number | null;
  inactive: boolean;
  facility?: { name: string };
}

const props = defineProps<{
  modelValue: boolean;
  facilityId: number | null;
  facilityName: string | null;
}>();

const products = ref<Product[]>([]);
const isLoading = ref(false);
const errorLoadingProducts = ref<string | null>(null);

const currentProductPage = ref(1);
const allFacilityProductsLoaded = ref(false);


const headers = [
  {title: "Nome", key: "name", sortable: false},
  {title: "Descrição", key: "description", sortable: false},
  {title: "Valor", key: "price", sortable: false},
  {title: "Ativo", key: "inactive", sortable: false},
];

const fetchProducts = async (page = 1) => {
  if (!props.facilityId || isLoading.value || (page > 1 && allFacilityProductsLoaded.value)) {
    return;
  }
  isLoading.value = true;
  errorLoadingProducts.value = null;

  try {
    const responseData = await getFacilityProducts(props.facilityId);

    if (responseData && Array.isArray(responseData.data) && responseData._page) {
      if (page === 1) products.value = [];
      products.value.push(...responseData.data);
      currentProductPage.value = responseData._page.current + 1;
      allFacilityProductsLoaded.value = responseData._page.current >= responseData._page.total;
    }
    else if (Array.isArray(responseData)) {
      if (page === 1) products.value = [];
      products.value.push(...responseData);
      allFacilityProductsLoaded.value = true;
    } else {
      console.error('Unexpected data structure from getFacilityProducts:', responseData);
      errorLoadingProducts.value = 'Formato de dados inesperado ao buscar produtos.';
      allFacilityProductsLoaded.value = true;
    }

  } catch (err: any) {
    console.error(`Error fetching products for facility ${props.facilityId}:`, err);
    errorLoadingProducts.value = err.message || 'Falha ao buscar produtos do estabelecimento.';
    allFacilityProductsLoaded.value = true;
  } finally {
    isLoading.value = false;
  }
};

const loadMoreFacilityProducts = () => {
  if (!allFacilityProductsLoaded.value) {
    fetchProducts(currentProductPage.value);
  }
};

const resetAndLoad = () => {
  products.value = [];
  currentProductPage.value = 1;
  allFacilityProductsLoaded.value = false;
  isLoading.value = false;
  if (props.facilityId && props.modelValue) {
    fetchProducts(1);
  }
};

watch(() => props.facilityId, (newId, oldId) => {
  if (newId !== oldId && newId !== null && props.modelValue) {
    resetAndLoad();
  }
});

watch(() => props.modelValue, (isVisible) => {
  if (isVisible && props.facilityId) {
    if (products.value.length === 0 || (products.value.length > 0 && products.value[0].facilityId !== props.facilityId)) {
      resetAndLoad();
    }
  }
});

onMounted(() => {
  if (props.modelValue && props.facilityId) {
    resetAndLoad();
  }
});

</script>
