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
      show-map-button
      @add="openDialog"
      @edit="editFacility"
      @toggle="toggleActive"
      @map="openMap"
      @load-more="loadMoreFacilities"
    />

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
  </v-container>
</template>

<script lang="ts">
import {onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditFacilities from "@/components/dialogs/CreateOrEditFacilities.vue";
import MapDialog from "@/components/dialogs/MapDialog.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {createFacility, getFacilities, toggleFacilityActive, updateFacility} from '@/services/facilitiesService.js'; // Ensure path is correct

export default {
  name: "FacilitiesPage",
  components: {DefaultTable, MapDialog, ConfirmDialog, CreateOrEditFacilities},
  setup() {
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const showMapDialog = ref(false);
    const selectedCoords = ref({latitude: 0, longitude: 0});
    const facility = ref({id: null, name: "", description: "", type: "", latitude: "", longitude: ""});

    // --- Infinite Scroll State ---
    const facilities = ref<any[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);
    // -----------------------------

    const headers = [
      {title: "Nome", key: "name"},
      {title: "Descrição", key: "description"},
      {title: "Tipo", key: "type"},
      {title: "Latitude", key: "latitude"},
      {title: "Longitude", key: "longitude"},
      {title: "Ativo", key: "inactive"},
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
          const createdFacility = await createFacility(data);
          if (createdFacility) {
            success = true;
          } else {
            console.error("Create failed");
          }
        }

        if (success) {
          await resetAndLoadData();
        }

      } catch (error) {
        console.error("Error saving facility:", error);
      } finally {
        if (!success) isLoading.value = false;
        dialog.value = false; // Close dialog
      }
    };

    const toggleActive = async (item: any) => {
      const originalStatus = item.inactive;
      const index = facilities.value.findIndex(f => f.id === item.id);
      if (index !== -1) {
        facilities.value[index].inactive = !facilities.value[index].inactive;
      }

      try {
        const statusCode = await toggleFacilityActive(item.id);
        if (statusCode !== 200) {
          if (index !== -1) {
            facilities.value[index].inactive = originalStatus;
          }
          console.error("Toggle status failed with status:", statusCode);
        }
      } catch (error) {
        if (index !== -1) {
          facilities.value[index].inactive = originalStatus;
        }
        console.error("Error toggling facility status:", error);
      }
    };

    const openMap = (item: any) => {
      selectedCoords.value = {latitude: item.latitude, longitude: item.longitude};
      showMapDialog.value = true;
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
      editMode,
      loadMoreFacilities,
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
