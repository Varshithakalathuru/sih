import axios from 'axios';

const client = axios.create({
  baseURL: 'https://mospi-backend.onrender.com/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mospi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
