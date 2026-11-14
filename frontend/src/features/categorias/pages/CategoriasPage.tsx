
import { useState } from "react";

import CategoriaModal from "../components/CategoriaModal";
import CategoriaTable from "../components/CategoriaTable";

import { useAuthStore } from "../../../stores/authStore";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useCategories";

import type {
  Categoria,
  CategoriaInput,
} from "../types/categoria";

export default function CategoriasPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.rol === "ADMIN";

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] =
    useState<Categoria | null>(null);
  const [mensajeError, setMensajeError] = useState("");

  const {
    data: categorias = [],
    isLoading,
    isError,
  } = useCategories();

  const crearMutation = useCreateCategory();
  const actualizarMutation = useUpdateCategory();
  const eliminarMutation = useDeleteCategory();

  const guardando =
    crearMutation.isPending || actualizarMutation.isPending;

  function abrirNuevo() {
    if (!esAdmin) return;

    setCategoriaEditar(null);
    setMensajeError("");
    setModalAbierto(true);
  }

  function abrirEditar(categoria: Categoria) {
    if (!esAdmin) return;

    setCategoriaEditar(categoria);
    setMensajeError("");
    setModalAbierto(true);
  }

  async function guardar(datos: CategoriaInput) {
    if (!esAdmin) {
      setMensajeError(
        "No tenés permisos para modificar categorías."
      );
      return;
    }

    try {
      setMensajeError("");

      if (categoriaEditar) {
        await actualizarMutation.mutateAsync({
          id: categoriaEditar.id,
          datos,
        });
      } else {
        await crearMutation.mutateAsync(datos);
      }

      setModalAbierto(false);
      setCategoriaEditar(null);
      setMensajeError("");
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : "Error al guardar la categoría."
      );
    }
  }

  function confirmarEliminar(categoria: Categoria) {
    if (!esAdmin) return;

    if (
      !window.confirm(
        `¿Eliminar la categoría "${categoria.nombre}"?`
      )
    ) {
      return;
    }

    setMensajeError("");

    eliminarMutation.mutate(categoria.id, {
      onError: (error) => {
        setMensajeError(
          error instanceof Error
            ? error.message
            : "Error al eliminar la categoría."
        );
      },
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Categorías
          </h1>

          <p className="mt-2 text-slate-500 dark:!text-slate-300">
            Gestioná las categorías de Food Store.
          </p>
        </div>

        {esAdmin && (
          <button
            type="button"
            onClick={abrirNuevo}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            + Nueva categoría
          </button>
        )}
      </div>

      {mensajeError && (
        <div
          role="alert"
          className="rounded-lg bg-red-100 p-3 text-red-700 dark:!bg-red-950 dark:!text-red-200"
        >
          {mensajeError}
        </div>
      )}

      {isLoading && (
        <p>Cargando categorías...</p>
      )}

      {isError && (
        <p className="text-red-600 dark:!text-red-400">
          No se pudieron cargar las categorías.
        </p>
      )}

      {!isLoading &&
        !isError &&
        categorias.length === 0 && (
          <p>No hay categorías registradas.</p>
        )}

      {!isLoading &&
        !isError &&
        categorias.length > 0 && (
          <CategoriaTable
            categorias={categorias}
            esAdmin={esAdmin}
            onEditar={abrirEditar}
            onEliminar={confirmarEliminar}
          />
        )}

      {modalAbierto && esAdmin && (
        <CategoriaModal
          key={categoriaEditar?.id ?? "nueva"}
          categoria={categoriaEditar}
          guardando={guardando}
          onGuardar={guardar}
          onCerrar={() => {
            if (guardando) return;

            setModalAbierto(false);
            setMensajeError("");
          }}
        />
      )}
    </section>
  );
}
