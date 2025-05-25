import axios from 'axios';

const collection = "/chats";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const listUserChats = async (userId) => {
  const res = await api.get(`${collection}/${userId}`);
  return res.data;
};

export const listConversations = async () => {
  const res = await api.get(`${collection}/conversations`);
  return res.data;
};

export default api;
