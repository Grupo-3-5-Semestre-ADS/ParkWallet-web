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
      :loading="isLoading"
      @add="openDialog"
      @edit="editProduct"
      @toggle="toggleActive"
      @load-more="loadMoreProducts"
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
  getProducts,
  toggleProductActive,
  updateProduct
} from "@/services/productsService.js";

export default {
  name: "ProductsPage",
  components: {DefaultTable, ConfirmDialog, CreateOrEditProducts},
  setup() {
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const product = ref({id: null, name: "", description: "", price: 0, facilityId: null, inactive: false});

    const products = ref<any[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);

    const headers = [
      {title: "Nome", key: "name", sortable: false},
      {title: "Estabelecimento", key: "facility.name", sortable: false},
      {title: "Descrição", key: "description", sortable: false},
      {title: "Valor", key: "price", sortable: false},
      {title: "Ativo", key: "inactive", sortable: false},
      {title: "Ações", key: "actions", sortable: false}
    ];

    const fetchProductsPage = async () => {
      if (isLoading.value || allItemsLoaded.value) {
        return;
      }
      isLoading.value = true;

      try {
        const response = await getProducts(currentPage.value, itemsPerPage.value);

        if (response && response.data && response._page) {
          if (response.data.length > 0) {
            products.value.push(...response.data);
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
        console.error("Failed to fetch products page:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadMoreProducts = () => {
      fetchProductsPage();
    };

    const resetAndLoadData = async () => {
      products.value = [];
      currentPage.value = 1;
      allItemsLoaded.value = false;
      isLoading.value = false;
      await fetchProductsPage();
    };

    const openDialog = () => {
      product.value = {id: null, name: "", description: "", price: 0, facilityId: null, inactive: false};
      editMode.value = false;
      dialog.value = true;
    };

    const editProduct = (item: any) => {
      product.value = {...item};
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveProduct = async (data: any) => {
      isLoading.value = true;
      let success = false;
      try {
        if (editMode.value) {
          const statusCode = await updateProduct(data.id, data);
          if (statusCode === 200) {
            success = true;
          } else {
            console.error("Update failed with status:", statusCode);
          }
        } else {
          const createdProduct = await createProduct(data);
          if (createdProduct) {
            success = true;
          } else {
            console.error("Create failed");
          }
        }

        if (success) {
          await resetAndLoadData();
        }

      } catch (error) {
        console.error("Error saving product:", error);
      } finally {
        if (!success) {
          isLoading.value = false;
        }
        dialog.value = false;
      }
    };

    const toggleActive = async (item: any) => {
      const originalStatus = item.inactive;
      const index = products.value.findIndex(p => p.id === item.id);

      if (index !== -1) {
        products.value[index].inactive = !products.value[index].inactive;
      }

      try {
        const statusCode = await toggleProductActive(item.id);
        if (statusCode !== 200) {
          if (index !== -1) {
            products.value[index].inactive = originalStatus;
          }
          console.error("Toggle status failed with status:", statusCode);
        }
      } catch (error) {
        if (index !== -1) {
          products.value[index].inactive = originalStatus;
        }
        console.error("Error toggling product status:", error);
      }
    };

    onMounted(() => {
      resetAndLoadData();
    });

    return {
      dialog,
      confirmClose,
      product,
      products,
      headers,
      isLoading,
      openDialog,
      editProduct,
      onSaveProduct,
      toggleActive,
      editMode,
      loadMoreProducts,
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
