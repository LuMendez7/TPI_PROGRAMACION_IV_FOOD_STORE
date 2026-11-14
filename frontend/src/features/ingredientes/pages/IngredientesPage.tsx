
import { useState } from "react";
import type { FormEvent } from "react";

import { useAuthStore } from "../../../stores/authStore";

import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "../hooks/useIngredients";

import type {
  Ingrediente,
  IngredienteInput,
} from "../types/ingrediente";

const datosIniciales: IngredienteInput = {
  nombre: "",
  descripcion: "",
  precio: 0,
  disponible: true,
};

export default function IngredientesPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.rol === "ADMIN";

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editando, setEditando] =
    useState<Ingrediente | null>(null);

  const [formulario, setFormulario] =
    useState<IngredienteInput>({
      ...datosIniciales,
    });

  const [error, setError] = useState("");

  // Consulta mediante hook personalizado
  const {
    data: ingredientes = [],
    isLoading,
    isError,
  } = useIngredients();

  // Mutaciones mediante hooks personalizados
  const crearMutation = useCreateIngredient();
  const actualizarMutation = useUpdateIngredient();
  const eliminarMutation = useDeleteIngredient();

  const guardando =
    crearMutation.isPending || actualizarMutation.isPending;

  function nuevoIngrediente() {
    if (!esAdmin) return;

    setFormulario({ ...datosIniciales });
    setEditando(null);
    setError("");
    setMostrarFormulario(true);
  }

  function editarIngrediente(ingrediente: Ingrediente) {
    if (!esAdmin) return;

    setFormulario({
      nombre: ingrediente.nombre,
      descripcion: ingrediente.descripcion,
      precio: ingrediente.precio,
      disponible: ingrediente.disponible,
    });

    setEditando(ingrediente);
    setError("");
    setMostrarFormulario(true);
  }

  async function guardar(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!esAdmin) {
      setError(
        "No tenés permisos para modificar ingredientes."
      );
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (formulario.precio < 0) {
      setError("El precio no puede ser negativo.");
      return;
    }

    const datos: IngredienteInput = {
      ...formulario,
      nombre: formulario.nombre.trim(),
    };

    try {
      setError("");

      if (editando) {
        await actualizarMutation.mutateAsync({
          id: editando.id,
          datos,
        });
      } else {
        await crearMutation.mutateAsync(datos);
      }

      setMostrarFormulario(false);
      setEditando(null);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar el ingrediente"
      );
    }
  }

  async function confirmarEliminar(
    ingrediente: Ingrediente
  ) {
    if (!esAdmin) return;

    if (
      !window.confirm(
        `¿Eliminar el ingrediente "${ingrediente.nombre}"?`
      )
    ) {
      return;
    }

    try {
      setError("");

      await eliminarMutation.mutateAsync(
        ingrediente.id
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar el ingrediente"
      );
    }
  }

  const campo =
    "w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-white dark:focus:border-blue-400";

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Ingredientes
        </h1>

        {esAdmin && (
          <button
            onClick={nuevoIngrediente}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            + Nuevo ingrediente
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:!bg-red-950 dark:!text-red-200"
        >
          {error}
        </div>
      )}

      {mostrarFormulario && esAdmin && (
        <form
          onSubmit={(evento) => void guardar(evento)}
          className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow dark:!border-slate-600 dark:!bg-slate-800 dark:!text-white"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:!text-white">
            {editando
              ? "Editar ingrediente"
              : "Nuevo ingrediente"}
          </h2>

          <label className="block text-slate-700 dark:!text-slate-100">
            Nombre
            <input
              className={campo}
              value={formulario.nombre}
              required
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  nombre: e.target.value,
                })
              }
            />
          </label>

          <label className="block text-slate-700 dark:!text-slate-100">
            Descripción
            <textarea
              className={campo}
              rows={3}
              value={formulario.descripcion}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  descripcion: e.target.value,
                })
              }
            />
          </label>

          <label className="block text-slate-700 dark:!text-slate-100">
            Precio
            <input
              className={campo}
              type="number"
              min="0"
              step="0.01"
              required
              value={formulario.precio}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  precio: Number(e.target.value),
                })
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
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : "Guardar"}
            </button>

            <button
              type="button"
              disabled={guardando}
              onClick={() => {
                setMostrarFormulario(false);
                setError("");
              }}
              className="rounded-lg bg-gray-500 px-4 py-2 text-white disabled:opacity-50 dark:!bg-slate-600 dark:!text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <p>Cargando ingredientes...</p>
      )}

      {isError && (
        <p className="text-red-600">
          No se pudieron cargar los ingredientes.
        </p>
      )}

      {!isLoading &&
        !isError &&
        ingredientes.length === 0 && (
          <p>No hay ingredientes registrados.</p>
        )}

      {!isLoading &&
        !isError &&
        ingredientes.length > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Disponible</th>

                  {esAdmin && (
                    <th className="p-3">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {ingredientes.map((ingrediente) => (
                  <tr
                    key={ingrediente.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {ingrediente.id}
                    </td>
                    <td className="p-3">
                      {ingrediente.nombre}
                    </td>
                    <td className="p-3">
                      {ingrediente.descripcion}
                    </td>
                    <td className="p-3">
                      ${ingrediente.precio.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {ingrediente.disponible
                        ? "Sí"
                        : "No"}
                    </td>

                    {esAdmin && (
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              editarIngrediente(
                                ingrediente
                              )
                            }
                            className="rounded bg-amber-500 px-3 py-1 text-white"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              void confirmarEliminar(
                                ingrediente
                              )
                            }
                            disabled={
                              eliminarMutation.isPending
                            }
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
