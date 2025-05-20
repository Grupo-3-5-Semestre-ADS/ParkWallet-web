<template>
  <!-- Search Row -->
  <v-row class="align-center mb-4 flex-grow-0">
    <v-col
      cols="6"
      v-if="props.showSearch"
    >
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
      v-if="props.showAddButton"
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
      :show-expand="props.showExpand"
    >
      <template #[`item.actions`]="{ item }">
        <div class="buttons-actions">
          <v-tooltip
            v-if="props.showEditButton"
            text="Editar"
          >
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

          <v-tooltip :text="item.active ? 'Desativar' : 'Ativar'">
            <template
              v-if="props.showInactivateButton"
              #activator="{ props: tooltipProps }"
            >
              <v-btn
                v-bind="tooltipProps"
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

          <slot
            name="custom-actions"
            :item="item"
          />
        </div>
      </template>

      <template #[`item.price`]="{ item }">
        {{ formatCurrency(item.price) }}
      </template>

      <template #[`item.type`]="{ item }">
        {{ getTypeName(item.type) }}
      </template>

      <template #[`item.roles`]="{ item }">
        <v-chip
          v-for="role in item.roles"
          :key="role.UserRoles.id"
          color="blue"
          text-color="white"
          small
          label
          class="mr-2"
        >
          {{ role.name }}
        </v-chip>
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          text-color="white"
          small
          label
        >
          {{ getStatusName(item.status) }}
        </v-chip>
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

      <template
        v-if="props.showExpand"
        #expanded-row="{ columns, item }"
      >
        <tr>
          <td :colspan="columns.length">
            <slot
              name="custom-expanded-content"
              :item="item"
            />
          </td>
        </tr>
      </template>

      <template #tfoot>
        <div class="text-center pa-4">
          <v-progress-circular
            v-if="props.loading && filteredItems.length > 0"
            indeterminate
            color="primary"
            size="24"
            class="mb-1"
          />

          <div
            v-intersect.quiet="onIntersect"
            style="height: 1px;"
          />
        </div>
      </template>
    </v-data-table>
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

const props = defineProps<{
  searchPlaceholder: string
  addButtonText?: string
  showAddButton?: boolean
  showSearch?: boolean
  showExpand?: boolean
  showEditButton?: boolean
  showInactivateButton?: boolean
  tableItems: any[]
  headers: any[]
  loading: boolean
}>();

const emit = defineEmits(["add", "edit", "toggle", "map", "load-more", "view-products"]);

const search = ref("");
const expanded = ref<any[]>([]);

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

const onIntersect = (isIntersecting: boolean) => {
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

function getTypeName(type: number | string | undefined | null): string {
  switch (type) {
    case "store":
      return "Loja";

    case "attraction":
      return "Atração";

    case "other":
      return "Outro";
  }
}

function getStatusName(status: number | string | undefined | null): string {
  switch (status) {
    case "pending":
      return "Pendente";

    case "completed":
      return "Concluído";

    case "failed":
      return "Falhou";
  }
}

function getStatusColor(status: number | string | undefined | null): string {
  switch (status) {
    case "pending":
      return "blue";

    case "completed":
      return "green";

    case "failed":
      return "red";
  }
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
