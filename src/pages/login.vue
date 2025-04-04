<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="4"
      >
        <v-card
          class="pa-6"
          elevation="6"
        >
          <v-img
            src="../assets/itaipuland-logo.png"
            alt="Logo"
            contain
            class="mb-4"
            max-height="150"
          />
          <v-card-title class="text-h5">
            Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                required
              />

              <v-text-field
                v-model="password"
                label="Senha"
                type="password"
                required
              />

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :disabled="!email || !password"
                to="/facilities"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {ref} from 'vue'

export default {
  name: 'LoginPage',

  setup() {
    const email = ref('')
    const password = ref('')

    const handleSubmit = () => {
      console.log('Email:', email.value)
      console.log('Senha:', password.value)
    }

    return {
      email,
      password,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
