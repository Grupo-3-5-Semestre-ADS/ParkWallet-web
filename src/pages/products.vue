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
import {onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditProducts from "@/components/dialogs/CreateOrEditProducts.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {
  createProduct,
  getProduct,
  getProducts,
  toggleProductActive,
  updateProduct
} from "@/services/productsService.js";

export default {
  name: "ProductsPage",
  components: {DefaultTable, ConfirmDialog, CreateOrEditProducts},
  setup() {
    const search = ref("");
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const product = ref({id: null, name: "", description: "", value: 0, facilityId: null});

    const products = ref([]);

    const headers = [
      {title: "Nome", key: "name"},
      {title: "Estabelecimento", key: "facilityId"},
      {title: "Descrição", key: "description"},
      {title: "Valor", key: "price"},
      {title: "Ativo", key: "inactive"},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const getData = async () => {
      try {
        const res = await getProducts();
        products.value.push(...res.data);
      } catch (error) {
        console.error(error);
      }
    };

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

    const onSaveProduct = async (data) => {
      if (editMode.value) {
        const statusCode = await updateProduct(data.id, data);

        if (statusCode === 200) {
          const updatedFacility = await getProduct(data.id);
          const index = products.value.findIndex(f => f.id === data.id);
          products.value[index] = updatedFacility;
        }
      } else {
        const createdFacility = await createProduct(data);

        if (createdFacility) {
          await getData();
        }
      }
      dialog.value = false;
    };

    const toggleActive = async (item) => {
      const productToUpdate = products.value.find(f => f.id === item.id);
      if (productToUpdate) {
        const statusCode = await toggleProductActive(productToUpdate.id);
        if (statusCode === 200) {
          productToUpdate.inactive = !productToUpdate.inactive;
        }
      }
    };

    onMounted(() => {
      getData();
    });

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
