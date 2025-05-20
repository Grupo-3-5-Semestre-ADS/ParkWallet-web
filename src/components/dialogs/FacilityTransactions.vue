<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1000px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
        density="compact"
      >
        <v-toolbar-title>Transações de: {{ facilityName }}</v-toolbar-title>
        <v-spacer/>
        <v-btn
          icon
          dark
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text style="min-height: 400px; max-height: 70vh;">
        <DefaultTable
          v-if="facilityId"
          :key="`facility-transactions-${facilityId}`"
          search-placeholder="Buscar Transação (ID, Status, etc.)"
          :table-items="transactions"
          :headers="transactionTableHeaders"
          :loading="isLoading"
          show-expand
          @load-more="loadMoreFacilityTransactions"
        >
          <!-- Implementação do slot custom-expanded-content -->
          <template #custom-expanded-content="{ item: transaction }">
            <v-list v-if="transaction.itemsTransaction && transaction.itemsTransaction.length > 0" lines="one"
                    density="compact" class="py-0">
              <template v-for="(transactionItem, index) in transaction.itemsTransaction" :key="transactionItem.id">
                <v-list-item class="px-1 py-2">
                  <v-row no-gutters align="center">
                    <v-col cols="12" sm="5">
                      <v-list-item-title class="font-weight-bold">{{
                          transactionItem.product.name
                        }}
                      </v-list-item-title>
                      <v-list-item-subtitle>ID Produto: {{ transactionItem.productId }}</v-list-item-subtitle>
                    </v-col>
                    <v-col cols="4" sm="2" class="text-sm-center">
                      <div class="text-caption">Qtd:</div>
                      <div>{{ transactionItem.quantity }}x</div>
                    </v-col>
                    <v-col cols="4" sm="2" class="text-sm-center">
                      <div class="text-caption">Preço Un.:</div>
                      <div>{{ formatCurrency(transactionItem.totalValue / transactionItem.quantity) }}</div>
                    </v-col>
                    <v-col cols="4" sm="3" class="text-sm-right">
                      <div class="text-caption">Total Item:</div>
                      <div class="font-weight-bold">{{ formatCurrency(transactionItem.totalValue) }}</div>
                    </v-col>
                  </v-row>
                </v-list-item>

                <v-divider v-if="index < transaction.itemsTransaction.length - 1" class="my-1"></v-divider>
              </template>
            </v-list>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
              text="Nenhum item encontrado para esta transação."
            ></v-alert>
          </template>
        </DefaultTable>
        <v-alert
          v-if="errorLoadingTransactions"
          type="error"
          class="mt-4"
        >
          {{ errorLoadingTransactions }}
        </v-alert>
      </v-card-text>

      <v-divider/>
      <v-card-actions class="pa-3">
        <v-spacer/>
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
import {ref, watch, onMounted, computed} from 'vue';
import DefaultTable from "@/components/DefaultTable.vue";
import {getFacilityTransactions} from '@/services/facilitiesService.js';

interface TransactionItemProduct {
  id: number;
  name: string;
  price: string;
}

interface TransactionItem {
  id: number;
  productId: number;
  quantity: number;
  totalValue: string;
  product: TransactionItemProduct;
}

interface Transaction {
  id: number;
  userId: number;
  totalValue: string;
  operation: string;
  status: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  itemsTransaction: TransactionItem[];
}

const props = defineProps<{
  modelValue: boolean;
  facilityId: number | null;
  facilityName: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const errorLoadingTransactions = ref<string | null>(null);

const currentTransactionPage = ref(1);
const itemsPerPage = ref(10); // Default page size
const allFacilityTransactionsLoaded = ref(false);
const currentSearchTerm = ref('');

const transactionTableHeaders = [
  {title: "ID", key: "id", sortable: false, width: '8%'},
  {title: "ID Usuário", key: "userId", sortable: false, width: '15%'},
  {title: "Valor Total", key: "totalValue", sortable: false, align: 'start', width: '20%'},
  {title: "Criado em", key: "createdAt", sortable: false, width: '25%'},
  {title: "Status", key: "status", sortable: false, align: 'center', width: '22%'},
];

const fetchTransactions = async (page = 1, searchTerm = '') => {
  if (!props.facilityId || isLoading.value || (page > 1 && allFacilityTransactionsLoaded.value && !searchTerm)) {
    return;
  }
  isLoading.value = true;
  errorLoadingTransactions.value = null;

  if (page === 1) {
    transactions.value = [];
    allFacilityTransactionsLoaded.value = false;
  }

  try {
    const responseData = await getFacilityTransactions(props.facilityId, page, itemsPerPage.value);

    if (responseData && Array.isArray(responseData.data) && responseData._page) {
      transactions.value.push(...responseData.data.map(formatTransactionData));
      currentTransactionPage.value = responseData._page.current + 1; // Prepare for next page
      allFacilityTransactionsLoaded.value = responseData._page.current >= responseData._page.total;
      if (responseData.data.length < itemsPerPage.value) {
        allFacilityTransactionsLoaded.value = true;
      }
    } else {
      console.error('Unexpected data structure from getFacilityTransactions:', responseData);
      errorLoadingTransactions.value = 'Formato de dados inesperado ao buscar transações.';
      allFacilityTransactionsLoaded.value = true;
    }
  } catch (err: any) {
    console.error(`Error fetching transactions for facility ${props.facilityId}:`, err);
    errorLoadingTransactions.value = err.message || 'Falha ao buscar transações do estabelecimento.';
    allFacilityTransactionsLoaded.value = true;
  } finally {
    isLoading.value = false;
  }
};

const formatTransactionData = (transaction: Transaction) => {
  return {
    ...transaction,
    totalValue: formatCurrency(transaction.totalValue),
    createdAt: formatDateTime(transaction.createdAt),

  };
};

const loadMoreFacilityTransactions = () => {
  if (!allFacilityTransactionsLoaded.value && !isLoading.value) {
    fetchTransactions(currentTransactionPage.value, currentSearchTerm.value);
  }
};

const resetAndLoad = () => {
  transactions.value = [];
  currentTransactionPage.value = 1;
  allFacilityTransactionsLoaded.value = false;
  isLoading.value = false;
  currentSearchTerm.value = ''; // Reset search term
  if (props.facilityId && props.modelValue) {
    fetchTransactions(1);
  }
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

function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Data inválida';
  }
}

watch(() => props.facilityId, (newId, oldId) => {
  if (newId !== oldId && newId !== null && props.modelValue) {
    resetAndLoad();
  }
});

watch(() => props.modelValue, (isVisible) => {
  if (isVisible && props.facilityId) {
    const firstLoadOrDifferentFacility = transactions.value.length === 0 ||
      (transactions.value.length > 0 && transactions.value[0].itemsTransaction[0]?.product.facilityId !== props.facilityId);
    if (firstLoadOrDifferentFacility) {
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
