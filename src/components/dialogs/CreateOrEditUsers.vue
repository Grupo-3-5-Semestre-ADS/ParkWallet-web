<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="800px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>
        {{ editMode ? "Editar Produto" : "Adicionar Produto" }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="localUser.name"
          label="Nome"
          required
        />
        <v-text-field
          v-model="localUser.cpf"
          label="Descrição"
        />
        <v-text-field
          v-model="localUser.email"
          label="Valor"
          required
        />
        <v-text-field
          v-model="localUser.birthDate"
          label="Valor"
          type="date"
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
  user: any;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const localUser = reactive({...props.user});

watch(() => props.user, (newVal) => {
  Object.assign(localUser, newVal);
}, {deep: true});

const emitSave = () => {
  emit("save", {...localUser});
};
</script>
