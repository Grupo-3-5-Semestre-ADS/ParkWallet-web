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
      @add="openDialog"
      @edit="editUser"
      @toggle="toggleActive"
    />

    <CreateOrEditUsers
      v-model="dialog"
      :user="user"
      :edit-mode="editMode"
      @save="onSaveProduct"
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
import {ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import CreateOrEditUsers from "@/components/dialogs/CreateOrEditUsers.vue";

export default {
  name: "ProductsPage",
  components: {CreateOrEditUsers, DefaultTable, ConfirmDialog},
  setup() {
    const search = ref("");
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const user = ref({id: null, name: "", email: "", type: "", latitude: "", longitude: ""});

    const users = ref([
      {
        id: 1,
        name: "Produto 1",
        cpf: "Estabelecimento 1",
        email: "Emergência 24h",
        birthDate: 5.12,
        active: true
      },
      {
        id: 2,
        name: "Produto 2",
        cpf: "Estabelecimento 1",
        email: "Emergência 24h",
        birthDate: 10.00,
        active: true
      },
      {
        id: 3,
        name: "Produto 3",
        cpf: "Estabelecimento 1",
        email: "Emergência 24h",
        birthDate: 20.00,
        active: true
      },
    ]);

    const headers = [
      {title: "Nome", key: "name"},
      {title: "CPF", key: "cpf"},
      {title: "E-mail", key: "email"},
      {title: "Data de Nascimento", key: "birthDate"},
      {title: "Ativo", key: "inactive"},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const openDialog = () => {
      user.value = {id: null, name: "", email: "", birthDate: 0};
      editMode.value = false;
      dialog.value = true;
    };

    const editUser = (item) => {
      user.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveProduct = (data) => {
      if (editMode.value) {
        const index = users.value.findIndex(f => f.id === data.id);
        users.value[index] = {...data};
      } else {
        data.id = users.value.length + 1;
        users.value.push({...data});
      }
      dialog.value = false;
    };

    const toggleActive = (item) => {
      const productToUpdate = users.value.find(f => f.id === item.id);
      if (productToUpdate) {
        productToUpdate.active = !productToUpdate.active;
      }
    };

    return {
      search,
      dialog,
      confirmClose,
      user,
      users,
      headers,
      openDialog,
      editUser,
      onSaveProduct,
      toggleActive,
      editMode
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  height: 100%;
}
</style>
