
import axios from "axios";
import { create } from "zustand";

import { api } from "../api/axios";

export type RolUsuario = "admin" | "user";

export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: RolUsuario;
  disabled: boolean;

  // Compatibilidad temporal con componentes heredados
  nombre: string;
  rol: "ADMIN" | "USER";
  activo: boolean;
}

interface UsuarioAPI {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: RolUsuario;
  disabled: boolean;
}

function adaptarUsuario(datos: UsuarioAPI): Usuario {
  return {
    ...datos,
    nombre: datos.full_name,
    rol: datos.role === "admin" ? "ADMIN" : "USER",
    activo: !datos.disabled,
  };
}

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  inicializado: boolean;
  error: string | null;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
  cargarUsuario: () => Promise<void>;
  limpiarError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  usuario: null,
  cargando: false,
  inicializado: false,
  error: null,

  login: async (username, password) => {
    set({ cargando: true, error: null });

    try {
      await api.post("/auth/login", {
        username,
        password,
      });

      const respuesta = await api.get<UsuarioAPI>("/auth/me");

      set({
        usuario: adaptarUsuario(respuesta.data),
        cargando: false,
        inicializado: true,
        error: null,
      });
    } catch (error) {
      let mensaje = "Usuario o contraseña incorrectos";

      if (axios.isAxiosError(error)) {
        const detalle: unknown = error.response?.data?.detail;

        if (error.response?.status === 403) {
          mensaje = "Tu cuenta está deshabilitada";
        } else if (!error.response) {
          mensaje = "No se pudo conectar con el servidor";
        } else if (
          typeof detalle === "string" &&
          error.response.status !== 401
        ) {
          mensaje = detalle;
        }
      }

      set({
        usuario: null,
        cargando: false,
        inicializado: true,
        error: mensaje,
      });

      throw new Error(mensaje, { cause: error });
    }
  },

  logout: async () => {
    set({ cargando: true, error: null });

    try {
      await api.post("/auth/logout");

      set({
        usuario: null,
        cargando: false,
        inicializado: true,
        error: null,
      });
    } catch (error) {
      set({
        cargando: false,
        error: "No se pudo cerrar la sesión",
      });

      throw new Error("No se pudo cerrar la sesión", {
        cause: error,
      });
    }
  },

  cargarUsuario: async () => {
    set({
      cargando: true,
      inicializado: false,
      error: null,
    });

    try {
      const respuesta = await api.get<UsuarioAPI>("/auth/me");

      set({
        usuario: adaptarUsuario(respuesta.data),
        cargando: false,
        inicializado: true,
        error: null,
      });
    } catch {
      set({
        usuario: null,
        cargando: false,
        inicializado: true,
        error: null,
      });
    }
  },

  limpiarError: () => set({ error: null }),
}));
