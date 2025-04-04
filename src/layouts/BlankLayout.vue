<template>
  <v-app>
    <v-main class="background-container">
      <slot />
    </v-main>
  </v-app>
</template>

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
</style>
