<template>
  <v-dialog
    v-model="showDialog"
    max-width="1000px"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Localização no Google Maps</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="showDialog = false"
        />
      </v-card-title>

      <v-card-text>
        <v-skeleton-loader
          v-if="isLoading"
          class="skeleton-loader"
        />

        <iframe
          v-show="!isLoading"
          v-if="latitude && longitude"
          :src="`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`"
          width="100%"
          height="600"
          style="border:0;"
          allowfullscreen
          loading="lazy"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from "vue";

export default defineComponent({
  props: {
    modelValue: Boolean,
    latitude: {
      type: String,
      default: 0
    },
    longitude: {
      type: String,
      default: 0
    },
  },
  emits: ["update:modelValue"],
  setup(props, {emit}) {
    const showDialog = ref(props.modelValue);
    const isLoading = ref(true);

    watch(() => props.modelValue, (newValue) => {
      showDialog.value = newValue;
      if (newValue) {
        isLoading.value = true;

        setTimeout(() => {
          isLoading.value = false;
        }, 1000);
      }
    });

    watch(showDialog, (newValue) => {
      emit("update:modelValue", newValue);
    });

    return {showDialog, isLoading};
  }
});
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
  height: 600px;
}
</style>
