import { useNotificationStore } from "@/stores/notificationStore";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../services/categoriaService";

import type {
  Categoria,
  CategoriaInput,
} from "../types/categoria";

export const categoriesQueryKey = ["categorias"] as const;

export function useCategories() {
  return useQuery<Categoria[], Error>({
    queryKey: categoriesQueryKey,
    queryFn: listarCategorias,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: CategoriaInput) =>
      crearCategoria(datos),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Categoría creado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number;
      datos: CategoriaInput;
    }) => actualizarCategoria(id, datos),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Categoría actualizado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      eliminarCategoria(id),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Categoría eliminado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}
