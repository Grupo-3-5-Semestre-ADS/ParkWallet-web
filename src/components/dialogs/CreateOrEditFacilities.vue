<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="800px"
    @update:model-value="handleDialogClose"
  >
    <v-card>
      <v-card-title>
        {{ editMode ? "Editar Estabelecimento" : "Adicionar Estabelecimento" }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Nome *"
          :error-messages="errors.name"
          required
          class="mb-3"
          @blur="handleBlur('name')"
        />
        <v-textarea
          v-model="description"
          label="Descrição *"
          :error-messages="errors.description"
          required
          class="mb-3"
          rows="3"
          auto-grow
          @blur="handleBlur('description')"
        />
        <v-select
          v-model="type"
          :items="facilityTypes"
          item-title="text"
          item-value="value"
          label="Tipo *"
          :error-messages="errors.type"
          required
          class="mb-3"
          @update:modelValue="setFieldValue('type', $event)"
          @blur="handleBlur('type')"
        />

        <!-- Google Map Integration -->
        <p class="text-caption mb-1">Arraste o marcador para definir a localização *:</p>
        <GoogleMap
          :api-key="googleMapsApiKey"
          :center="mapCenter"
          :zoom="15"
          style="width: 100%; height: 350px"
          ref="mapRef"
          @center_changed="handleCenterChange"
        >
          <Marker
            :options="markerOptions"
            @dragend="handleMarkerDragEnd"
          />
        </GoogleMap>
        <v-row class="mt-1">
          <v-col cols="6">
            <v-text-field
              :model-value="latitude"
              label="Latitude *"
              type="number"
              read-only
              variant="outlined"
              density="compact"
              :error-messages="errors.latitude"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="longitude"
              label="Longitude *"
              type="number"
              read-only
              variant="outlined"
              density="compact"
              :error-messages="errors.longitude"
              hide-details="auto"
            />
          </v-col>
        </v-row>
        <!-- Optional: Display general form error -->
        <v-alert v-if="submitError" type="error" density="compact" class="mt-4">
          {{ submitError }}
        </v-alert>

      </v-card-text>
      <v-card-actions>
        <v-btn
          color="grey"
          variant="text"
          @click="handleCancel"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          @click="onSubmit"
          :disabled="!meta.valid || isSubmitting"
          :loading="isSubmitting"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {watch, ref, computed} from "vue";
import {GoogleMap, Marker} from "vue3-google-map";
import * as yup from "yup";
import {useForm, useField} from 'vee-validate';
import {toTypedSchema} from '@vee-validate/yup';

interface Facility {
  id?: number;
  name: string;
  description: string;
  type: 'store' | 'attraction' | 'other' | null;
  latitude: number | null;
  longitude: number | null;
  inactive?: boolean;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

const props = defineProps<{
  modelValue: boolean;
  facility: Facility | null;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const DEFAULT_COORDS: LatLngLiteral = {lat: -25.15880528152051, lng: -54.30024966327881};
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const facilityTypes = [
  {text: 'Loja', value: 'store'},
  {text: 'Atração', value: 'attraction'},
  {text: 'Outro', value: 'other'}
];

// --- Validation Schema ---
const validationSchema = toTypedSchema(
  yup.object({
    id: yup.number().optional(),
    name: yup
      .string()
      .min(2, "Nome muito curto (mínimo 2 caracteres)")
      .max(200, "Nome muito longo (máximo 200 caracteres)")
      .required("Nome é obrigatório"),
    description: yup
      .string()
      .min(10, "Descrição muito curta (mínimo 10 caracteres)")
      .max(2000, "Descrição muito longa (máximo 2000 caracteres)")
      .required("Descrição é obrigatória"),
    type: yup
      .string()
      .oneOf(["store", "attraction", "other"], "Tipo inválido")
      .required("Tipo é obrigatório")
      .nullable(),
    latitude: yup
      .number()
      .typeError("Latitude inválida")
      .min(-90, "Latitude inválida (mín: -90)")
      .max(90, "Latitude inválida (máx: 90)")
      .required("Latitude é obrigatória")
      .nullable(),
    longitude: yup
      .number()
      .typeError("Longitude inválida")
      .min(-180, "Longitude inválida (mín: -180)")
      .max(180, "Longitude inválida (máx: 180)")
      .required("Longitude é obrigatória")
      .nullable(),
    inactive: yup.boolean().optional().default(false),
  })
);

const {
  handleSubmit,
  errors,
  setFieldValue,
  meta,
  resetForm,
  isSubmitting,
  values
} = useForm<Facility>({
  validationSchema,
});

const {value: name, handleBlur: handleNameBlur} = useField<string>('name');
const {value: description, handleBlur: handleDescriptionBlur} = useField<string>('description');
const {value: type, handleBlur: handleTypeBlur} = useField<Facility['type']>('type');
const {value: latitude, handleBlur: handleLatitudeBlur} = useField<number | null>('latitude');
const {value: longitude, handleBlur: handleLongitudeBlur} = useField<number | null>('longitude');

const handleBlur = (fieldName: keyof Facility) => {
  switch (fieldName) {
    case 'name':
      handleNameBlur();
      break;
    case 'description':
      handleDescriptionBlur();
      break;
    case 'type':
      handleTypeBlur();
      break;
    case 'latitude':
      handleLatitudeBlur();
      break;
    case 'longitude':
      handleLongitudeBlur();
      break;
  }
};

const submitError = ref<string | null>(null);

const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const mapCenter = ref<LatLngLiteral>(DEFAULT_COORDS);
const markerPosition = ref<LatLngLiteral>(DEFAULT_COORDS);

const markerOptions = computed(() => ({
  position: markerPosition.value,
  draggable: true,
  title: values.name || 'Estabelecimento',
}));

const updateMapVisuals = (coords: LatLngLiteral | null) => {
  const position = coords ?? DEFAULT_COORDS;
  markerPosition.value = position;
  mapCenter.value = position;

  if (mapRef.value?.map) {
    mapRef.value.map.panTo(position);
  }
};

const setFormDataAndMap = (facilityData: Facility | null) => {
  const initialValues: Facility = {
    id: props.editMode ? facilityData?.id : undefined,
    name: props.editMode ? facilityData?.name ?? '' : '',
    description: props.editMode ? facilityData?.description ?? '' : '',
    type: props.editMode ? facilityData?.type ?? null : null,
    latitude: props.editMode ? facilityData?.latitude ?? DEFAULT_COORDS.lat : DEFAULT_COORDS.lat,
    longitude: props.editMode ? facilityData?.longitude ?? DEFAULT_COORDS.lng : DEFAULT_COORDS.lng,
    inactive: props.editMode ? facilityData?.inactive ?? false : false,
  };

  resetForm({values: initialValues});

  updateMapVisuals(initialValues.latitude && initialValues.longitude
    ? {lat: initialValues.latitude, lng: initialValues.longitude}
    : null
  );
};

const handleMarkerDragEnd = (event: any) => {
  if (event.latLng) {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    setFieldValue('latitude', newLat, true);
    setFieldValue('longitude', newLng, true);

    markerPosition.value = {lat: newLat, lng: newLng};
  }
};

const handleCenterChange = (newCenter: LatLngLiteral) => {
  mapCenter.value = newCenter;
};

const onSubmit = handleSubmit(async (formData) => {
  submitError.value = null;
  try {
    const dataToSave = {...formData};
    if (dataToSave.id === undefined) {
      delete dataToSave.id;
    }
    emit("save", dataToSave);
  } catch (error) {
    console.error("Submission error:", error);
    submitError.value = "Ocorreu um erro ao salvar. Tente novamente.";
  }
}, () => {
  submitError.value = "Por favor, corrija os erros no formulário.";
});

const handleCancel = () => {
  emit('cancel');
};

const handleDialogClose = (value: boolean) => {
  emit('update:modelValue', value)
  if (!value) {
    resetForm();
  }
}

watch(
  () => props.facility,
  (newFacility) => {
    if (props.modelValue) {
      setFormDataAndMap(newFacility);
    }
  },
  {deep: true, immediate: true}
);

watch(() => props.modelValue, (isVisible) => {
  submitError.value = null;
  if (isVisible) {
    const currentCoords = values.latitude && values.longitude
      ? {lat: values.latitude, lng: values.longitude}
      : DEFAULT_COORDS;

    updateMapVisuals(currentCoords);

    setTimeout(() => {
      if (mapRef.value?.map) {
        mapRef.value.map.panTo(currentCoords);
      }
    }, 150);
  }
});
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
