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
import { onMounted, ref } from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditUsers from "@/components/dialogs/CreateOrEditUsers.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {
  getUsers,
  updateUser,
  deleteUser,
  addUserRoles,
  removeUserRoles
} from "@/services/usersService.js";

interface UserForPage {
  id: number | null;
  name: string;
  email: string;
  cpf?: string;
  birthdate?: string;
  inactive: boolean;
  password?: string;
  roles?: any[];
}

export default {
  name: "UsersPage",
  components: { DefaultTable, ConfirmDialog, CreateOrEditUsers },
  setup() {
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);

    const initialUser: UserForPage = {
        id: null, name: "", email: "", cpf: "", birthdate: "", inactive: false, roles: []
    };
    const currentUser = ref<UserForPage | null>({...initialUser});

    const users = ref<UserForPage[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);

    const headers = [
      { title: "Nome", key: "name", sortable: false },
      { title: "E-mail", key: "email", sortable: false },
      { title: "CPF", key: "cpf", sortable: false },
      { title: "Data de Nascimento", key: "birthdate", sortable: false },
      // { title: "Permissões", key: "roles", sortable: false },
      { title: "Ativo", key: "inactive", sortable: false },
      { title: "Ações", key: "actions", sortable: false }
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
            users.value.push(...response.data);
            currentPage.value++;
          }

          if (response._page.current >= response._page.total) {
            allItemsLoaded.value = true;
          }
        } else {
          console.error("Invalid data structure received from API for pagination:", response);
          allItemsLoaded.value = true; // Stop trying if structure is wrong
        }
      } catch (error) {
        console.error("Failed to fetch users page:", error);
        // Potentially set an error state to show user
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
      isLoading.value = false; // Reset loading state
      await fetchUsersPage();
    };

    const openDialog = () => {
      currentUser.value = { ...initialUser };
      editMode.value = false;
      dialog.value = true;
    };

    const editUser = async (item: UserForPage) => {
      // Optionally, fetch full user details if `item` from table is partial
      // For now, assume `item` has all necessary fields including 'roles'
      // If not, const fullUser = await getUserById(item.id); currentUser.value = {...fullUser};
      currentUser.value = { ...item };
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveUser = async (formData: UserForPage) => {
      isLoading.value = true;
      let success = false;
      const { roles: newRoleNames, ...userData } = formData; // formData.roles are role names from the dialog

      try {
        if (editMode.value && userData.id) {
          const originalUser = users.value.find(u => u.id === userData.id);
          const originalRoleNames = originalUser?.roles?.map((r: any) => r.name || r) || [];


          // API expects password only if it's being changed. Dialog handles this logic.
          const updateStatusCode = await updateUser(userData.id, userData);

          if (updateStatusCode === 200) { // Or appropriate success code
            const rolesToAdd = newRoleNames?.filter(r => !originalRoleNames.includes(r)) || [];
            const rolesToRemove = originalRoleNames?.filter(r => !newRoleNames?.includes(r)) || [];

            // Parallel role updates can be complex if one fails. Sequential might be safer.
            if (rolesToAdd.length > 0) await addUserRoles(userData.id, { roles: rolesToAdd });
            if (rolesToRemove.length > 0) await removeUserRoles(userData.id, { roles: rolesToRemove });

            success = true;
          } else {
            console.error("Update user failed with status:", updateStatusCode);
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
        // isLoading is set to false by resetAndLoadData on success
      }
    };

    const toggleActive = async (item: UserForPage) => {
      if (item.id === null) return;

      const originalStatus = item.inactive;
      const index = users.value.findIndex(u => u.id === item.id);

      if (index !== -1) {
        users.value[index].inactive = !users.value[index].inactive;
      }

      try {
        const statusCode = await deleteUser(item.id);
        if (statusCode !== 200) {
          if (index !== -1) {
            users.value[index].inactive = originalStatus;
          }
          console.error("Toggle user status failed with status:", statusCode);
        }
      } catch (error) {
        if (index !== -1) {
          users.value[index].inactive = originalStatus;
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
  overflow-y: hidden; /* Or auto/scroll if content exceeds height */
  height: 100%;
}
</style>
