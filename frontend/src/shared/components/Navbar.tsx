import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useThemeStore } from "@/stores/themeStore";
import { useCarritoStore, calcularCantidadCarrito } from "@/store/carritoStore";

const enlaceBase =
  "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors";

function estiloEnlace({ isActive }: { isActive: boolean }) {
  return `${enlaceBase} ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-200 hover:bg-slate-800 hover:text-white"
  }`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, cargando, inicializado, logout } = useAuth();
  const darkMode = useThemeStore((state) => state.darkMode);
  const cambiarTema = useThemeStore((state) => state.toggleTheme);
  const items = useCarritoStore((state) => state.items);
  const cantidadCarrito = calcularCantidadCarrito(items);
  const esAdmin = usuario?.rol.toLowerCase() === "admin";

  async function cerrarSesion() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      alert("No se pudo cerrar la sesión.");
    }
  }

  return (
    <nav className="border-b border-slate-700 bg-slate-900 text-white" aria-label="Navegación principal">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <NavLink
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xl font-bold tracking-tight hover:text-blue-200"
          >
            <span aria-hidden="true">🍽️</span>
            Food Store
          </NavLink>

          <div className="flex flex-wrap items-center gap-2">
            {inicializado && usuario && (
              <span className="hidden max-w-56 truncate text-sm text-slate-300 sm:inline" title={`${usuario.nombre} (${usuario.rol})`}>
                {usuario.nombre} ({usuario.rol})
              </span>
            )}

            <button
              type="button"
              onClick={cambiarTema}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
              aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro"}
            </button>

            {!inicializado ? (
              <span className="text-sm text-slate-300">Verificando sesión...</span>
            ) : usuario ? (
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                disabled={cargando}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <NavLink to="/login" className={estiloEnlace}>Iniciar sesión</NavLink>
                <NavLink to="/register" className={estiloEnlace}>Registrarse</NavLink>
              </>
            )}
          </div>
        </div>

        {inicializado && usuario && (
          <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-700 pt-3">
            <NavLink to="/catalogo" className={estiloEnlace}>Catálogo</NavLink>
            <NavLink to="/categories" className={estiloEnlace}>Categorías</NavLink>
            <NavLink to="/products" className={estiloEnlace}>Productos</NavLink>
            <NavLink to="/pedidos" className={estiloEnlace}>Pedidos</NavLink>
            {esAdmin && (
              <NavLink to="/admin/users" className={estiloEnlace}>Usuarios</NavLink>
            )}
            <NavLink to="/carrito" className={estiloEnlace}>
              <span aria-hidden="true" className="mr-1">🛒</span>
              Carrito{cantidadCarrito > 0 ? ` (${cantidadCarrito})` : ""}
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
