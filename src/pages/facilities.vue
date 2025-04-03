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
        />
      </v-col>
      <v-col
        cols="6"
        class="text-right"
      >
        <v-btn
          color="primary"
          rounded
          size="large"
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
          <v-btn
            icon
            color="blue"
            size="x-small"
            class="mr-2"
            @click="editFacility(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            color="red"
            size="x-small"
            @click="deleteFacility(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-row>

    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>{{ editMode ? 'Editar Estabelecimento' : 'Adicionar Estabelecimento' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="facility.name"
            label="Nome"
            required
          />
          <v-text-field
            v-model="facility.description"
            label="Descrição"
          />
          <v-text-field
            v-model="facility.type"
            label="Tipo"
            required
          />
          <v-text-field
            v-model="facility.latitude"
            label="Latitude"
            type="number"
            required
          />
          <v-text-field
            v-model="facility.longitude"
            label="Longitude"
            type="number"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="gray"
            @click="dialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveFacility"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import {ref, computed} from "vue";

export default {
  name: "FacilitiesPage",
  setup() {
    const search = ref("");
    const dialog = ref(false);
    const editMode = ref(false);
    const facility = ref({id: null, name: "", description: "", type: "", latitude: "", longitude: ""});

    const facilities = ref([
      {id: 1, name: "Hospital A", description: "Emergência 24h", type: "Hospital", latitude: -23.55, longitude: -46.63},
      {id: 2, name: "Escola B", description: "Ensino Fundamental", type: "Escola", latitude: -22.90, longitude: -47.06},
      {
        id: 3,
        name: "Shopping C",
        description: "Centro Comercial",
        type: "Shopping",
        latitude: -23.56,
        longitude: -46.65
      }
    ]);

    const headers = [
      {title: "Nome", key: "name"},
      {title: "Descrição", key: "description"},
      {title: "Tipo", key: "type"},
      {title: "Latitude", key: "latitude"},
      {title: "Longitude", key: "longitude"},
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

    const saveFacility = () => {
      if (editMode.value) {
        const index = facilities.value.findIndex(f => f.id === facility.value.id);
        facilities.value[index] = {...facility.value};
      } else {
        facility.value.id = facilities.value.length + 1;
        facilities.value.push({...facility.value});
      }
      dialog.value = false;
    };

    const deleteFacility = (item) => {
      facilities.value = facilities.value.filter(f => f.id !== item.id);
    };

    return {
      search,
      dialog,
      facility,
      facilities,
      headers,
      filteredFacilities,
      openDialog,
      editFacility,
      saveFacility,
      deleteFacility,
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
