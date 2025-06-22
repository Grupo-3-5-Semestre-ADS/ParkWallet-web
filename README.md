# Frontend - ParkWallet

Esta é a aplicação web (frontend) para o projeto ParkWallet. Construída com Vue.js e Vuetify, ela fornece a interface do
usuário para interagir com todos os serviços do backend, como gerenciamento de contas, visualização de estabelecimentos,
transações e chat em tempo real.

A aplicação foi projetada para se comunicar com
o [Backend Monorepo - ParkWallet](https://github.com/Grupo-3-5-Semestre-ADS/ParkWallet-backend), consumindo os endpoints
expostos pelo API Gateway.

## ✨ Funcionalidades Principais

* **✅ Autenticação de Usuários**: Login e registro de novos clientes.
* **🗺️ Visualização de Estabelecimentos**: Integração com Google Maps para localizar estacionamentos parceiros.
* **💳 Carteira Digital e Transações**: Gerenciamento de saldo, histórico de transações e pagamentos via QR Code.
* **💬 Chat em Tempo Real**: Comunicação direta com o suporte ou estabelecimentos.
* **🔔 Central de Notificações**: Recebimento de alertas e atualizações importantes.
* **📱 Design Responsivo**: Interface adaptável para desktops e dispositivos móveis.

## 🛠️ Tecnologias Utilizadas

| Categoria                   | Tecnologia                                                                                 | Descrição                                                        |
|:----------------------------|:-------------------------------------------------------------------------------------------|:-----------------------------------------------------------------|
| **Framework**               | [Vue 3](https://v3.vuejs.org/)                                                             | Framework progressivo para construção de interfaces.             |
| **UI Framework**            | [Vuetify 3](https://vuetifyjs.com/en/)                                                     | Biblioteca de componentes Material Design para Vue.              |
| **Roteamento**              | [Vue Router](https://router.vuejs.org/)                                                    | Roteador oficial para aplicações de página única (SPA) com Vue.  |
| **Gerenciamento de Estado** | [Pinia](https://pinia.vuejs.org/)                                                          | Solução de gerenciamento de estado intuitiva e modular para Vue. |
| **Comunicação API**         | [Axios](https://axios-http.com/)                                                           | Cliente HTTP baseado em Promises para requisições ao backend.    |
| **Comunicação Real-Time**   | [Socket.IO Client](https://socket.io/docs/v4/client-api/)                                  | Biblioteca para comunicação em tempo real via WebSockets.        |
| **Mapas**                   | [vue3-google-map](https://github.com/inocan-group/vue3-google-map)                         | Integração de mapas do Google em componentes Vue.                |
| **Formulários**             | [Vee-Validate](https://vee-validate.logaretm.com/) + [Yup](https://github.com/jquense/yup) | Validação de formulários declarativa e robusta.                  |
| **Build Tool**              | [Vite](https://vitejs.dev/)                                                                | Ferramenta de build moderna e extremamente rápida.               |
| **Testes**                  | [Vitest](https://vitest.dev/)                                                              | Framework de testes unitários otimizado para Vite.               |
| **Linguagem**               | [TypeScript](https://www.typescriptlang.org/)                                              | Superset do JavaScript que adiciona tipagem estática.            |

## 📋 Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 22.x ou superior recomendada)
* [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) ou [pnpm](https://pnpm.io/)

## 🚀 Como Iniciar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Grupo-3-5-Semestre-ADS/ParkWallet-web.git
   cd ParkWallet-web
   ```

2. **Instale as dependências:**
   Escolha seu gerenciador de pacotes preferido:
   ```bash
   # Usando npm
   npm install

   # Usando yarn
   yarn install
   ```

3. **Configure as Variáveis de Ambiente:**
   Para que o frontend se comunique com o backend, é crucial configurar o endereço da API. Crie um arquivo `.env` na
   raiz do projeto, copiando o exemplo de `.env.example`.

   Crie o arquivo `.env`:
   ```bash
   cp .env.example .env
   ```

   O conteúdo do seu `.env` deve ser o seguinte, apontando para o API Gateway do backend:
   ```env
   # URL base para o API Gateway do backend
   VITE_GOOGLE_MAPS_API_KEY=<chave da api do google maps>
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Execute o servidor de desenvolvimento:**
   O projeto estará disponível em `http://localhost:3000`.
   ```bash
   npm run dev
   ```

5. **Build para Produção:**
   Para compilar e minificar os arquivos para produção:
   ```bash
   npm run build
   ```
   Os arquivos prontos para deploy estarão no diretório `dist/`.

6. **Execute os Testes:**
   Para rodar os testes unitários definidos no projeto:
   ```bash
   # Rodar todos os testes no terminal
   npm run test

   # Abrir a interface gráfica do Vitest para testes interativos
   npm run test:ui
   ```

## 📑 Licença

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present Vuetify, LLC
