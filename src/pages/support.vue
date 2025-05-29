<template>
  <v-container
    fluid
    class="page-container rounded elevation-4"
  >
    <v-row no-gutters class="fill-height">
      <!-- Lista de Clientes -->
      <v-col cols="12" md="4" class="pr-md-4 user-list-container" style="border-right: 1px solid #ccc;">
        <v-list>
          <v-list-item-title class="pa-4 text-h6">Conversas</v-list-item-title>
          <v-divider></v-divider>
          <div v-if="isLoadingClients" class="text-center pa-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Carregando conversas...</p>
          </div>
          <div v-else-if="clients.length === 0 && !isLoadingClients" class="text-center text-grey pa-5">
            Nenhuma conversa encontrada.
          </div>
          <v-list-item
            v-else
            v-for="client in clients"
            :key="client.id"
            @click="selectClient(client)"
            :class="{ 'bg-grey-lighten-3': selectedClient?.id === client.id }"
            class="rounded my-1"
            lines="two"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" class="mr-3">
                <span class="text-h6">{{ client.name.substring(0, 1).toUpperCase() }}</span>
              </v-avatar>
            </template>
            <v-list-item-title>{{ client.name }}</v-list-item-title>
            <v-list-item-subtitle
              class="text-truncate"
              :title="client.lastMessage"
            >
              {{ client.lastMessage }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Área do Chat -->
      <v-col cols="12" md="8" class="d-flex flex-column pl-md-4 chat-area-container">
        <div v-if="selectedClient" class="d-flex flex-column fill-height">
          <v-toolbar density="compact" color="transparent">
            <v-avatar color="primary" class="mr-3 ml-2">
              <span class="text-h6">{{ selectedClient.name.substring(0, 1).toUpperCase() }}</span>
            </v-avatar>
            <v-toolbar-title>{{ selectedClient.name }}</v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>

          <div ref="messageContainer" class="flex-grow-1 overflow-y-auto my-4 px-2 message-list"
               style="border: 1px solid #e0e0e0; border-radius: 8px;">
            <div v-if="isLoadingMessages" class="text-center pa-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p>Carregando mensagens...</p>
            </div>
            <div v-for="(msg, index) in messages" :key="msg.id || index" class="my-2">
              <div :class="msg.from === 'me' ? 'd-flex justify-end' : 'd-flex justify-start'">
                <v-chip
                  :color="msg.from === 'me' ? 'primary' : 'grey-lighten-1'"
                  :class="msg.from === 'me' ? 'text-white' : ''"
                  class="ma-1 pa-3"
                  style="max-width: 70%; height: auto; white-space: normal;"
                >
                  <div class="message-text">{{ msg.text }}</div>
                  <div class="text-caption mt-1"
                       :class="msg.from === 'me' ? 'text-blue-lighten-4' : 'text-grey-darken-1'">
                    {{ formatTimestamp(msg.timestamp) }}
                  </div>
                </v-chip>
              </div>
            </div>
            <div v-if="!isLoadingMessages && messages.length === 0 && selectedClient"
                 class="text-center text-grey pa-5">
              Nenhuma mensagem ainda. Comece a conversa!
            </div>
          </div>

          <div class="d-flex pa-2 align-center">
            <v-text-field
              v-model="newMessage"
              label="Digite sua mensagem"
              hide-details
              variant="outlined"
              density="compact"
              class="flex-grow-1 mr-2"
              @keyup.enter="sendMessage"
            />
            <v-btn icon="mdi-send" color="primary" @click="sendMessage" :disabled="!newMessage.trim()"></v-btn>
          </div>
        </div>

        <div v-else class="d-flex fill-height align-center justify-center text-center text-grey">
          <div>
            <v-icon size="x-large" class="mb-2">mdi-forum-outline</v-icon>
            <h4>Selecione uma conversa para começar</h4>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {io, Socket} from 'socket.io-client';
import { listConversations, listUserChats } from '@/services/chatService.js';

interface Client {
  id: number;
  name: string;
  lastMessage: string;
  unreadCount?: number;
}

interface ApiConversation {
  userId: number;
  userName: string;
  lastMessage: string;
}

interface Message {
  id?: number | string;
  from: 'me' | 'client';
  text: string;
  senderUserId?: number;
  recipientUserId?: number;
  timestamp: string | Date;
}

interface ServerMessage {
  id: number;
  senderUserId: number;
  recipientUserId: number;
  message: string;
  createdAt: string;
  wasRead: boolean;
}

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080';

const myUserId = ref(1);
const clients = ref<Client[]>([]);
const selectedClient = ref<Client | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref('');
const isLoadingClients = ref(false);
const isLoadingMessages = ref(false);
const messageContainer = ref<HTMLElement | null>(null);

let socket: Socket | null = null;

function formatTimestamp(timestamp: string | Date): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

async function scrollToBottom() {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
}

function transformServerMessageToUIMessage(serverMsg: ServerMessage, currentUserId: number): Message {
  return {
    id: serverMsg.id,
    text: serverMsg.message,
    from: serverMsg.senderUserId === currentUserId ? 'me' : 'client',
    senderUserId: serverMsg.senderUserId,
    recipientUserId: serverMsg.recipientUserId,
    timestamp: serverMsg.createdAt,
  };
}

async function loadConversations() {
  isLoadingClients.value = true;
  try {
    const apiConversations: ApiConversation[] = await listConversations();
    clients.value = apiConversations.map(conv => ({
      id: conv.userId,
      name: conv.userName,
      lastMessage: conv.lastMessage,
    }));
  } catch (error) {
    console.error('Erro ao carregar conversas:', error);
    clients.value = [];
  } finally {
    isLoadingClients.value = false;
  }
}

async function loadChatHistory(partnerId: number) {
  if (!myUserId.value) {
    console.error("myUserId não está definido. Impossível carregar histórico.");
    return;
  }

  isLoadingMessages.value = true;
  messages.value = [];

  try {
    const allUserMessages: ServerMessage[] = await listUserChats(myUserId.value);

    messages.value = allUserMessages
      .filter(msg =>
        (msg.senderUserId === myUserId.value && msg.recipientUserId === partnerId) ||
        (msg.senderUserId === partnerId && msg.recipientUserId === myUserId.value)
      )
      .map(msg => transformServerMessageToUIMessage(msg, myUserId.value))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    await scrollToBottom();
  } catch (error) {
    console.error('Erro ao carregar histórico de chat:', error);
  } finally {
    isLoadingMessages.value = false;
  }
}

async function selectClient(client: Client) {
  if (selectedClient.value?.id === client.id) return;

  selectedClient.value = client;
  await loadChatHistory(client.id);
}

function sendMessage() {
  if (!newMessage.value.trim() || !selectedClient.value || !socket || !myUserId.value) {
    if (!socket) console.error("Socket não conectado");
    if (!selectedClient.value) console.warn("Nenhum cliente selecionado para enviar mensagem");
    return;
  }

  const messageText = newMessage.value.trim();
  const messagePayload = {
    recipientUserId: selectedClient.value.id,
    message: messageText,
  };

  // Adicionar mensagem localmente para UX imediata
  const localMessage: Message = {
    id: `temp-${Date.now()}`,
    from: 'me',
    text: messageText,
    senderUserId: myUserId.value,
    recipientUserId: selectedClient.value.id,
    timestamp: new Date().toISOString(),
  };
  
  messages.value.push(localMessage);
  scrollToBottom();
  
  // Limpar campo antes de enviar
  newMessage.value = '';
  
  // Enviar mensagem via socket
  console.log('Enviando mensagem:', messagePayload);
  socket.emit('send_message', messagePayload);
}

function setupSocketListeners() {
  if (!socket) return;

  socket.on('connect', () => {
    if (myUserId.value) {
      socket?.emit('user_online', {userId: myUserId.value});
    } else {
      console.warn("myUserId não definido no momento da conexão do socket.")
    }
  });

  socket.on('receive_message', (serverMsg: ServerMessage) => {
    const uiMessage = transformServerMessageToUIMessage(serverMsg, myUserId.value);

    if (selectedClient.value &&
      ((uiMessage.senderUserId === myUserId.value && uiMessage.recipientUserId === selectedClient.value.id) ||
        (uiMessage.senderUserId === selectedClient.value.id && uiMessage.recipientUserId === myUserId.value))
    ) {
      messages.value.push(uiMessage);
      scrollToBottom();
    }

    const relevantClientUserId = serverMsg.senderUserId === myUserId.value ? serverMsg.recipientUserId : serverMsg.senderUserId;
    const clientInList = clients.value.find(c => c.id === relevantClientUserId);

    if (clientInList) {
      clientInList.lastMessage = uiMessage.text;
      clients.value = [clientInList, ...clients.value.filter(c => c.id !== clientInList.id)];
    } else {
        console.warn(`Cliente com ID ${relevantClientUserId} não encontrado na lista. Pode ser uma nova conversa.`);
    }
  });

  socket.on('message_sent_ack', (serverMsg: ServerMessage) => {
    console.log('Mensagem enviada confirmada:', serverMsg);
    
    // Atualizar a mensagem local temporária com o ID real do servidor
    if (selectedClient.value && serverMsg.recipientUserId === selectedClient.value.id) {
      const tempMsgIndex = messages.value.findIndex(m => 
        m.from === 'me' && 
        m.text === serverMsg.message && 
        typeof m.id === 'string' && 
        m.id.startsWith('temp-')
      );
      
      if (tempMsgIndex !== -1) {
        // Atualizar com dados reais do servidor
        messages.value[tempMsgIndex] = {
          ...messages.value[tempMsgIndex],
          id: serverMsg.id,
          timestamp: serverMsg.createdAt
        };
      }
    }

    // Atualizar a última mensagem na lista de clientes
    const clientToUpdate = clients.value.find(c => c.id === serverMsg.recipientUserId);
    if (clientToUpdate) {
      clientToUpdate.lastMessage = serverMsg.message;
      clients.value = [clientToUpdate, ...clients.value.filter(c => c.id !== clientToUpdate.id)];
    }
  });

  socket.on('error_message', (error: { message: string; details?: any }) => {
    console.error('Erro do servidor Socket:', error.message, error.details);
  });
}

onMounted(async () => {
  if (!myUserId.value) {
    console.error("ID do usuário não definido. Chat não pode ser inicializado.");
    return;
  }

  await loadConversations();

  socket = io(GATEWAY_URL, {});
  setupSocketListeners();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  overflow-y: hidden;
  height: 100%;
}

.fill-height {
  height: 100%;
}

.user-list-container, .chat-area-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-list-container .v-list {
  flex-grow: 1;
  overflow-y: auto;
}

.message-list {
  background-color: #f9f9f9;
  padding: 12px;
}

.message-text {
  word-break: break-word;
}

@media (max-width: 959px) {
  .user-list-container {
    border-right: none !important;
    border-bottom: 1px solid #ccc;
    max-height: 30vh;
  }

  .chat-area-container {
    padding-left: 0 !important;
  }

  .page-container {
    height: calc(100vh - 64px);
  }
}
</style>
