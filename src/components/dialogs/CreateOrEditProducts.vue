<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="600px"
    @update:model-value="handleDialogClose"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
        density="compact"
      >
        <v-toolbar-title>
          {{ editMode ? "Editar Produto" : "Adicionar Produto" }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          dark
          @click="handleCancel"
        >
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

        <v-text-field
          v-model.number="price"
          label="Preço *"
          :error-messages="errors.price"
          required
          type="number"
          prefix="R$"
          step="0.01"
          class="mb-3"
          @blur="handleBlur('price')"
        />

        <v-select
          v-model="facilityId"
          :items="facilitiesList"
          item-title="name"
          item-value="id"
          label="Estabelecimento *"
          :error-messages="errors.facilityId || facilitiesError"
          :loading="facilitiesLoading"
          required
          class="mb-3"
          @update:model-value="setFieldValue('facilityId', $event, true)"
          @blur="handleBlur('facilityId')"
        />

        <v-alert
          v-if="submitError"
          type="error"
          density="compact"
          class="mt-4"
        >
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
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!meta.valid || isSubmitting || facilitiesLoading"
          :loading="isSubmitting"
          @click="onSubmit"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {ref, watch} from "vue";
import * as yup from "yup";
import {useForm, useField} from 'vee-validate';
import {toTypedSchema} from '@vee-validate/yup';
import {getFacilities} from '@/services/facilitiesService.js';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number | null;
  facilityId: number | null;
  active?: boolean;
}

interface FacilityInfo {
  id: number;
  name: string;
}

const props = defineProps<{
  modelValue: boolean;
  product: Product | null;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const facilitiesList = ref<FacilityInfo[]>([]);
const facilitiesLoading = ref(false);
const facilitiesError = ref<string | null>(null);

const validationSchema = toTypedSchema(
  yup.object({
    id: yup.number().optional(),
    name: yup
      .string()
      .min(2, "Nome muito curto (mínimo 2 caracteres)")
      .max(40, "Nome muito longo (máximo 40 caracteres)")
      .required("Nome é obrigatório"),
    description: yup
      .string()
      .min(10, "Descrição muito curta (mínimo 10 caracteres)")
      .max(100, "Descrição muito longa (máximo 100 caracteres)")
      .required("Descrição é obrigatória"),
    price: yup
      .number()
      .transform((value, originalValue) => {
        return String(originalValue).trim() === '' ? null : value;
      })
      .typeError("Preço deve ser um número")
      .min(0, "Preço não pode ser negativo")
      .max(99999999.99, "Preço muito alto (máx 99.999.999,99)")
      .required("Preço é obrigatório")
      .nullable(),
    facilityId: yup
      .number()
      .typeError("Estabelecimento inválido")
      .min(1, "Estabelecimento inválido")
      .required("Estabelecimento é obrigatório")
      .nullable(),
    active: yup
      .boolean()
      .optional()
      .default(true),
  })
);

const {
  handleSubmit,
  errors,
  setFieldValue,
  meta,
  resetForm,
  isSubmitting,
} = useForm<Product>({
  validationSchema,
});

const {value: name, handleBlur: handleNameBlur} = useField<string>('name');
const {value: description, handleBlur: handleDescriptionBlur} = useField<string>('description');
const {value: price, handleBlur: handlePriceBlur} = useField<number | null>('price');
const {value: facilityId, handleBlur: handleFacilityIdBlur} = useField<number | null>('facilityId');

const handleBlur = (fieldName: keyof Product) => {
  switch (fieldName) {
    case 'name':
      handleNameBlur();
      break;
    case 'description':
      handleDescriptionBlur();
      break;
    case 'price':
      handlePriceBlur();
      break;
    case 'facilityId':
      handleFacilityIdBlur();
      break;
  }
};

const submitError = ref<string | null>(null);

const fetchFacilities = async () => {
  if (facilitiesList.value.length > 0) return;

  facilitiesLoading.value = true;
  facilitiesError.value = null;
  try {
    const response = await getFacilities();

    facilitiesList.value = response.data.map(f => ({id: f.id, name: f.name}));
    if (facilitiesList.value.length === 0) {
      facilitiesError.value = "Nenhum estabelecimento encontrado.";
    }

  } catch (error: any) {
    console.error("Failed to fetch facilities:", error);
    facilitiesError.value = `Erro ao carregar estabelecimentos: ${error?.message || 'Erro desconhecido'}`;
    facilitiesList.value = [];
  } finally {
    facilitiesLoading.value = false;
  }
};

const setFormData = (productData: Product | null) => {
  const initialValues: Product = {
    id: props.editMode ? productData?.id : undefined,
    name: props.editMode ? productData?.name ?? '' : '',
    description: props.editMode ? productData?.description ?? '' : '',
    price: props.editMode ? productData?.price ?? null : null,
    facilityId: props.editMode ? productData?.facilityId ?? null : null,
    active: props.editMode ? productData?.active ?? true : true,
  };
  resetForm({values: initialValues});
};

const onSubmit = handleSubmit(async (formData) => {
  submitError.value = null;
  try {
    const dataToSave = {
      ...formData,
      price: Number(formData.price ?? 0)
    };

    if (dataToSave.id === undefined) {
      delete dataToSave.id;
    }
    emit("save", dataToSave);
  } catch (error) {
    console.error("Submission error:", error);
    submitError.value = "Ocorreu um erro ao salvar o produto. Tente novamente.";
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
    submitError.value = null;
  }
}

watch(
  () => props.product,
  (newProduct) => {
    if (props.modelValue) {
      setFormData(newProduct);
    }
  },
  {deep: true, immediate: true}
);

watch(() => props.modelValue, (isVisible) => {
  submitError.value = null;
  if (isVisible) {
    fetchFacilities();
    setFormData(props.product);
  }
});
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
