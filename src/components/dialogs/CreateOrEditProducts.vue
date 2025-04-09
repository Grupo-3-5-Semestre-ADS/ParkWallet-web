<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    max-width="800px"
  >
    <v-card>
      <v-card-title>
        {{ editMode ? "Editar Produto" : "Adicionar Produto" }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="localProduct.name"
          label="Nome"
          required
        />
        <v-text-field
          v-model="localProduct.description"
          label="Descrição"
        />
        <v-text-field
          v-model="localProduct.value"
          label="Valor"
          type="number"
          required
        />
      </v-card-text>
      <v-card-actions>
        <v-btn color="gray" @click="$emit('cancel')">Cancelar</v-btn>
        <v-btn color="primary" @click="emitSave">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {reactive, watch} from "vue";

const props = defineProps<{
  modelValue: boolean;
  product: any;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const localProduct = reactive({...props.product});

watch(() => props.product, (newVal) => {
  Object.assign(localProduct, newVal);
}, {deep: true});

const emitSave = () => {
  emit("save", {...localProduct});
};
</script>
