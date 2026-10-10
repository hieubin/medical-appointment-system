import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    error.message = payload?.message || error.message || "Yêu cầu thất bại.";
    error.errors = payload?.errors;
    return Promise.reject(error);
  },
);
