
import { useAuthStore } from "../../../stores/authStore";

export function useAuth() {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const inicializado = useAuthStore(
    (state) => state.inicializado
  );
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const cargarUsuario = useAuthStore(
    (state) => state.cargarUsuario
  );

  const limpiarError = useAuthStore(
    (state) => state.limpiarError
  );

  return {
    usuario,
    cargando,
    inicializado,
    error,
    login,
    logout,
    cargarUsuario,
    limpiarError,
    estaAutenticado: usuario !== null,
    esAdmin: usuario?.rol === "ADMIN",
  };
}
