import axios from 'axios';

const collection = "/roles";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getRoles = async (page = 1, size = 10) => {
  const res = await api.get(collection, {
    params: {
      _page: page,
      _size: size,
    }
  });

  return res.data;
};

export default api;
