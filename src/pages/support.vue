<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <v-row no-gutters class="fill-height">
      <v-col cols="4" class="pr-4" style="border-right: 1px solid #ccc; overflow-y: auto;">
        <v-list>
          <v-list-item
              v-for="client in clients"
              :key="client.id"
              @click="selectClient(client)"
              :class="{ 'bg-grey-lighten-3': selectedClient?.id === client.id }"
              class="rounded"
          >
              <v-list-item-title>{{ client.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ client.lastMessage }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="8" class="d-flex flex-column pl-4">
        <div v-if="selectedClient" class="d-flex flex-column fill-height">
          <h3>{{ selectedClient.name }}</h3>

          <div class="flex-grow-1 overflow-y-auto my-4 px-2" style="border: 1px solid #ccc; border-radius: 8px;">
            <div v-for="(msg, index) in messages" :key="index" class="my-2">
              <div :class="msg.from === 'me' ? 'text-right' : 'text-left'">
                <v-chip
                    :color="msg.from === 'me' ? 'blue' : 'grey'"
                    text-color="white"
                    class="ma-1"
                >
                  {{ msg.text }}
                </v-chip>
              </div>
            </div>
          </div>

          <div class="d-flex">
            <v-text-field
                v-model="newMessage"
                label="Digite sua mensagem"
                hide-details
                dense
                class="flex-grow-1 mr-2"
                @keyup.enter="sendMessage"
            />
            <v-btn color="primary" @click="sendMessage">Enviar</v-btn>
          </div>
        </div>

        <div v-else class="text-center text-grey">
          <h4>Selecione um cliente para iniciar a conversa</h4>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {ref} from 'vue';

const clients = ref([
  {id: 1, name: 'João Silva', lastMessage: 'Olá, tudo bem?'},
  {id: 2, name: 'Maria Oliveira', lastMessage: 'Obrigado pela ajuda!'},
  {id: 3, name: 'Pedro Santos', lastMessage: 'Posso marcar para amanhã?'}
]);

const selectedClient = ref(null as null | typeof clients.value[0]);

const messages = ref([
  {from: 'me', text: 'Oi! Como posso ajudar?'},
  {from: 'client', text: 'Quero saber mais sobre os produtos.'}
]);

const newMessage = ref('');

function selectClient(client: typeof clients.value[0]) {
  selectedClient.value = client;
}

function sendMessage() {
  if (!newMessage.value.trim()) return;

  messages.value.push({from: 'me', text: newMessage.value});
  newMessage.value = '';
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  height: 100%;
}

.fill-height {
  height: 100vh;
}
</style>
