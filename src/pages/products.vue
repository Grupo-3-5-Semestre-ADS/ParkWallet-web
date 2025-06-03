<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <DefaultTable
      search-placeholder="Buscar Produtos"
      add-button-text="Adicionar Produto"
      :table-items="products"
      :headers="headers"
      :loading="isLoading"
      :show-add-button="isAdmin"
      :show-edit-button="isAdmin"
      :show-inactivate-button="isAdmin"
      show-search
      @add="openDialog"
      @edit="editProduct"
      @toggle="toggleActive"
      @load-more="loadMoreProducts"
      @search-updated="handleSearch"
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
import {computed, inject, onMounted, ref} from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import CreateOrEditProducts from "@/components/dialogs/CreateOrEditProducts.vue";
import DefaultTable from "@/components/DefaultTable.vue";
import {
  createProduct,
  getProducts,
  toggleProductActive,
  updateProduct
} from "@/services/productsService.js";

interface Product {
  id: number | null;
  name: string;
  description: string;
  price: number;
  facilityId: number | null;
  active: boolean;
  facility?: { name: string };
}

export default {
  name: "ProductsPage",
  components: {DefaultTable, ConfirmDialog, CreateOrEditProducts},
  setup() {
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const product = ref({id: null, name: "", description: "", price: 0, facilityId: null, active: true});

    const products = ref<Product[]>([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const allItemsLoaded = ref(false);
    const currentSearchQuery = ref("");

    const headers = computed(() => {
      const baseHeaders = [
        {title: "Nome", key: "name", sortable: false},
        {title: "Estabelecimento", key: "facility.name", sortable: false},
        {title: "Descrição", key: "description", sortable: false},
        {title: "Valor", key: "price", sortable: false},
        {title: "Ativo", key: "active", sortable: false},
      ];

      if (isAdmin.value) {
        baseHeaders.push({title: "Ações", key: "actions", sortable: false});
      }

      return baseHeaders;
    });

    const showSnackbar = inject<(message: string, color?: string) => void>('showSnackbar');
    const userData = inject<any>('userData');

    const isAdmin = computed(() => {
      return userData.value?.role === 'ADMIN';
    });

    const fetchProductsPage = async () => {
      if (isLoading.value || allItemsLoaded.value) {
        return;
      }
      isLoading.value = true;

      try {
        const response = await getProducts(currentPage.value, itemsPerPage.value, currentSearchQuery.value);

        if (response && response.data && response._page) {
          const newItems = response.data;

          if (currentPage.value === 1) {
            products.value = newItems;
          } else {
            products.value.push(...newItems);
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
            products.value = [];
          }

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
      await fetchProductsPage();
    };

    const handleSearch = (searchTerm: string) => {
      currentSearchQuery.value = searchTerm;
      resetAndLoadData();
    };

    const openDialog = () => {
      product.value = {id: null, name: "", description: "", price: 0, facilityId: null, active: true};
      editMode.value = false;
      dialog.value = true;
    };

    const editProduct = (item: Product) => {
      product.value = item;
      editMode.value = true;
      dialog.value = true;
    };

    const onSaveProduct = async (data: Product) => {
      try {
        if (editMode.value) {
          const statusCode = await updateProduct(data.id, data);

          if (statusCode === 200) {
            await resetAndLoadData();
            dialog.value = false;
            showSnackbar('Produto atualizado com sucesso!', 'success');
          } else {
            showSnackbar('Erro ao atualizar produto!', 'error');
          }
        } else {
          const statusCode = await createProduct(data);

          if (statusCode === 201) {
            await resetAndLoadData();
            dialog.value = false;
            showSnackbar('Produto cadastrado com sucesso!', 'success');
          } else {
            showSnackbar('Erro ao cadastrar produto!', 'error');
          }
        }
      } catch (error) {
        console.error("Error saving product:", error);
      }
    };

    const toggleActive = async (item: Product) => {
      const productIndex = products.value.findIndex(p => p.id === item.id);

      if (productIndex === -1) {
        return;
      }

      try {
        const statusCode = await toggleProductActive(item.id);

        if (statusCode === 200) {
          products.value[productIndex].active = !products.value[productIndex].active;
          showSnackbar('Usuário atualizado com sucesso!', 'success');
        } else {
          showSnackbar('Erro ao atualizar usuário!', 'error');
        }
      } catch (error) {
        console.error("Error toggling product status:", error);
        showSnackbar('Erro ao atualizar usuário!', 'error');
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
      handleSearch,
      isAdmin
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
