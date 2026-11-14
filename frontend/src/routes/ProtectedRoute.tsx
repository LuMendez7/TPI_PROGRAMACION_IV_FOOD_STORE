
import { Navigate, Outlet } from "react-router-dom";

import {
  useAuthStore,
  type RolUsuario,
} from "../stores/authStore";

interface ProtectedRouteProps {
  allowedRoles?: RolUsuario[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const inicializado = useAuthStore((state) => state.inicializado);

  if (!inicializado) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(usuario.rol.toLowerCase() as RolUsuario)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
