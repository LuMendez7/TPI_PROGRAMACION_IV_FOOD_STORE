import { useNotificationStore } from "@/stores/notificationStore";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  listarIngredientes,
  crearIngrediente,
  actualizarIngrediente,
  eliminarIngrediente,
} from "../services/ingredienteService";

import type {
  Ingrediente,
  IngredienteInput,
} from "../types/ingrediente";

export const ingredientsQueryKey = ["ingredientes"] as const;

export function useIngredients() {
  return useQuery<Ingrediente[], Error>({
    queryKey: ingredientsQueryKey,
    queryFn: listarIngredientes,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: IngredienteInput) =>
      crearIngrediente(datos),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Ingrediente creado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: ingredientsQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number;
      datos: IngredienteInput;
    }) => actualizarIngrediente(id, datos),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Ingrediente actualizado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: ingredientsQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      eliminarIngrediente(id),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Ingrediente eliminado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: ingredientsQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}
