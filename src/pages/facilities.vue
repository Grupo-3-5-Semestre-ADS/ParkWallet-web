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
      @add="openDialog"
      @edit="editFacility"
      @toggle="toggleActive"
      @map="openMap"
      @load-more="loadMoreFacilities"
      @view-products="openFacilityProductsDialog"
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
import {onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditFacilities from "@/components/dialogs/CreateOrEditFacilities.vue";
import MapDialog from "@/components/dialogs/MapDialog.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {createFacility, getFacilities, toggleFacilityActive, updateFacility} from '@/services/facilitiesService.js';
import FacilityProducts from "@/components/dialogs/FacilityProducts.vue";
import FacilityTransactions from "@/components/dialogs/FacilityTransactions.vue";

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

    const facilities = ref<any[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);

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

    const fetchFacilitiesPage = async () => {
      if (isLoading.value || allItemsLoaded.value) {
        return;
      }

      isLoading.value = true;

      try {
        const response = await getFacilities(currentPage.value, itemsPerPage.value);

        if (response && response.data && response._page) {
          if (response.data.length > 0) {
            facilities.value.push(...response.data);
            currentPage.value++;
          }

          if (response._page.current >= response._page.total) {
            allItemsLoaded.value = true;
          }
        } else {
          console.error("Invalid data structure received from API for pagination:", response);
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


    const openDialog = () => {
      facility.value = {id: null, name: "", description: "", type: "", latitude: "", longitude: ""};
      editMode.value = false;
      dialog.value = true;
    };

    const editFacility = (item: any) => {
      facility.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveFacility = async (data: any) => {
      isLoading.value = true;
      let success = false;

      try {
        if (editMode.value) {
          const statusCode = await updateFacility(data.id, data);
          if (statusCode === 200) {
            success = true;
          } else {
            console.error("Update failed with status:", statusCode);
          }
        } else {
          const statusCode = await createFacility(data);

          if (statusCode === 201) {
            success = true;
          } else {
            console.error("Create failed");
          }
        }

        if (success) {
          isLoading.value = false;
          await resetAndLoadData();
        }

      } catch (error) {
        console.error("Error saving facility:", error);
      } finally {
        if (!success) isLoading.value = false;
        dialog.value = false;
      }
    };

    const toggleActive = async (item: any) => {
      const originalStatus = item.active;
      const index = facilities.value.findIndex(f => f.id === item.id);
      if (index !== -1) {
        facilities.value[index].active = !facilities.value[index].active;
      }

      try {
        const statusCode = await toggleFacilityActive(item.id);
        if (statusCode !== 200) {
          if (index !== -1) {
            facilities.value[index].active = originalStatus;
          }
          console.error("Toggle status failed with status:", statusCode);
        }
      } catch (error) {
        if (index !== -1) {
          facilities.value[index].active = originalStatus;
        }
        console.error("Error toggling facility status:", error);
      }
    };

    const openMap = (item: any) => {
      selectedCoords.value = {latitude: item.latitude, longitude: item.longitude};
      showMapDialog.value = true;
    };

    const openFacilityProductsDialog = (item: Facility) => {
      selectedFacilityForProducts.value = item;
      showFacilityProductsModal.value = true;
    };

    const openFacilityTransactionsDialog = (item: Facility) => {
      selectedFacilityForTransactions.value = item;
      showFacilityTransactionsModal.value = true;
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
