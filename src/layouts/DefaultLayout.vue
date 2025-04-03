<template>
  <v-app>
    <!-- AppBar -->
    <v-app-bar
      color="primary"
      app
    >
      <v-btn
        icon
        @click="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-app-bar-title>ParkWallet</v-app-bar-title>
      <v-spacer />
      <v-img
        src="../assets/itaipuland-logo.png"
        alt="Logo"
        class="logo-img"
        height="40"
        contain
      />
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list>
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
          to="/clients"
          prepend-icon="mdi-account-group"
        >
          Clientes
        </v-list-item>
        <v-list-item
          to="/support"
          prepend-icon="mdi-lifebuoy"
        >
          Suporte a clientes
        </v-list-item>
      </v-list>
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
import {ref} from "vue";

const drawer = ref(false);
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
}
</style>
