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
      :editMode="editMode"
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
import {ref, computed} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditFacilities from "@/components/dialogs/CreateOrEditFacilities.vue";
import MapDialog from "@/components/dialogs/MapDialog.vue";
import DefaultTable from "@/components/DefaultTable.vue";

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

    const facilities = ref([
      {
        id: 1,
        name: "Hospital A",
        description: "Emergência 24h",
        type: "Hospital",
        latitude: -23.55,
        longitude: -46.63,
        active: true
      },
      {
        id: 2,
        name: "Escola B",
        description: "Ensino Fundamental",
        type: "Escola",
        latitude: -22.90,
        longitude: -47.06,
        active: true
      },
      {
        id: 3,
        name: "Shopping C",
        description: "Centro Comercial",
        type: "Shopping",
        latitude: -24.61748223335819,
        longitude: -53.70975730405071,
        active: true
      }
    ]);

    const headers = [
      {title: "Nome", key: "name"},
      {title: "Descrição", key: "description"},
      {title: "Tipo", key: "type"},
      {title: "Latitude", key: "latitude"},
      {title: "Longitude", key: "longitude"},
      {title: "Ativo", key: "active"},
      {title: "Ações", key: "actions", sortable: false}
    ];

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

    const onSaveFacility = (data) => {
      if (editMode.value) {
        const index = facilities.value.findIndex(f => f.id === data.id);
        facilities.value[index] = {...data};
      } else {
        data.id = facilities.value.length + 1;
        facilities.value.push({...data});
      }
      dialog.value = false;
    };

    const toggleActive = (item) => {
      const facilityToUpdate = facilities.value.find(f => f.id === item.id);
      if (facilityToUpdate) {
        facilityToUpdate.active = !facilityToUpdate.active;
      }
    };

    const openMap = (item) => {
      selectedCoords.value = {latitude: item.latitude, longitude: item.longitude};
      showMapDialog.value = true;
    };

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

.text-right {
  text-align: right;
}

.full-height {
  height: 100%;
}

.transparent-background {
  background-color: transparent;
}
</style>
