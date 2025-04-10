<template>
  <v-row class="align-center mb-4 flex-grow-0">
    <v-col cols="6">
      <v-text-field
        v-model="search"
        :label="searchPlaceholder"
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
        @click="$emit('add')"
      >
        {{ addButtonText }}
      </v-btn>
    </v-col>
  </v-row>

  <v-row class="flex-grow-1 overflow-auto">
    <v-data-table
      :items="filteredItems"
      :headers="headers"
      items-per-page="5"
      class="full-height transparent-background"
    >
      <template #[`item.actions`]="{ item }">
        <v-tooltip text="Editar">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              color="blue"
              size="x-small"
              class="mr-2"
              @click="$emit('edit', item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip :text="item.active ? 'Desativar' : 'Ativar'">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              :color="item.active ? 'orange' : 'green'"
              size="x-small"
              class="mr-2"
              @click="$emit('toggle', item)"
            >
              <v-icon>{{ item.active ? 'mdi-cancel' : 'mdi-check-circle' }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip
          v-if="showMapButton"
          text="Abrir no Mapa"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              color="green"
              size="x-small"
              @click="$emit('map', item)"
            >
              <v-icon>mdi-map-marker</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <template #[`item.value`]="{ item }">
        {{ formatCurrency(item.value) }}
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
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

const props = defineProps<{
  searchPlaceholder: string
  addButtonText: string
  showMapButton?: boolean
  tableItems: any[]
  headers: any[]
}>();
defineEmits(["add", "edit", "toggle", "map"]);
const search = ref("");

const filteredItems = computed(() =>
  props.tableItems.filter(f =>
    f.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
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
