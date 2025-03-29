<template>
  <v-app>
    <v-app-bar color="primary" app>
      <v-app-bar-title>Minha Plataforma</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer app>
      <v-list>
        <v-list-item to="/facilities">Facilities</v-list-item>
        <v-list-item to="/products">Products</v-list-item>
        <v-list-item to="/clients">Clients</v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <slot/>
      </v-container>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
</script>
