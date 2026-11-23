import { useNotificationStore } from "@/stores/notificationStore";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStockProducto,
} from "../services/productoService";

import type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
} from "../types/producto";

export const productsQueryKey = ["productos"] as const;

export function useProducts() {
  return useQuery<Producto[], Error>({
    queryKey: productsQueryKey,
    queryFn: listarProductos,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: ProductoCreate) =>
      crearProducto(datos),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Producto creado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: productsQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number;
      datos: ProductoUpdate;
    }) => actualizarProducto(id, datos),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Producto actualizado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: productsQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      eliminarProducto(id),

    onSuccess: () => {
      useNotificationStore.getState().showNotification("Producto eliminado correctamente.", "success");
      void queryClient.invalidateQueries({
        queryKey: productsQueryKey,
      });
    },
    onError: () => {
      useNotificationStore.getState().showNotification("No se pudo completar la operación.", "error");
    },
  });
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      stock,
    }: {
      id: number;
      stock: number;
    }) => actualizarStockProducto(id, stock),

    onSuccess: () => {
      useNotificationStore
        .getState()
        .showNotification(
          "Stock actualizado correctamente.",
          "success"
        );

      void queryClient.invalidateQueries({
        queryKey: productsQueryKey,
      });

      void queryClient.invalidateQueries({
        queryKey: ["catalogo", "productos"],
      });
    },

    onError: () => {
      useNotificationStore
        .getState()
        .showNotification(
          "No se pudo actualizar el stock.",
          "error"
        );
    },
  });
}