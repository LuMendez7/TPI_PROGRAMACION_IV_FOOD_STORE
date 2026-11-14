
import axios from "axios";
import { useNotificationStore } from "@/stores/notificationStore";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";

      const esAutenticacion =
        url.includes("/auth/login") ||
        url.includes("/auth/token") ||
        url.includes("/auth/me") ||
        url.includes("/auth/register");

      if (!esAutenticacion) {
        const { useAuthStore } = await import(
          "../stores/authStore"
        );

        useAuthStore.setState({
          usuario: null,
          error: null,
        });
      }
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      useNotificationStore
        .getState()
        .showNotification(
          "Acceso denegado: no tenés permisos para esta operación.",
          "error"
        );
    }

    return Promise.reject(error);
  }
);
