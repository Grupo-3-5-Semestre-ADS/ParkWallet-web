<template>
  <v-app>
    <v-app-bar
      color="primary"
      app
    >
      <template #prepend>
        <v-btn
          icon
          @click="toggleDrawer"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>

      <v-spacer />

      <v-img
        src="../assets/itaipuland-logo-white.png"
        alt="Logo"
        class="logo-img"
        max-height="60"
        max-width="150"
        contain
      />
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :rail="!expanded && !isMobile"
      :temporary="isMobile"
      app
      class="d-flex flex-column h-100"
    >
      <div class="d-flex flex-column h-100">
        <v-list>
          <v-list-item
            prepend-icon="mdi-account"
            subtitle="user1@gmailcom"
            title="User 1"
          />
        </v-list>

        <v-divider />

        <v-list
          nav
          density="comfortable"
        >
          <v-list-item
            to="/facilities"
            prepend-icon="mdi-store"
          >
            Estabelecimentos
          </v-list-item>
          <v-list-item
            to="/products"
            prepend-icon="mdi-package-variant"
          >
            Produtos
          </v-list-item>
          <v-list-item
            to="/users"
            prepend-icon="mdi-account-group"
          >
            Usuários
          </v-list-item>
          <v-list-item
            to="/support"
            prepend-icon="mdi-chat"
          >
            Suporte
          </v-list-item>
        </v-list>

        <div class="navigator-spacer" />

        <v-list
          nav
          density="comfortable"
        >
          <v-list-item to="/login">
            <template #prepend>
              <v-icon color="error">
                mdi-logout
              </v-icon>
            </template>
            Sair
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main class="background-container">
      <v-container
        fluid
        class="content-container"
      >
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {useDisplay} from "vuetify";

const drawer = ref(true);
const expanded = ref(false);

// Detecta se está em tela pequena
const {mdAndDown} = useDisplay();
const isMobile = computed(() => mdAndDown.value);

// Função de toggle inteligente
const toggleDrawer = () => {
  if (isMobile.value) {
    drawer.value = !drawer.value;
  } else {
    expanded.value = !expanded.value;
  }
};
</script>

<style scoped>
.background-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url("../assets/background.svg");
  background-size: auto 50vh;
  background-position: bottom right;
  background-repeat: no-repeat;
  min-height: 100vh;
}

.content-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  border-radius: 8px;
  max-height: calc(100vh - 64px);
}

.logo-img {
  max-height: 60px;
  width: auto;
}

.navigator-spacer {
  height: calc(100% - 397px);
}
</style>
