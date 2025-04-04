<template>
  <v-dialog
    v-model="isOpen"
    persistent
    max-width="400px"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-btn
          color="gray"
          @click="cancel"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="red"
          @click="confirm"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from "vue";

export default defineComponent({
  props: {
    modelValue: Boolean, // Controle do diálogo
    title: {
      type: String,
      default: "Confirmar ação",
    },
    message: {
      type: String,
      default: "Tem certeza que deseja continuar?",
    },
  },
  emits: ["update:modelValue", "confirm"],
  setup(props, {emit}) {
    const isOpen = ref(props.modelValue);

    watch(() => props.modelValue, (newValue) => {
      isOpen.value = newValue;
    });

    const cancel = () => {
      emit("update:modelValue", false);
    };

    const confirm = () => {
      emit("confirm");
      emit("update:modelValue", false);
    };

    return {isOpen, cancel, confirm};
  },
});
</script>
