import { useState } from "react";
import "../../../styles/ajustesTablas.css";
import type { FormEvent } from "react";

import { useAuthStore } from "../../../stores/authStore";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useProducts";

import type {
  Producto,
  ProductoCreate,
} from "../types/producto";

const formularioInicial: ProductoCreate = {
  nombre: "",
  descripcion: "",
  precio_base: 0,
  stock: 0,
  disponible: true,
  categoria_id: 1,
  ingredientes_ids: [],
};

export default function ProductosPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.rol === "ADMIN";

  // Consulta mediante hook personalizado
  const {
    data: productos = [],
    isLoading: cargando,
    error: errorConsulta,
  } = useProducts();

  // Mutaciones mediante hooks personalizados
  const crearMutation = useCreateProduct();
  const actualizarMutation = useUpdateProduct();
  const eliminarMutation = useDeleteProduct();

  const guardando =
    crearMutation.isPending || actualizarMutation.isPending;

  const [formulario, setFormulario] = useState<ProductoCreate>({
    ...formularioInicial,
  });

  const [ingredientesTexto, setIngredientesTexto] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState("");

  function nuevoProducto() {
    if (!esAdmin) return;

    setFormulario({
      ...formularioInicial,
      ingredientes_ids: [],
    });

    setIngredientesTexto("");
    setEditandoId(null);
    setError("");
    setMostrarFormulario(true);
  }

  function editarProducto(producto: Producto) {
    if (!esAdmin) return;

    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio_base: producto.precio_base,
      stock: producto.stock,
      disponible: producto.disponible,
      categoria_id: producto.categoria_id,
      ingredientes_ids: producto.ingredientes_ids ?? [],
    });

    setIngredientesTexto((producto.ingredientes_ids ?? []).join(", "));
    setEditandoId(producto.id);
    setError("");
    setMostrarFormulario(true);
  }

  async function guardarProducto(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!esAdmin) {
      setError("No tenés permisos para modificar productos.");
      return;
    }

    const partes = ingredientesTexto
      .split(",")
      .map((valor) => valor.trim())
      .filter(Boolean);

    const ids = partes.map(Number);

    if (
      ids.some(
        (id) => !Number.isInteger(id) || id <= 0
      )
    ) {
      setError(
        "Los ingredientes deben tener IDs enteros positivos."
      );
      return;
    }

    if (
      !formulario.nombre.trim() ||
      formulario.precio_base <= 0 ||
      !Number.isInteger(formulario.stock) ||
      formulario.stock < 0 ||
      formulario.categoria_id <= 0
    ) {
      setError(
        "Completá nombre, precio válido y categoría."
      );
      return;
    }

    const datos: ProductoCreate = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      ingredientes_ids: ids,
    };

    try {
      setError("");

      if (editandoId === null) {
        await crearMutation.mutateAsync(datos);
      } else {
        await actualizarMutation.mutateAsync({
          id: editandoId,
          datos,
        });
      }

      setMostrarFormulario(false);
      setEditandoId(null);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar el producto"
      );
    }
  }

  async function borrarProducto(producto: Producto) {
    if (!esAdmin) return;

    if (
      !window.confirm(
        `¿Eliminar el producto "${producto.nombre}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      await eliminarMutation.mutateAsync(producto.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar el producto"
      );
    }
  }

  // Estilos exclusivos de los campos del formulario
  const campo =
    "w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400";

  const etiqueta =
    "block text-slate-700 dark:!text-slate-100";

  return (
    <section className="p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Productos
        </h1>

        {esAdmin && (
          <button
            onClick={nuevoProducto}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            + Nuevo producto
          </button>
        )}
      </div>

      {(error || errorConsulta) && (
        <p
          role="alert"
          className="mb-4 text-red-600 dark:!text-red-400"
        >
          {error || errorConsulta?.message}
        </p>
      )}

      {mostrarFormulario && esAdmin && (
        <form
          onSubmit={(evento) => void guardarProducto(evento)}
          className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-slate-800 shadow dark:!border-slate-600 dark:!bg-slate-800 dark:!text-white"
        >
          <h2 className="text-xl font-semibold text-slate-800 dark:!text-white">
            {editandoId === null
              ? "Crear producto"
              : "Editar producto"}
          </h2>

          <label className={etiqueta}>
            Nombre
            <input
              className={campo}
              required
              value={formulario.nombre}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  nombre: e.target.value,
                })
              }
            />
          </label>

          <label className={etiqueta}>
            Descripción
            <textarea
              className={campo}
              value={formulario.descripcion}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  descripcion: e.target.value,
                })
              }
            />
          </label>

          <label className={etiqueta}>
            Precio base
            <input
              className={campo}
              type="number"
              min="0.01"
              step="0.01"
              required
              value={formulario.precio_base}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  precio_base: Number(e.target.value),
                })
              }
            />
          </label>

          <label className={etiqueta}>
            Stock (unidades disponibles)
            <input
              className={campo}
              type="number"
              min="0"
              step="1"
              required
              value={formulario.stock}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  stock: Number(e.target.value),
                })
              }
            />
          </label>

          <label className={etiqueta}>
            ID de categoría
            <input
              className={campo}
              type="number"
              min="1"
              required
              value={formulario.categoria_id}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  categoria_id: Number(e.target.value),
                })
              }
            />
          </label>

          <label className={etiqueta}>
            IDs de ingredientes (separados por comas)
            <input
              className={campo}
              placeholder="Ejemplo: 1, 2, 3"
              value={ingredientesTexto}
              onChange={(e) =>
                setIngredientesTexto(e.target.value)
              }
            />
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:!text-slate-100">
            <input
              type="checkbox"
              checked={formulario.disponible}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  disponible: e.target.checked,
                })
              }
            />
            Disponible
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              disabled={guardando}
              onClick={() => {
                setMostrarFormulario(false);
                setError("");
              }}
              className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50 dark:!bg-slate-600 dark:!text-white dark:hover:!bg-slate-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : errorConsulta ? null : productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:!border-slate-600 dark:!bg-slate-800 dark:!text-white">
          <table className="foodstore-productos-tabla w-full border-collapse text-left">
            <thead className="bg-slate-800 text-white dark:!bg-slate-700">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Disponible</th>
                {esAdmin && (
                  <th className="p-3">Acciones</th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white text-slate-900 dark:!bg-slate-800 dark:!text-white">
              {productos.map((producto) => (
                <tr
                  key={producto.id}
                  className="border-t border-slate-200 dark:!border-slate-600"
                >
                  <td className="p-3">
                    {producto.id}
                  </td>
                  <td className="p-3">
                    {producto.nombre}
                  </td>
                  <td className="p-3">
                    {producto.precio_base.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3">
                    {producto.categoria_id}
                  </td>
                  <td className="p-3">
                    {producto.stock}
                  </td>
                  <td className="p-3">
                    {producto.disponible
                      ? "Sí"
                      : "No"}
                  </td>

                  {esAdmin && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            editarProducto(producto)
                          }
                          className="rounded bg-yellow-500 px-3 py-1 text-white"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            void borrarProducto(producto)
                          }
                          disabled={eliminarMutation.isPending}
                          className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
