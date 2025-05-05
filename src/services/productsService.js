import axios from 'axios';

const collection = "/products";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (page = 1, size = 10) => {
  const res = await api.get(collection, {
    params: {
      _page: page,
      _size: size,
    }
  });

  return res.data;
};

export const getProduct = async (id) => {
  const res = await api.get(`${collection}/${id}`);
  return res.data;
};

export const createProduct = async (data) => {
  console.log(data)
  const res = await api.post(collection, data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.put(`${collection}/${id}`, data);
  return res.status;
};

export const toggleProductActive = async (id) => {
  const res = await api.patch(`${collection}/${id}/toggle-status`);
  return res.status;
};

export default api;
