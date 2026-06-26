// frontend/src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
});

apiClient.interceptors.request.use((config) => {
  config.headers['x-tenant-id'] = 'company1'; 
  return config;
});

export default apiClient;