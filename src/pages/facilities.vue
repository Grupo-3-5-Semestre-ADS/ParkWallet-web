<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <v-row class="align-center mb-4 flex-grow-0">
      <v-col cols="6">
        <v-text-field
          v-model="search"
          label="Buscar Estabelecimento"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </v-col>
      <v-col
        cols="6"
        class="text-right"
      >
        <v-btn
          color="primary"
          @click="openDialog"
        >
          Adicionar Estabelecimento
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="flex-grow-1 overflow-auto">
      <v-data-table
        :items="filteredFacilities"
        :headers="headers"
        items-per-page="5"
        class="full-height transparent-background"
      >
        <template #[`item.actions`]="{ item }">
          <v-tooltip text="Editar">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                color="blue"
                size="x-small"
                class="mr-2"
                @click="editFacility(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip :text="item.active ? 'Desativar' : 'Ativar'">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                :color="item.active ? 'orange' : 'green'"
                size="x-small"
                class="mr-2"
                @click="toggleActive(item)"
              >
                <v-icon>{{ item.active ? 'mdi-cancel' : 'mdi-check-circle' }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Abrir no Mapa">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                color="green"
                size="x-small"
                @click="openMap(item)"
              >
                <v-icon>mdi-map-marker</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>

        <template #[`item.active`]="{ item }">
          <v-chip
            :color="item.active ? 'green' : 'red'"
            text-color="white"
            small
            label
          >
            {{ item.active ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </template>
      </v-data-table>
    </v-row>

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

export default {
  name: "FacilitiesPage",
  components: {MapDialog, ConfirmDialog, CreateOrEditFacilities},
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

    const filteredFacilities = computed(() =>
      facilities.value.filter(f =>
        f.name.toLowerCase().includes(search.value.toLowerCase())
      )
    );

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
      filteredFacilities,
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
