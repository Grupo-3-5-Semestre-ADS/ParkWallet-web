import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (data) => {
  const res = await api.post("/login", data);
  return res.data;
};

export default api;
