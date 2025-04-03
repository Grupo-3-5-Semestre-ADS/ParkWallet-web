<template>
  <v-app>
    <v-app-bar
      color="primary"
      app
    >
      <v-app-bar-title>ParkWallet</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer app>
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


    <v-main class="main-container">
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
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-container {
  flex: 1;
  overflow: auto;
}
</style>
