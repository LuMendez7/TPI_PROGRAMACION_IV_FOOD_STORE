import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "@/shared/components/Navbar";
import ProtectedRoute from "@/routes/ProtectedRoute";
import CatalogoPage from "@/pages/CatalogoPage";
import CarritoPage from "@/features/carrito/pages/CarritoPage";

import { LoginPage, RegistroPage, UnauthorizedPage } from "@/features/auth";
import { CategoriasPage } from "@/features/categorias";
import { ProductosPage } from "@/features/productos";
import { IngredientesPage } from "@/features/ingredientes";
import { PedidosPage } from "@/features/pedidos";
import { AdminUsersPage } from "@/features/usuarios";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl p-6">
        <Routes>
          <Route path="/" element={<CatalogoPage />} />

          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistroPage />} />
          <Route path="/registro" element={<Navigate to="/register" replace />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/categories" element={<CategoriasPage />} />
            <Route path="/products" element={<ProductosPage />} />
            <Route path="/ingredients" element={<IngredientesPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/carrito" element={<CarritoPage />} />
          </Route>

          {/* Rutas exclusivas de ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          {/* Redirecciones de compatibilidad */}
          <Route path="/categorias" element={<Navigate to="/categories" replace />} />
          <Route path="/productos" element={<Navigate to="/products" replace />} />
          <Route path="/ingredientes" element={<Navigate to="/ingredients" replace />} />

          {/* Ruta desconocida */}
          <Route path="*" element={<Navigate to="/catalogo" replace />} />
        </Routes>
      </main>
    </>
  );
}
