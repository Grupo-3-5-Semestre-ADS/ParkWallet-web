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
      @map="openMap"
    />

    <!--    <CreateOrEditFacilities-->
    <!--      v-model="dialog"-->
    <!--      :product="product"-->
    <!--      :editMode="editMode"-->
    <!--      @save="onSaveProduct"-->
    <!--      @cancel="confirmClose = true"-->
    <!--    />-->

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
import CreateOrEditFacilities from "@/components/dialogs/CreateOrEditFacilities.vue";
import MapDialog from "@/components/dialogs/MapDialog.vue";
import DefaultTable from "@/components/DefaultTable.vue";

export default {
  name: "ProductsPage",
  components: {DefaultTable, MapDialog, ConfirmDialog, CreateOrEditFacilities},
  setup() {
    const search = ref("");
    const dialog = ref(false);
    const confirmClose = ref(false);
    const editMode = ref(false);
    const showMapDialog = ref(false);
    const selectedCoords = ref({latitude: 0, longitude: 0});
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
      product.value = {id: null, name: "", description: "", type: "", latitude: "", longitude: ""};
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

    const openMap = (item) => {
      selectedCoords.value = {latitude: item.latitude, longitude: item.longitude};
      showMapDialog.value = true;
    };

    return {
      search,
      dialog,
      confirmClose,
      showMapDialog,
      selectedCoords,
      product,
      products,
      headers,
      openDialog,
      editProduct,
      onSaveProduct,
      toggleActive,
      openMap,
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

.text-right {
  text-align: right;
}

.full-height {
  height: 100%;
}

.transparent-background {
  background-color: transparent;
}
</style>
