<template>
  <!-- Search Row -->
  <v-row class="align-center mb-4 flex-grow-0">
    <v-col cols="6">
      <v-text-field
        v-model="search"
        :label="searchPlaceholder"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        placeholder="Filtrar resultados carregados..."
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

  <v-row class="flex-grow-1">
    <v-data-table
      :items="filteredItems"
      :headers="headers"
      :loading="props.loading && filteredItems.length === 0"
      :search="search"
      item-value="id"
      class="full-height transparent-background"
      hide-default-footer
      fixed-header
      height="500px"
      loading-text="Carregando dados iniciais..."
      no-data-text="Nenhum dado disponível"
      :items-per-page="-1"
    >
      <template #[`item.actions`]="{ item }">
        <div class="buttons-actions">
          <v-tooltip text="Editar">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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

          <v-tooltip :text="item.inactive ? 'Ativar' : 'Desativar'">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                :color="item.inactive ? 'green' : 'orange'"
                size="x-small"
                class="mr-2"
                @click="$emit('toggle', item)"
              >
                <v-icon>{{ item.inactive ? 'mdi-check-circle' : 'mdi-cancel' }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip
            v-if="showMapButton"
            text="Abrir no Mapa"
          >
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                color="green"
                size="x-small"
                @click="$emit('map', item)"
              >
                <v-icon>mdi-map-marker</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>

      <template #[`item.value`]="{ item }">
        {{ formatCurrency(item.value) }}
      </template>

      <template #[`item.inactive`]="{ item }">
        <v-chip
          :color="item.inactive ? 'red' : 'green'"
          text-color="white"
          small
          label
        >
          {{ item.inactive ? 'Inativo' : 'Ativo' }}
        </v-chip>
      </template>

      <template #tfoot>
        <div class="text-center pa-4">
          <v-progress-circular
            v-if="props.loading && filteredItems.length > 0"
            indeterminate
            color="primary"
            size="24"
            class="mb-1"
          ></v-progress-circular>

          <div
            v-intersect.quiet="onIntersect"
            style="height: 1px;"
          ></div>
        </div>
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
  loading: boolean
}>();

const emit = defineEmits(["add", "edit", "toggle", "map", "load-more"]);

const search = ref("");

const filteredItems = computed(() => {
  if (!search.value) {
    return props.tableItems;
  }
  const searchTerm = search.value.toLowerCase();
  return props.tableItems.filter(item =>
    (item.name && item.name.toLowerCase().includes(searchTerm)) ||
    (item.description && item.description.toLowerCase().includes(searchTerm)) ||
    (item.type && item.type.toLowerCase().includes(searchTerm))
  );
});

const onIntersect = (isIntersecting: boolean, entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  if (isIntersecting && !props.loading) {
    emit('load-more');
  }
};

function formatCurrency(value: number | string | undefined | null): string {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return '';
  }
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
</script>

<style scoped>
.text-right {
  text-align: right;
}

.full-height {
  height: 100%;
}

.transparent-background {
  background-color: transparent;
}

.buttons-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr:last-child > td > .v-data-table__bottom,
.v-data-table .v-data-table__bottom {
  min-height: 48px;
}
</style>
