import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (data) => {
  const res = await api.post("/login", data);

  console.log(res)

  return res;
};

export default api;
