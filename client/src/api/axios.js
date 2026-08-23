import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor to handle errors globally if needed
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You could handle global 401s here to redirect to login
        return Promise.reject(error);
    }
);

export default api;
