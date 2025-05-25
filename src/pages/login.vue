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
            <v-alert
              v-if="errorMessage"
              type="error"
              dense
              class="mb-4"
            >
              {{ errorMessage }}
            </v-alert>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                required
                :error-messages="emailErrors"
                @blur="validateEmail"
              />

              <v-text-field
                v-model="password"
                label="Senha"
                type="password"
                required
                :error-messages="passwordErrors"
                @blur="validatePassword"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :disabled="!isFormValid || loading"
                :loading="loading"
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
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {login} from '@/services/authService.js'

export default {
  name: 'LoginPage',

  setup() {
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const errorMessage = ref('')

    const emailErrors = ref<string[]>([])
    const passwordErrors = ref<string[]>([])

    const validateEmail = () => {
      emailErrors.value = []
      if (!email.value) {
        emailErrors.value.push('E-mail é obrigatório.')
      } else if (!/.+@.+\..+/.test(email.value)) {
        emailErrors.value.push('E-mail deve ser válido.')
      }
    }

    const validatePassword = () => {
      passwordErrors.value = []
      if (!password.value) {
        passwordErrors.value.push('Senha é obrigatória.')
      }
    }

    const isFormValid = computed(() => {
      return !!email.value && !!password.value && emailErrors.value.length === 0 && passwordErrors.value.length === 0
    })

    const handleSubmit = async () => {
      validateEmail()
      validatePassword()

      if (!isFormValid.value) {
        return
      }

      loading.value = true
      errorMessage.value = ''

      try {
        const credentials = {
          email: email.value,
          password: password.value
        }
        const response = await login(credentials)

        if (response && response.token) {
          localStorage.setItem('authToken', response.token)
          await router.push('/facilities')
        } else {
          errorMessage.value = 'Resposta de login inesperada. Tente novamente.'
        }

      } catch (error: any) {
        console.error('Login failed:', error)
        errorMessage.value = 'Falha no login. Verifique suas credenciais ou tente novamente mais tarde.'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      loading,
      errorMessage,
      handleSubmit,
      emailErrors,
      passwordErrors,
      validateEmail,
      validatePassword,
      isFormValid,
    }
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
