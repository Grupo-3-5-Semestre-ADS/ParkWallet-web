<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1200px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar color="primary" dark density="compact">
        <v-toolbar-title>Produtos de: {{ facilityName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text style="min-height: 500px; max-height: 80vh;">
        <v-row>
          <v-col cols="12" md="7" style="max-height: 75vh; overflow-y: auto;">
            <DefaultTable
              v-if="facilityId"
              search-placeholder="Buscar Produto no Estabelecimento"
              :table-items="products"
              :headers="productTableHeaders"
              :loading="isLoading"
              :add-button-text="''"
              :show-add-button="false"
              @load-more="loadMoreFacilityProducts"
              :key="`facility-products-${facilityId}`"
            >
              <template #custom-actions="{ item }">
                <v-tooltip :text="isSelected(item.id) ? 'Produto Já Selecionado' : 'Selecionar Produto'">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      icon
                      :color="isSelected(item.id) ? 'grey' : 'success'"
                      size="x-small"
                      @click="!isSelected(item.id) && addProductToSelection(item)"
                      :disabled="isSelected(item.id)"
                    >
                      <v-icon>{{ isSelected(item.id) ? 'mdi-check-circle' : 'mdi-plus-circle-outline' }}</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </DefaultTable>
            <v-alert v-if="errorLoadingProducts" type="error" class="mt-4">
              {{ errorLoadingProducts }}
            </v-alert>
          </v-col>

          <v-col cols="12" md="5" style="max-height: 75vh; overflow-y: auto; border-left: 1px solid #e0e0e0;">
            <div class="pa-3">
              <h3 class="mb-3">Produtos Selecionados ({{ selectedItems.length }})</h3>
              <div v-if="selectedItems.length === 0" class="text-center text-grey py-5">
                Nenhum produto selecionado. <br> Clique no '+' na lista ao lado.
              </div>
              <v-list v-else lines="two" density="compact">
                <v-list-item
                  v-for="selectedItem in selectedItems"
                  :key="selectedItem.product.id"
                  class="mb-2 elevation-1 rounded"
                >
                  <v-list-item-title class="font-weight-medium">{{ selectedItem.product.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Preço Unitário: {{ formatCurrency(selectedItem.product.price) }} <br>
                    Total: {{ formatCurrency(selectedItem.product.price * selectedItem.quantity) }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model.number="selectedItem.quantity"
                        type="number"
                        min="1"
                        max="99"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="width: 70px;"
                        @update:model-value="validateQuantity(selectedItem)"
                      />
                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        color="red"
                        size="small"
                        @click="removeProductFromSelection(selectedItem.product.id!)"
                        class="ml-2"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <v-btn
                v-if="selectedItems.length > 0"
                color="primary"
                block
                class="mt-4"
                @click="generateAndShowQrCode"
                :disabled="isGeneratingQr"
                :loading="isGeneratingQr"
              >
                Gerar QR Code da Compra
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- QR Code Dialog -->
      <v-dialog v-model="showQrDialog" max-width="380px" persistent>
        <v-card>
          <v-card-title class="d-flex align-center">
            QR Code da Compra
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="showQrDialog = false"></v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="text-center pa-5">
            <QrcodeVue :value="qrCodeData" :size="300" level="H"/>
            <p class="mt-3 text-caption">
              Escaneie para carregar os produtos e quantidades.
            </p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="showQrDialog = false"
            >
              Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider></v-divider>
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Fechar Janela
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {ref, watch, onMounted} from 'vue';
import DefaultTable from "@/components/DefaultTable.vue";
import {getFacilityProducts} from '@/services/facilitiesService.js';
import QrcodeVue from 'qrcode.vue';

interface Product {
  id: number | null;
  name: string;
  description: string;
  price: number;
  facilityId: number | null;
  inactive: boolean;
  facility?: { name: string };
}

interface SelectedItem {
  product: Product;
  quantity: number;
}

const props = defineProps<{
  modelValue: boolean;
  facilityId: number | null;
  facilityName: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const products = ref<Product[]>([]);
const isLoading = ref(false);
const errorLoadingProducts = ref<string | null>(null);

const currentProductPage = ref(1);
const allFacilityProductsLoaded = ref(false);

// State for selected products and QR code
const selectedItems = ref<SelectedItem[]>([]);
const qrCodeData = ref<string>('');
const showQrDialog = ref<boolean>(false);
const isGeneratingQr = ref<boolean>(false);


// Updated headers for the DefaultTable to include a slot for actions
const productTableHeaders = [
  {title: "Nome", key: "name", sortable: false, width: '30%'},
  {title: "Descrição", key: "description", sortable: false, width: '30%'},
  {title: "Valor", key: "price", sortable: false, align: 'end', width: '15%'},
  {title: "Ativo", key: "inactive", sortable: false, align: 'center', width: '15%'},
  {title: "Selecionar", key: 'actions', sortable: false, align: 'center', width: '10%'} // 'actions' key matches DefaultTable's custom-actions slot
];

const fetchProducts = async (page = 1) => {
  if (!props.facilityId || isLoading.value || (page > 1 && allFacilityProductsLoaded.value)) {
    return;
  }
  isLoading.value = true;
  errorLoadingProducts.value = null;

  try {
    const responseData = await getFacilityProducts(props.facilityId); // Assuming this now takes page & size or you adjust it

    if (responseData && Array.isArray(responseData.data) && responseData._page) {
      if (page === 1) products.value = [];
      products.value.push(...responseData.data);
      currentProductPage.value = responseData._page.current + 1;
      allFacilityProductsLoaded.value = responseData._page.current >= responseData._page.total;
    } else if (Array.isArray(responseData)) { // Fallback if API doesn't paginate this endpoint
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
  selectedItems.value = [];
  if (props.facilityId && props.modelValue) {
    fetchProducts(1);
  }
};

// --- Product Selection Logic ---
const addProductToSelection = (product: Product) => {
  if (!product.id) return;
  if (!selectedItems.value.find(item => item.product.id === product.id)) {
    selectedItems.value.push({product, quantity: 1});
  }
};

const removeProductFromSelection = (productId: number) => {
  selectedItems.value = selectedItems.value.filter(item => item.product.id !== productId);
};

const isSelected = (productId: number | null): boolean => {
  if (productId === null) return false;
  return selectedItems.value.some(item => item.product.id === productId);
};

const validateQuantity = (item: SelectedItem) => {
  if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
    item.quantity = 1;
  } else if (item.quantity > 99) {
    item.quantity = 99;
  }
};

// --- QR Code Logic ---
const generateAndShowQrCode = () => {
  isGeneratingQr.value = true;
  const dataForQr = selectedItems.value.map(item => ({
    productId: item.product.id,
    quantity: item.quantity
  }));

  if (dataForQr.length === 0) {
    isGeneratingQr.value = false;
    return;
  }

  qrCodeData.value = JSON.stringify(dataForQr);
  showQrDialog.value = true;
  isGeneratingQr.value = false;
};

function formatCurrency(value: number | string | undefined | null): string {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return 'N/A';
  }
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}


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
  } else if (!isVisible) {
    selectedItems.value = [];
  }
});

onMounted(() => {
  if (props.modelValue && props.facilityId) {
    resetAndLoad();
  }
});

</script>

<style scoped>
.v-list-item--density-compact .v-list-item__append {
  align-self: center;
}
</style>
