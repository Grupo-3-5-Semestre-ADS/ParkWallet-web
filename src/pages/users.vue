<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <DefaultTable
      search-placeholder="Buscar Usuário"
      add-button-text="Adicionar Usuário"
      :table-items="users"
      :headers="headers"
      :loading="isLoading"
      show-edit-button
      show-inactivate-button
      show-search
      @add="openDialog"
      @edit="editUser"
      @toggle="toggleActive"
      @load-more="loadMoreUsers"
      @search-updated="handleSearch"
    >
      <template #custom-actions="{ item }">
        <v-tooltip
          text="Resetar Senha"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              color="orange"
              size="x-small"
              class="mr-2"
              @click="promptResetPassword(item)"
            >
              <v-icon>mdi-lock-reset</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </DefaultTable>

    <CreateOrEditUsers
      v-model="dialog"
      :user="currentUser"
      :edit-mode="editMode"
      @save="onSaveUser"
      @cancel="confirmClose = true"
    />

    <ConfirmDialog
      v-model="confirmClose"
      title="Confirmar saída"
      message="Tem certeza que deseja sair sem salvar?"
      @confirm="dialog = false"
    />

    <ConfirmDialog
      v-model="confirmResetDialog"
      title="Confirmar Reset de Senha"
      :message="`Tem certeza que deseja resetar a senha do usuário '${userToReset?.name}'?`"
      @confirm="handleConfirmResetPassword"
    />
  </v-container>
</template>

<script lang="ts">
import {inject, onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditUsers from "@/components/dialogs/CreateOrEditUsers.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {
  getUsers,
  updateUser,
  updateUserRole,
  toggleUserActive,
  resetUserPassword
} from "@/services/usersService.js";

interface UserForPage {
  id: number | null;
  name: string;
  email: string;
  cpf?: string;
  birthdate?: string;
  active: boolean;
  password?: string;
  role?: string;
}

export default {
  name: "UsersPage",
  components: {DefaultTable, ConfirmDialog, CreateOrEditUsers},
  setup() {
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);

    const confirmResetDialog = ref(false);
    const userToReset = ref<UserForPage | null>(null);

    const initialUser: UserForPage = {
      id: null, name: "", email: "", cpf: "", birthdate: "", active: true, role: ""
    };
    const currentUser = ref<UserForPage | null>({...initialUser});

    const users = ref<UserForPage[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);
    const currentSearchQuery = ref("");

    const headers = [
      {title: "Nome", key: "name", sortable: false},
      {title: "E-mail", key: "email", sortable: false},
      {title: "CPF", key: "cpf", sortable: false},
      {title: "Data de Nascimento", key: "birthdate", sortable: false},
      {title: "Permissão", key: "role", sortable: false},
      {title: "Ativo", key: "active", sortable: false},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const showSnackbar = inject<(message: string, color?: string) => void>('showSnackbar');

    const fetchUsersPage = async () => {
      if (isLoading.value || allItemsLoaded.value) {
        return;
      }
      isLoading.value = true;

      try {
        const response = await getUsers(currentPage.value, itemsPerPage.value, currentSearchQuery.value);

        if (response && response.data && response._page) {
          const newItems = response.data;

          if (currentPage.value === 1) {
            users.value = newItems;
          } else {
            users.value.push(...newItems);
          }

          if (response._page.current >= response._page.total) {
            allItemsLoaded.value = true;
          } else {
            allItemsLoaded.value = false;
            currentPage.value++;
          }

          if (newItems.length === 0 && response._page.current === response._page.total) {
            allItemsLoaded.value = true;
          }
        } else {
          console.error("Invalid data structure received from API for pagination:", response);

          if (currentPage.value === 1) {
            users.value = [];
          }

          allItemsLoaded.value = true;
        }
      } catch (error) {
        console.error("Failed to fetch users page:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadMoreUsers = () => {
      fetchUsersPage();
    };

    const resetAndLoadData = async () => {
      users.value = [];
      currentPage.value = 1;
      allItemsLoaded.value = false;
      await fetchUsersPage();
    };

    const handleSearch = (searchTerm: string) => {
      currentSearchQuery.value = searchTerm;
      resetAndLoadData();
    };

    const openDialog = () => {
      currentUser.value = {...initialUser};
      editMode.value = false;
      dialog.value = true;
    };

    const editUser = async (item: UserForPage) => {
      currentUser.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveUser = async (formData: UserForPage) => {
      try {
        if (editMode.value && formData.id) {
          const updateStatusCode = await updateUser(formData.id, formData);

          if (updateStatusCode === 200) {
            const originalUser = users.value.find(u => u.id === formData.id);
            const originalRoleName = originalUser?.role || "";

            if (formData.role !== originalRoleName) {
              await updateUserRole(formData.id, {role: formData.role});
            }

            await resetAndLoadData();
            dialog.value = false;
            showSnackbar('Usuário atualizado com sucesso!', 'success');
          } else {
            showSnackbar('Erro ao atualizar usuário!', 'error');
          }
        }
      } catch (error) {
        console.error("Error saving user:", error);
      }
    };

    const toggleActive = async (item: UserForPage) => {
      const userIndex = users.value.findIndex(user => user.id === item.id);

      if (userIndex === -1) {
        return;
      }

      try {
        const statusCode = await toggleUserActive(item.id);

        if (statusCode === 200) {
          users.value[userIndex].active = !users.value[userIndex].active;
          showSnackbar('Usuário atualizado com sucesso!', 'success');
        } else {
          showSnackbar('Erro ao atualizar usuário!', 'error');
        }
      } catch (error) {
        console.error("Error toggling user status:", error);
        showSnackbar('Erro ao atualizar usuário!', 'error');
      }
    };

    const promptResetPassword = (user: UserForPage) => {
      userToReset.value = user;
      confirmResetDialog.value = true;
    };

    const handleConfirmResetPassword = async () => {
      if (!userToReset.value || !userToReset.value.id) {
        return;
      }

      try {
        const statusCode = await resetUserPassword(userToReset.value.id);

        if (statusCode === 200) {
          showSnackbar('Senha do usuário resetada com sucesso!', 'success');
        } else {
          showSnackbar('Erro ao resetar a senha do usuário.', 'error');
        }
      } catch (error) {
        console.error("Error resetting user password:", error);
        showSnackbar('Erro ao resetar a senha do usuário.', 'error');
      } finally {
        confirmResetDialog.value = false;
        userToReset.value = null;
      }
    };


    onMounted(() => {
      resetAndLoadData();
    });

    return {
      dialog,
      confirmClose,
      currentUser,
      users,
      headers,
      isLoading,
      openDialog,
      editUser,
      onSaveUser,
      toggleActive,
      editMode,
      loadMoreUsers,
      handleSearch,
      confirmResetDialog,
      userToReset,
      promptResetPassword,
      handleConfirmResetPassword
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  overflow-y: hidden;
  height: 100%;
}
</style>
