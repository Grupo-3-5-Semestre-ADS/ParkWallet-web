import axios from 'axios';
import router from "@/router/index.ts";

const collection = "/products";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      router.push('/login?sessionExpired=true').then();
    }

    return Promise.reject(error);
  }
);

export const getProducts = async (page = 1, size = 10, search = "") => {
  const params = {
    _page: page,
    _size: size,
  };

  if (search && search.trim() !== "") {
    params.search = search.trim();
  }

  const res = await api.get(collection, {params});

  return res.data;
};

export const getProduct = async (id) => {
  const res = await api.get(`${collection}/${id}`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await api.post(collection, data);
  return res.status;
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
