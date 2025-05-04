<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="800px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>
        {{ editMode ? "Editar Estabelecimento" : "Adicionar Estabelecimento" }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="localFacility.name"
          label="Nome"
          required
        />
        <v-text-field
          v-model="localFacility.description"
          label="Descrição"
        />
        <v-select
          v-model="localFacility.type"
          :items="facilityTypes"
          item-title="text"
          item-value="value"
          label="Tipo"
          required
        />
        <v-text-field
          v-model="localFacility.latitude"
          label="Latitude"
          type="number"
          required
        />
        <v-text-field
          v-model="localFacility.longitude"
          label="Longitude"
          type="number"
          required
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="gray"
          @click="$emit('cancel')"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="emitSave"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {reactive, watch} from "vue";

const props = defineProps<{
  modelValue: boolean;
  facility: any;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const localFacility = reactive({...props.facility});

const facilityTypes = [
  { text: 'Loja', value: 'store' },
  { text: 'Atração', value: 'attraction' },
  { text: 'Outro', value: 'other' }
];

watch(() => props.facility, (newVal) => {
  Object.assign(localFacility, newVal);
}, {deep: true});

const emitSave = () => {
  emit("save", {...localFacility});
};
</script>
