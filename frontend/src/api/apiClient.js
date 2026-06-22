import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000', // ඔබේ NestJS server එකේ port එක
});

// Tenant ID එක Header එකට එකතු කිරීම
apiClient.interceptors.request.use((config) => {
    config.headers['x-tenant-id'] = 'company1'; // තාවකාලිකව පරීක්ෂා කිරීමට 'company1' ලෙස යොදන්න
    return config;
});

export default apiClient;