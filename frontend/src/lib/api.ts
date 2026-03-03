import axios from "axios";
import { API_BASE_URL } from "./constants";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        // We will store token in localStorage
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            if (typeof window !== "undefined") {
                // Auto logout if needed, but be careful of loops
                // localStorage.removeItem("token");
                // window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
