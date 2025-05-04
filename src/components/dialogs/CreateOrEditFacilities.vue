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
        <!-- Basic Info Fields -->
        <v-text-field
          v-model="localFacility.name"
          label="Nome"
          required
          class="mb-3"
        />
        <v-text-field
          v-model="localFacility.description"
          label="Descrição"
          class="mb-3"
        />
        <v-select
          v-model="localFacility.type"
          :items="facilityTypes"
          item-title="text"
          item-value="value"
          label="Tipo"
          required
          class="mb-3"
        />

        <!-- Google Map Integration -->
        <p class="text-caption mb-1">Arraste o marcador para definir a localização:</p>
        <GoogleMap
          :api-key="googleMapsApiKey"
          :center="mapCenter"
          :zoom="15"
          style="width: 100%; height: 400px"
          ref="mapRef"
          @center_changed="handleCenterChange"
        >
          <Marker
            :options="markerOptions"
            @dragend="handleMarkerDragEnd"
          />
        </GoogleMap>

        <!-- Display Lat/Lng (Optional) -->
        <v-row class="mt-3">
          <v-col cols="6">
            <v-text-field
              v-model.number="localFacility.latitude"
              label="Latitude"
              type="number"
              read-only
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="localFacility.longitude"
              label="Longitude"
              type="number"
              read-only
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>

      </v-card-text>
      <v-card-actions>
        <v-btn
          color="grey"
          variant="text"
          @click="$emit('cancel')"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          @click="emitSave"
          :disabled="!isDataValid"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {reactive, watch, ref, computed, onMounted} from "vue";
import {GoogleMap, Marker} from "vue3-google-map";

interface Facility {
  id?: number;
  name: string;
  description: string;
  type: string | null;
  latitude: number | null;
  longitude: number | null;
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
const googleMapsApiKey = 'GOOGLE-MAPS-API-KEY';

const localFacility = reactive<Facility>({
  name: '',
  description: '',
  type: null,
  latitude: null,
  longitude: null,
  ...props.facility
});

const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const mapCenter = ref<LatLngLiteral>(DEFAULT_COORDS);
const markerPosition = ref<LatLngLiteral>(DEFAULT_COORDS);

const facilityTypes = [
  {text: 'Loja', value: 'store'},
  {text: 'Atração', value: 'attraction'},
  {text: 'Outro', value: 'other'}
];

const markerOptions = computed(() => ({
  position: markerPosition.value,
  draggable: true,
  title: localFacility.name || 'Estabelecimento',
}));

const isDataValid = computed(() => {
  return localFacility.name &&
    localFacility.type &&
    localFacility.latitude !== null &&
    localFacility.longitude !== null;
});

const updateMapAndMarkerPosition = (facilityData: Facility | null) => {
  console.log("updateMapAndMarkerPosition")
  let coords: LatLngLiteral;
  if (props.editMode && facilityData?.latitude != null && facilityData?.longitude != null) {
    coords = {lat: facilityData.latitude, lng: facilityData.longitude};
  } else {
    coords = DEFAULT_COORDS;
    if (!localFacility.latitude && !localFacility.longitude) {
      localFacility.latitude = coords.lat;
      localFacility.longitude = coords.lng;
    }
  }
  markerPosition.value = coords;
  mapCenter.value = coords;
};

const handleMarkerDragEnd = (event: any) => {
  if (event.latLng) {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    localFacility.latitude = newLat;
    localFacility.longitude = newLng;
    markerPosition.value = {lat: newLat, lng: newLng};
    mapCenter.value = {lat: newLat, lng: newLng};
  }
};

const handleCenterChange = (newCenter: LatLngLiteral) => {
  mapCenter.value = newCenter;
};

const emitSave = () => {
  if (isDataValid.value) {
    emit("save", {...localFacility});
  } else {
    console.warn("Save attempt with invalid data:", localFacility);
  }
};

watch(() => props.facility, (newVal) => {
  console.log(newVal)

  const initialData: Facility = {
    name: newVal?.name ?? '',
    description: newVal?.description ?? '',
    type: newVal?.type ?? null,
    latitude: newVal?.latitude ?? null,
    longitude: newVal?.longitude ?? null,
    ...(newVal?.id && {id: newVal.id})
  };

  Object.assign(localFacility, initialData);

  updateMapAndMarkerPosition(newVal);

}, {deep: true, immediate: true});

watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    mapCenter.value = markerPosition.value;
    setTimeout(() => {
      mapRef.value?.map?.panTo(markerPosition.value);
    }, 100);
  }
});

onMounted(() => {
  updateMapAndMarkerPosition(props.facility);
});
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
