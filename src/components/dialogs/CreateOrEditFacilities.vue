<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="800px"
    @update:model-value="handleDialogClose"
  >
    <v-card>
      <v-toolbar color="primary" dark density="compact">
        <v-toolbar-title>
          {{ editMode ? "Editar Estabelecimento" : "Adicionar Estabelecimento" }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="handleCancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

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

        <p class="text-caption mb-1">Arraste o marcador dentro da área delimitada para definir a localização *:</p>
        <GoogleMap
          :api-key="googleMapsApiKey"
          :center="mapCenter"
          :max-zoom="20"
          :min-zoom="16"
          :street-view-control="false"
          :map-type-control="false"
          :restriction="mapRestrictions"
          map-type-id="satellite"
          :zoom="18"
          style="width: 100%; height: 350px"
          ref="mapRef"
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

const MAP_BOUNDS = {
  north: -25.1480,
  south: -25.1680,
  east: -54.2900,
  west: -54.3100,
};

const DEFAULT_COORDS: LatLngLiteral = {
  lat: (MAP_BOUNDS.north + MAP_BOUNDS.south) / 2,
  lng: (MAP_BOUNDS.east + MAP_BOUNDS.west) / 2,
};


const props = defineProps<{
  modelValue: boolean;
  facility: Facility | null;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const facilityTypes = [
  {text: 'Loja', value: 'store'},
  {text: 'Atração', value: 'attraction'},
  {text: 'Outro', value: 'other'}
];

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
      .min(MAP_BOUNDS.south, `Latitude fora da área permitida (mín: ${MAP_BOUNDS.south.toFixed(4)})`)
      .max(MAP_BOUNDS.north, `Latitude fora da área permitida (máx: ${MAP_BOUNDS.north.toFixed(4)})`)
      .required("Latitude é obrigatória")
      .nullable(),
    longitude: yup
      .number()
      .typeError("Longitude inválida")
      .min(MAP_BOUNDS.west, `Longitude fora da área permitida (mín: ${MAP_BOUNDS.west.toFixed(4)})`)
      .max(MAP_BOUNDS.east, `Longitude fora da área permitida (máx: ${MAP_BOUNDS.east.toFixed(4)})`)
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
const mapCenter = ref<LatLngLiteral>({...DEFAULT_COORDS});
const markerPosition = ref<LatLngLiteral>({...DEFAULT_COORDS});

const mapRestrictions = {
  latLngBounds: MAP_BOUNDS,
  strictBounds: true,
};

const markerOptions = computed(() => ({
  position: markerPosition.value,
  draggable: true,
  title: values.name || 'Estabelecimento',
}));

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const updateMapVisuals = (coords: LatLngLiteral | null) => {
  let position = coords ?? {...DEFAULT_COORDS};

  position.lat = clamp(position.lat, MAP_BOUNDS.south, MAP_BOUNDS.north);
  position.lng = clamp(position.lng, MAP_BOUNDS.west, MAP_BOUNDS.east);

  markerPosition.value = position;
  mapCenter.value = position;

  if (mapRef.value?.map) {
    mapRef.value.map.panTo(position);
  }
};

const setFormDataAndMap = (facilityData: Facility | null) => {
  let initialLat = props.editMode ? facilityData?.latitude : DEFAULT_COORDS.lat;
  let initialLng = props.editMode ? facilityData?.longitude : DEFAULT_COORDS.lng;

  if (initialLat !== null && initialLng !== null) {
    initialLat = clamp(initialLat, MAP_BOUNDS.south, MAP_BOUNDS.north);
    initialLng = clamp(initialLng, MAP_BOUNDS.west, MAP_BOUNDS.east);
  } else {
    initialLat = DEFAULT_COORDS.lat;
    initialLng = DEFAULT_COORDS.lng;
  }

  const initialValues: Facility = {
    id: props.editMode ? facilityData?.id : undefined,
    name: props.editMode ? facilityData?.name ?? '' : '',
    description: props.editMode ? facilityData?.description ?? '' : '',
    type: props.editMode ? facilityData?.type ?? null : null,
    latitude: initialLat,
    longitude: initialLng,
    inactive: props.editMode ? facilityData?.inactive ?? false : false,
  };

  resetForm({values: initialValues});

  updateMapVisuals(
    initialValues.latitude && initialValues.longitude
      ? {lat: initialValues.latitude, lng: initialValues.longitude}
      : null
  );
};

const handleMarkerDragEnd = (event: any) => {
  if (event.latLng) {
    let newLat = event.latLng.lat();
    let newLng = event.latLng.lng();

    newLat = clamp(newLat, MAP_BOUNDS.south, MAP_BOUNDS.north);
    newLng = clamp(newLng, MAP_BOUNDS.west, MAP_BOUNDS.east);

    setFieldValue('latitude', newLat, true);
    setFieldValue('longitude', newLng, true);

    markerPosition.value = {lat: newLat, lng: newLng};

    if (mapRef.value?.map) {
      mapRef.value.map.panTo({lat: newLat, lng: newLng});
    }
  }
};

const onSubmit = handleSubmit(async (formData) => {
  submitError.value = null;
  try {
    const dataToSave = {...formData};

    if (dataToSave.id === undefined) {
      delete dataToSave.id;
    }

    if (dataToSave.latitude === null || dataToSave.longitude === null) {
      submitError.value = "Localização inválida.";
      return;
    }

    dataToSave.latitude = Number(dataToSave.latitude);
    dataToSave.longitude = Number(dataToSave.longitude);

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
    setFormDataAndMap(props.facility);

    setTimeout(() => {
      if (mapRef.value?.map) {
        const currentCoords = (values.latitude !== null && values.longitude !== null)
          ? {lat: values.latitude, lng: values.longitude}
          : {...DEFAULT_COORDS};

        const panToLat = clamp(currentCoords.lat, MAP_BOUNDS.south, MAP_BOUNDS.north);
        const panToLng = clamp(currentCoords.lng, MAP_BOUNDS.west, MAP_BOUNDS.east);

        mapRef.value.map.panTo({lat: panToLat, lng: panToLng});
      }
    }, 150);
  }
}, {immediate: true});


</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
