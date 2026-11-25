import { useState } from "react";
import "../../../styles/ajustesTablas.css";
import { useForm } from "@tanstack/react-form";

import { useAuthStore } from "../../../stores/authStore";
import { useCategories } from "../../categorias/hooks/useCategories";
import ProductoTable from "../components/ProductoTable";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateProductStock,
} from "../hooks/useProducts";

import type {
  Producto,
  ProductoCreate,
} from "../types/producto";

const formularioInicial: ProductoCreate = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  precio_base: 0,
  stock: 0,
  disponible: true,
  categoria_id: 0,
  ingredientes_ids: [],
};

export default function ProductosPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.rol === "ADMIN";

  const {
    data: categorias = [],
    isLoading: cargandoCategorias,
    isError: errorCategorias,
  } = useCategories();

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
  const stockMutation = useUpdateProductStock();

  const guardando =
    crearMutation.isPending || actualizarMutation.isPending;

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      ...formularioInicial,
      imagen_url: "",
      ingredientesTexto: "",
    },

    onSubmit: async ({ value }) => {
      await guardarProducto(value);
    },
  });

  function nuevoProducto() {
    if (!esAdmin) return;

    form.reset({
      ...formularioInicial,
      imagen_url: "",
      ingredientesTexto: "",
      categoria_id: categorias[0]?.id ?? 0,
    });

    setEditandoId(null);
    setError("");
    setMostrarFormulario(true);
  }

  function editarProducto(producto: Producto) {
    if (!esAdmin) return;

    form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen_url: producto.imagen_url ?? "",
      precio_base: producto.precio_base,
      stock: producto.stock,
      disponible: producto.disponible,
      categoria_id: producto.categoria_id,
      ingredientes_ids: producto.ingredientes_ids ?? [],
      ingredientesTexto: (producto.ingredientes_ids ?? []).join(", "),
    });

    setEditandoId(producto.id);
    setError("");
    setMostrarFormulario(true);
  }

  async function guardarProducto(
    formulario: ProductoCreate & {
      ingredientesTexto: string;
      imagen_url: string;
    }
  ) {
    if (!esAdmin) {
      setError("No tenes permisos para modificar productos.");
      return;
    }

    const ids = formulario.ingredientesTexto
      .split(",")
      .map((valor) => valor.trim())
      .filter(Boolean)
      .map(Number);

    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      setError("Los ingredientes deben tener IDs enteros positivos.");
      return;
    }

    if (
      !formulario.nombre.trim() ||
      !Number.isFinite(formulario.precio_base) ||
      formulario.precio_base <= 0 ||
      !Number.isInteger(formulario.stock) ||
      formulario.stock < 0 ||
      formulario.categoria_id <= 0
    ) {
      setError("Completa nombre, precio, stock y categoria validos.");
      return;
    }

    const imagen = formulario.imagen_url.trim();

    if (imagen) {
      try {
        const url = new URL(imagen);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Protocolo invalido");
        }
      } catch {
        setError("Ingresa una URL de imagen HTTP o HTTPS valida.");
        return;
      }
    }

    const datos: ProductoCreate = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion,
      imagen_url: imagen || null,
      precio_base: formulario.precio_base,
      stock: formulario.stock,
      disponible: formulario.disponible,
      categoria_id: formulario.categoria_id,
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

  async function cambiarStock(producto: Producto) {
    if (!esAdmin) return;

    const entrada = window.prompt(
      `Nuevo stock para "${producto.nombre}" (actual: ${producto.stock}):`,
      String(producto.stock)
    );

    if (entrada === null) return;
    const valor = entrada.trim();
    const nuevoStock = Number(valor);

    if (valor === "" || !Number.isSafeInteger(nuevoStock) || nuevoStock < 0) {
      setError("El stock debe ser un número entero igual o mayor que cero.");
      return;
    }

    try {
      setError("");
      const disponible = window.confirm(
        "Aceptar: producto disponible. Cancelar: producto no disponible."
      );

      await stockMutation.mutateAsync({
        id: producto.id,
        stock: nuevoStock,
        disponible,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el stock.");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-producto"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-800 shadow-2xl dark:!bg-slate-800 dark:!text-white"
          >
            <form
              className="space-y-4"
              onSubmit={(evento) => {
                evento.preventDefault();
                evento.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <h2 id="titulo-producto" className="text-2xl font-bold">
                {editandoId === null ? "Crear producto" : "Editar producto"}
              </h2>

              {error && (
                <p role="alert" className="rounded-lg bg-red-100 p-3 text-red-700 dark:!bg-red-950 dark:!text-red-200">
                  {error}
                </p>
              )}

              <form.Field name="nombre">
                {(field) => (
                  <label className={etiqueta}>
                    Nombre
                    <input
                      className={campo}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                )}
              </form.Field>

              <form.Field name="categoria_id">
                {(field) => (
                  <label className={etiqueta}>
                    Categor&iacute;a
                    <select
                      className={campo}
                      required
                      disabled={cargandoCategorias || errorCategorias}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    >
                      <option value={0}>Selecciona una categoria</option>

                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </form.Field>

              {errorCategorias && (
                <p className="text-sm text-red-600">
                  No se pudieron cargar las categorias.
                </p>
              )}

              <form.Field name="descripcion">
                {(field) => (
                  <label className={etiqueta}>
                    Descripci&oacute;n
                    <textarea
                      className={campo}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                )}
              </form.Field>

              <form.Field name="imagen_url">
                {(field) => (
                  <label className={etiqueta}>
                    URL de imagen
                    <input
                      type="url"
                      className={campo}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="precio_base">
                  {(field) => (
                    <label className={etiqueta}>
                      Precio base
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        className={campo}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                      />
                    </label>
                  )}
                </form.Field>

                <form.Field name="stock">
                  {(field) => (
                    <label className={etiqueta}>
                      Stock
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        className={campo}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                      />
                    </label>
                  )}
                </form.Field>
              </div>

              <form.Field name="ingredientesTexto">
                {(field) => (
                  <label className={etiqueta}>
                    IDs de ingredientes (separados por comas)
                    <input
                      className={campo}
                      placeholder="Ejemplo: 1, 2, 3"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                )}
              </form.Field>

              <form.Field name="disponible">
                {(field) => (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    Disponible
                  </label>
                )}
              </form.Field>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:!border-slate-600">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => {
                    setMostrarFormulario(false);
                    setError("");
                  }}
                  className="rounded-lg bg-slate-500 px-4 py-2 text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : errorConsulta ? null : productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <ProductoTable
          productos={productos}
          esAdmin={esAdmin}
          eliminando={eliminarMutation.isPending}
          actualizandoStock={stockMutation.isPending}
          onActualizarStock={(producto) => void cambiarStock(producto)}
          onEditar={editarProducto}
          onEliminar={(producto) => void borrarProducto(producto)}
        />
      )}
    </section>
  );
}
