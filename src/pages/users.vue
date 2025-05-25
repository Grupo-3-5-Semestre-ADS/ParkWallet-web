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
      @add="openDialog"
      @edit="editUser"
      @toggle="toggleActive"
      @load-more="loadMoreUsers"
    />

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
  </v-container>
</template>

<script lang="ts">
import {onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditUsers from "@/components/dialogs/CreateOrEditUsers.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {
  getUsers,
  updateUser,
  addUser,
  updateUserRole,
  toggleUserActive
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

    const initialUser: UserForPage = {
      id: null, name: "", email: "", cpf: "", birthdate: "", active: true, role: ""
    };
    const currentUser = ref<UserForPage | null>({...initialUser});

    const users = ref<UserForPage[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);

    const headers = [
      {title: "Nome", key: "name", sortable: false},
      {title: "E-mail", key: "email", sortable: false},
      {title: "CPF", key: "cpf", sortable: false},
      {title: "Data de Nascimento", key: "birthdate", sortable: false},
      {title: "Permissão", key: "role", sortable: false},
      {title: "Ativo", key: "active", sortable: false},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const fetchUsersPage = async () => {
      if (isLoading.value || allItemsLoaded.value) {
        return;
      }
      isLoading.value = true;

      try {
        const response = await getUsers(currentPage.value, itemsPerPage.value);
        if (response && response.data && response._page) {
          if (response.data.length > 0) {
            const mappedData = response.data.map((user: any) => ({
              ...user,
              role: typeof user.role === 'object' && user.role !== null ? user.role.name : user.role || ""
            }));
            users.value.push(...mappedData);
            currentPage.value++;
          }

          if (response._page.current >= response._page.total) {
            allItemsLoaded.value = true;
          }
        } else {
          console.error("Invalid data structure received from API for pagination:", response);
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
      isLoading.value = false;
      await fetchUsersPage();
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
      isLoading.value = true;
      let success = false;
      const {role: newRoleName, ...userData} = formData;

      try {
        if (editMode.value && userData.id) {
          const updateStatusCode = await updateUser(userData.id, userData);

          if (updateStatusCode === 200) {
            const originalUser = users.value.find(u => u.id === userData.id);
            const originalRoleName = originalUser?.role || "";

            if (newRoleName !== undefined && newRoleName !== originalRoleName) {
              await updateUserRole(userData.id, {role: newRoleName});
            }
            success = true;
          } else {
            console.error("Update user failed with status:", updateStatusCode);
          }
        } else {
          const userToCreate = {...userData, role: newRoleName};
          delete userToCreate.id;

          const createdUserResponse = await addUser(userToCreate);
          if (createdUserResponse && (createdUserResponse.id || createdUserResponse.status === 201 || createdUserResponse.status === 200)) {
            success = true;
          } else {
            console.error("Create user failed:", createdUserResponse);
          }
        }

        if (success) {
          await resetAndLoadData();
          dialog.value = false;
        }
      } catch (error: any) {
        console.error("Error saving user:", error);
      } finally {
        if (!success) {
          isLoading.value = false;
        }
      }
    };

    const toggleActive = async (item: UserForPage) => {
      if (item.id === null) return;

      const originalStatus = item.active;
      const index = users.value.findIndex(u => u.id === item.id);

      if (index !== -1) {
        users.value[index].active = !users.value[index].active;
      }

      try {
        const statusCode = await toggleUserActive(item.id);
        if (statusCode !== 200) {
          if (index !== -1) {
            users.value[index].active = originalStatus;
          }
          console.error("Toggle user status failed with status:", statusCode);
        }
      } catch (error) {
        if (index !== -1) {
          users.value[index].active = originalStatus;
        }
        console.error("Error toggling user status:", error);
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
