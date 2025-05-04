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
      show-map-button
      @add="openDialog"
      @edit="editFacility"
      @toggle="toggleActive"
      @map="openMap"
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
import {
  createFacility,
  getFacilities,
  getFacility,
  toggleFacilityActive,
  updateFacility
} from '@/services/facilitiesService.js';

export default {
  name: "FacilitiesPage",
  components: {DefaultTable, MapDialog, ConfirmDialog, CreateOrEditFacilities},
  setup() {
    const search = ref("");
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const showMapDialog = ref(false);
    const selectedCoords = ref({latitude: 0, longitude: 0});
    const facility = ref({id: null, name: "", description: "", type: "", latitude: "", longitude: ""});

    const facilities = ref([]);

    const headers = [
      {title: "Nome", key: "name"},
      {title: "Descrição", key: "description"},
      {title: "Tipo", key: "type"},
      {title: "Latitude", key: "latitude"},
      {title: "Longitude", key: "longitude"},
      {title: "Ativo", key: "inactive"},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const getData = async () => {
      try {
        const res = await getFacilities();
        facilities.value.push(...res.data);
      } catch (error) {
        console.error(error);
      }
    };

    const openDialog = () => {
      facility.value = {id: null, name: "", description: "", type: "", latitude: "", longitude: ""};
      editMode.value = false;
      dialog.value = true;
    };

    const editFacility = (item) => {
      facility.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveFacility = async (data) => {
      if (editMode.value) {
        const statusCode = await updateFacility(data.id, data);

        if (statusCode === 200) {
          const updatedFacility = await getFacility(data.id);
          const index = facilities.value.findIndex(f => f.id === data.id);
          facilities.value[index] = updatedFacility;
        }
      } else {
        const createdFacility = await createFacility(data);

        if (createdFacility) {
          await getData();
        }
      }
      dialog.value = false;
    };

    const toggleActive = async (item) => {
      const facilityToUpdate = facilities.value.find(f => f.id === item.id);
      if (facilityToUpdate) {
        const statusCode = await toggleFacilityActive(facilityToUpdate.id);
        if (statusCode === 200) {
          facilityToUpdate.inactive = !facilityToUpdate.inactive;
        }
      }
    };

    const openMap = (item) => {
      selectedCoords.value = {latitude: item.latitude, longitude: item.longitude};
      showMapDialog.value = true;
    };

    onMounted(() => {
      getData();
    });

    return {
      search,
      dialog,
      confirmClose,
      showMapDialog,
      selectedCoords,
      facility,
      facilities,
      headers,
      openDialog,
      editFacility,
      onSaveFacility,
      toggleActive,
      openMap,
      editMode
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  height: 100%;
}
</style>
