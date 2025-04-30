import axios from 'axios';

const collection = "/facilities";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFacilities = async () => {
  const res = await api.get(collection);
  return res.data;
};

export const getFacility = async (id) => {
  const res = await api.get(`${collection}/${id}`);
  return res.data;
};

export const createFacility = async (data) => {
  console.log(data)
  const res = await api.post(collection, data);
  return res.data;
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
