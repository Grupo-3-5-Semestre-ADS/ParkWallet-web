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
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-item to="/facilities">
          Estabelecimentos
        </v-list-item>
        <v-list-item to="/products">
          Produtos
        </v-list-item>
        <v-list-item to="/clients">
          Clientes
        </v-list-item>
        <v-list-item to="/support">
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
