import axios from 'axios';

const collection = "/facilities";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFacilities = async (page = 1, size = 10, search = "") => {
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

export const getFacility = async (id) => {
  const res = await api.get(`${collection}/${id}`);
  return res.data;
};

export const getFacilityProducts = async (id) => {
  const res = await api.get(`${collection}/${id}/products`);
  return res.data;
};

export const getFacilityTransactions = async (id, page = 1, size = 10) => {
  const res = await api.get(`${collection}/${id}/transactions`, {
    params: {
      _page: page,
      _size: size,
    }
  });

  return res.data;
};

export const createFacility = async (data) => {
  const res = await api.post(collection, data);
  return res.status;
};

export const updateFacility = async (id, data) => {
  const res = await api.put(`${collection}/${id}`, data);
  return res.status;
};

export const toggleFacilityActive = async (id) => {
  const res = await api.patch(`${collection}/${id}/toggle-status`);
  return res.status;
};

export default api;
