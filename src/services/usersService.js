import axios from 'axios';
import router from "@/router/index.ts";

const collection = "/users";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
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

export const getUsers = async (page = 1, size = 10, search = "") => {
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

export const getUser = async (id) => {
  const res = await api.get(`${collection}/${id}`);
  return res.data;
};

export const addUser = async (id, data) => {
  const res = await api.put(collection, data);
  return res.status;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`${collection}/${id}`, data);
  return res.status;
};

export const toggleUserActive = async (id) => {
  const res = await api.patch(`${collection}/${id}/toggle-status`);
  return res.status;
};

export const updateUserRole = async (id, data) => {
  const res = await api.patch(`${collection}/${id}/role`, data);
  return res.status;
};

export const resetUserPassword = async (id) => {
  const res = await api.post(`${collection}/${id}/reset-password`);
  return res.status;
};

export default api;
