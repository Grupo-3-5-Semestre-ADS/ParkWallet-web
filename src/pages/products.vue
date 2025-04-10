<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <DefaultTable
      search-placeholder="Buscar Produto"
      add-button-text="Adicionar Produto"
      :table-items="products"
      :headers="headers"
      @add="openDialog"
      @edit="editProduct"
      @toggle="toggleActive"
    />

    <CreateOrEditProducts
      v-model="dialog"
      :product="product"
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
import CreateOrEditProducts from "@/components/dialogs/CreateOrEditProducts.vue";
import DefaultTable from "@/components/DefaultTable.vue";

export default {
  name: "ProductsPage",
  components: {DefaultTable, ConfirmDialog, CreateOrEditProducts},
  setup() {
    const search = ref("");
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const product = ref({id: null, name: "", description: "", type: "", latitude: "", longitude: ""});

    const products = ref([
      {
        id: 1,
        name: "Produto 1",
        facilityName: "Estabelecimento 1",
        description: "Emergência 24h",
        value: 5.12,
        active: true
      },
      {
        id: 2,
        name: "Produto 2",
        facilityName: "Estabelecimento 1",
        description: "Emergência 24h",
        value: 10.00,
        active: true
      },
      {
        id: 3,
        name: "Produto 3",
        facilityName: "Estabelecimento 1",
        description: "Emergência 24h",
        value: 20.00,
        active: true
      },
    ]);

    const headers = [
      {title: "Nome", key: "name"},
      {title: "Estabelecimento", key: "facilityName"},
      {title: "Descrição", key: "description"},
      {title: "Valor", key: "value"},
      {title: "Ativo", key: "active"},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const openDialog = () => {
      product.value = {id: null, name: "", description: "", value: 0};
      editMode.value = false;
      dialog.value = true;
    };

    const editProduct = (item) => {
      product.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveProduct = (data) => {
      if (editMode.value) {
        const index = products.value.findIndex(f => f.id === data.id);
        products.value[index] = {...data};
      } else {
        data.id = products.value.length + 1;
        products.value.push({...data});
      }
      dialog.value = false;
    };

    const toggleActive = (item) => {
      const productToUpdate = products.value.find(f => f.id === item.id);
      if (productToUpdate) {
        productToUpdate.active = !productToUpdate.active;
      }
    };

    return {
      search,
      dialog,
      confirmClose,
      product,
      products,
      headers,
      openDialog,
      editProduct,
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
