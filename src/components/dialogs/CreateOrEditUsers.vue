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
          {{ editMode ? "Editar Usuário" : "Adicionar Usuário" }}
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
        <v-text-field
          v-model="email"
          label="E-mail *"
          type="email"
          :error-messages="errors.email"
          required
          class="mb-3"
          @blur="handleBlur('email')"
        />
        <v-text-field
          v-model="cpf"
          label="CPF"
          :error-messages="errors.cpf"
          class="mb-3"
          @blur="handleBlur('cpf')"
        />
        <v-text-field
          v-model="birthdate"
          label="Data de Nascimento *"
          type="date"
          :error-messages="errors.birthdate"
          required
          class="mb-3"
          placeholder="YYYY-MM-DD"
          @blur="handleBlur('birthdate')"
        />
        <v-select
          v-model="selectedRoles"
          :items="rolesList"
          item-title="name"
          item-value="name"
          label="Permissões"
          multiple
          chips
          clearable
          :error-messages="errors.roles || rolesError"
          :loading="rolesLoading"
          class="mb-3"
          @blur="handleBlur('roles')"
        />

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
          :disabled="!meta.valid || isSubmitting || rolesLoading"
          :loading="isSubmitting"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {ref, watch, computed} from "vue";
import * as yup from "yup";
import {useForm, useField} from 'vee-validate';
import {toTypedSchema} from '@vee-validate/yup';
import {getRoles} from '@/services/rolesService.js';

interface User {
  id?: number;
  name: string;
  email: string;
  cpf?: string;
  birthdate: string;
  inactive?: boolean;
  roles?: string[];
}

interface RoleInfo {
  id: number | string;
  name: string;
}

const props = defineProps<{
  modelValue: boolean;
  user: User | null;
  editMode: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const rolesList = ref<RoleInfo[]>([]);
const rolesLoading = ref(false);
const rolesError = ref<string | null>(null);

const createUserSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo")
    .required("Nome é obrigatório"),
  email: yup
    .string()
    .email("Formato de e-mail inválido")
    .required("E-mail é obrigatório"),
  cpf: yup
    .string()
    .length(11, "CPF deve ter 11 dígitos")
    .matches(/^\d+$/, "CPF deve conter apenas dígitos")
    .optional()
    .nullable(),
  birthdate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD")
    .required("Data de nascimento é obrigatória"),
  roles: yup
    .array()
    .of(yup.string())
    .optional(),
  inactive: yup
    .boolean()
    .optional()
    .default(false),
});

const currentValidationSchema = computed(() => {
  return toTypedSchema(createUserSchema);
});

const {
  handleSubmit,
  errors,
  meta,
  resetForm,
  isSubmitting,
  values,
} = useForm<User>({
  validationSchema: currentValidationSchema,
});

const {value: name, handleBlur: handleNameBlur} = useField<string>('name');
const {value: email, handleBlur: handleEmailBlur} = useField<string>('email');
const {value: cpf, handleBlur: handleCpfBlur} = useField<string | undefined>('cpf');
const {value: birthdate, handleBlur: handleBirthdateBlur} = useField<string>('birthdate');
const {value: selectedRoles, handleBlur: handleRolesBlur} = useField<string[]>('roles');


const handleBlur = (fieldName: keyof User | 'roles') => {
  switch (fieldName) {
    case 'name':
      handleNameBlur();
      break;
    case 'email':
      handleEmailBlur();
      break;
    case 'cpf':
      handleCpfBlur();
      break;
    case 'birthdate':
      handleBirthdateBlur();
      break;
    case 'roles':
      handleRolesBlur();
      break;
  }
};

const submitError = ref<string | null>(null);

const fetchRoles = async () => {
  if (rolesList.value.length > 0 && !props.editMode) return;
  rolesLoading.value = true;
  rolesError.value = null;
  try {
    const response = await getRoles();
    rolesList.value = Array.isArray(response) ? response : (response.data || []);

    if (rolesList.value.length === 0) {
      rolesError.value = "Nenhuma permissão encontrada.";
    }
  } catch (error: any) {
    console.error("Failed to fetch roles:", error);
    rolesError.value = `Erro ao carregar permissões: ${error?.message || 'Erro desconhecido'}`;
    rolesList.value = [];
  } finally {
    rolesLoading.value = false;
  }
};

const setFormData = (userData: User | null) => {
  const roleNames = userData?.roles?.map((role: any) => typeof role === 'string' ? role : role.name) || [];

  const initialValues: User = {
    id: props.editMode ? userData?.id : undefined,
    name: userData?.name ?? '',
    email: userData?.email ?? '',
    cpf: userData?.cpf ?? '',
    birthdate: userData?.birthdate ?? '',
    inactive: userData?.inactive ?? false,
    roles: roleNames,
  };
  resetForm({values: initialValues});
};

const onSubmit = handleSubmit(async (formData) => {
  submitError.value = null;
  try {
    const dataToSave = {...formData};

    if (dataToSave.id === undefined) {
      delete dataToSave.id;
    }

    if (dataToSave.cpf === '') {
      delete dataToSave.cpf;
    }

    emit("save", dataToSave);
  } catch (error) {
    console.error("Submission error:", error);
    submitError.value = "Ocorreu um erro ao salvar o usuário. Tente novamente.";
  }
}, (context) => {
  console.log("Form validation failed:", context.errors);
  submitError.value = "Por favor, corrija os erros no formulário.";
});

const handleCancel = () => {
  emit('cancel');
};

const handleDialogClose = (value: boolean) => {
  emit('update:modelValue', value);
  if (!value) {
    resetForm();
    submitError.value = null;
  }
};

watch(
  () => props.user,
  (newUser) => {
    if (props.modelValue) {
      setFormData(newUser);
    }
  },
  {deep: true, immediate: true}
);

watch(() => props.modelValue, (isVisible) => {
  submitError.value = null;
  if (isVisible) {
    fetchRoles();
    setFormData(props.user);
  }
});

watch(() => props.editMode, () => {
  if (props.modelValue) {
    setFormData(props.user);
  }
});

</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
