<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <DefaultTable
      search-placeholder="Buscar Estabelecimento"
      add-button-text="Adicionar Estabelecimento"
      :table-items="facilities"
      :headers="headers"
      :loading="isLoading"
      show-add-button
      show-edit-button
      show-inactivate-button
      show-search
      @add="openDialog"
      @edit="editFacility"
      @toggle="toggleActive"
      @map="openMap"
      @load-more="loadMoreFacilities"
      @view-products="openFacilityProductsDialog"
      @search-updated="handleSearch"
    >
      <template #custom-actions="{ item }">
        <v-tooltip
          text="Abrir no Mapa"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              color="green"
              size="x-small"
              class="mr-2"
              @click="openMap(item)"
            >
              <v-icon>mdi-map-marker</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip
          text="Ver Produtos"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              color="purple"
              size="x-small"
              class="mr-2"
              @click="openFacilityProductsDialog(item)"
            >
              <v-icon>mdi-storefront-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip
          text="Ver Transações"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              color="blue"
              size="x-small"
              class="mr-2"
              @click="openFacilityTransactionsDialog(item)"
            >
              <v-icon>mdi-history</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </DefaultTable>

    <CreateOrEditFacilities
      v-model="dialog"
      :facility="facility"
      :edit-mode="editMode"
      @save="onSaveFacility"
      @cancel="confirmClose = true"
    />

    <ConfirmDialog
      v-model="confirmClose"
      title="Confirmar saída"
      message="Tem certeza que deseja sair sem salvar?"
      @confirm="dialog = false"
    />

    <MapDialog
      v-model="showMapDialog"
      :latitude="selectedCoords.latitude"
      :longitude="selectedCoords.longitude"
    />

    <FacilityProducts
      v-if="selectedFacilityForProducts"
      v-model="showFacilityProductsModal"
      :facility-id="selectedFacilityForProducts.id"
      :facility-name="selectedFacilityForProducts.name"
    />

    <FacilityTransactions
      v-if="selectedFacilityForTransactions"
      v-model="showFacilityTransactionsModal"
      :facility-id="selectedFacilityForTransactions.id"
      :facility-name="selectedFacilityForTransactions.name"
    />
  </v-container>
</template>

<script lang="ts">
import {inject, nextTick, onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditFacilities from "@/components/dialogs/CreateOrEditFacilities.vue";
import MapDialog from "@/components/dialogs/MapDialog.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {createFacility, getFacilities, toggleFacilityActive, updateFacility} from '@/services/facilitiesService.js';
import FacilityProducts from "@/components/dialogs/FacilityProducts.vue";
import FacilityTransactions from "@/components/dialogs/FacilityTransactions.vue";

interface Facility {
  id?: number;
  name: string;
  description: string;
  type: 'store' | 'attraction' | 'other' | null;
  latitude: number | null;
  longitude: number | null;
  active?: boolean;
}

export default {
  name: "FacilitiesPage",
  components: {FacilityTransactions, FacilityProducts, DefaultTable, MapDialog, ConfirmDialog, CreateOrEditFacilities},
  setup() {
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const showMapDialog = ref(false);
    const selectedCoords = ref({latitude: "0", longitude: "0"});
    const facility = ref({id: null, name: "", description: "", type: "", latitude: "", longitude: ""});

    const facilities = ref<Facility[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);
    const currentSearchQuery = ref("");

    const showFacilityProductsModal = ref(false);
    const selectedFacilityForProducts = ref<Facility | null>(null);

    const showFacilityTransactionsModal = ref(false);
    const selectedFacilityForTransactions = ref<Facility | null>(null);

    const headers = [
      {title: "Nome", key: "name", sortable: false},
      {title: "Descrição", key: "description", sortable: false},
      {title: "Tipo", key: "type", sortable: false},
      {title: "Latitude", key: "latitude", sortable: false},
      {title: "Longitude", key: "longitude", sortable: false},
      {title: "Ativo", key: "active", sortable: false},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const showSnackbar = inject<(message: string, color?: string) => void>('showSnackbar');

    const fetchFacilitiesPage = async () => {
      if (isLoading.value || allItemsLoaded.value) {
        return;
      }

      isLoading.value = true;

      try {
        const response = await getFacilities(currentPage.value, itemsPerPage.value, currentSearchQuery.value);

        if (response && response.data && response._page) {
          const newItems = response.data;

          if (currentPage.value === 1) {
            facilities.value = newItems;
          } else {
            facilities.value.push(...newItems);
          }

          if (response._page.current >= response._page.total) {
            allItemsLoaded.value = true;
          } else {
            allItemsLoaded.value = false;
            currentPage.value++;
          }

          if (newItems.length === 0 && response._page.current === response._page.total) {
            allItemsLoaded.value = true;
          }
        } else {
          console.error("Invalid data structure received from API for pagination:", response);

          if (currentPage.value === 1) {
            facilities.value = [];
          }

          allItemsLoaded.value = true;
        }
      } catch (error) {
        console.error("Failed to fetch facilities page:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadMoreFacilities = () => {
      fetchFacilitiesPage();
    };

    const resetAndLoadData = async () => {
      facilities.value = [];
      currentPage.value = 1;
      allItemsLoaded.value = false;
      await fetchFacilitiesPage();
    };

    const handleSearch = (searchTerm: string) => {
      currentSearchQuery.value = searchTerm;
      resetAndLoadData(searchTerm);
    };

    const openDialog = () => {
      facility.value = {id: null, name: "", description: "", type: "", latitude: "", longitude: ""};
      editMode.value = false;
      dialog.value = true;
    };

    const editFacility = (item: Facility) => {
      facility.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveFacility = async (data: Facility) => {
      try {
        if (editMode.value) {
          const statusCode = await updateFacility(data.id, data);

          if (statusCode === 200) {
            await resetAndLoadData();
            dialog.value = false;
            showSnackbar('Estabelecimento atualizado com sucesso!', 'success');
          } else {
            showSnackbar('Erro ao atualizar estabelecimento!', 'error');
          }
        } else {
          const statusCode = await createFacility(data);

          if (statusCode === 201) {
            await resetAndLoadData();
            dialog.value = false;
            showSnackbar('Estabelecimento cadastrado com sucesso!', 'success');
          } else {
            showSnackbar('Erro ao cadastrar estabelecimento!', 'error');
          }
        }
      } catch (error) {
        console.error("Error saving facility:", error);
      }
    };

    const toggleActive = async (item: Facility) => {
      const facilityIndex = facilities.value.findIndex(f => f.id === item.id);

      if (facilityIndex === -1) {
        return;
      }

      try {
        const statusCode = await toggleFacilityActive(item.id);

        if (statusCode === 200) {
          facilities.value[facilityIndex].active = !facilities.value[facilityIndex].active;
          showSnackbar('Estabelecimento atualizado com sucesso!', 'success');
        } else {
          showSnackbar('Erro ao atualizar estabelecimento!', 'error');
        }
      } catch (error) {
        console.error("Error toggling facility status:", error);
        showSnackbar('Erro ao atualizar estabelecimento!', 'error');
      }
    };

    const openMap = (item: Facility) => {
      selectedCoords.value = {latitude: item.latitude, longitude: item.longitude};
      showMapDialog.value = true;
    };

    const openFacilityProductsDialog = (item: Facility) => {
      selectedFacilityForProducts.value = item;
      showFacilityProductsModal.value = true;
    };

    const openFacilityTransactionsDialog = (item: Facility) => {
      selectedFacilityForTransactions.value = item;

      nextTick(() => {
        showFacilityTransactionsModal.value = true;
      })
    };

    onMounted(() => {
      resetAndLoadData();
    });

    return {
      dialog,
      confirmClose,
      showMapDialog,
      selectedCoords,
      facility,
      facilities,
      headers,
      isLoading,
      openDialog,
      editFacility,
      onSaveFacility,
      toggleActive,
      openMap,
      showFacilityProductsModal,
      selectedFacilityForProducts,
      openFacilityProductsDialog,
      editMode,
      loadMoreFacilities,
      showFacilityTransactionsModal,
      selectedFacilityForTransactions,
      openFacilityTransactionsDialog,
      handleSearch
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  overflow-y: hidden;
  height: 100%;
}
</style>
