import axios from 'axios';

const collection = "/users";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async (page = 1, size = 10) => {
  const res = await api.get(collection, {
    params: {
      _page: page,
      _size: size,
    }
  });

  return res.data;
};

export const getUser = async (id) => {
  const res = await api.get(`${collection}/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`${collection}/${id}`, data);
  return res.status;
};

export const toggleUserActive = async (id) => {
  const res = await api.patch(`${collection}/${id}/toggle-status`);
  return res.status;
};

export const addUserRoles = async (id, data) => {
  const res = await api.patch(`${collection}/${id}/add-roles`, data);
  return res.status;
};

export const removeUserRoles = async (id, data) => {
  const res = await api.patch(`${collection}/${id}/remove-roles`, data);
  return res.status;
};

export default api;
