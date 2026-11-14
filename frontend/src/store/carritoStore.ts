
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  EstadoCarrito,
  ItemCarrito,
} from "../features/carrito/types/carrito";

export const useCarritoStore = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],

      agregarProducto: (producto) =>
        set((state) => {
          if (producto.stock <= 0) return state;

          const existente = state.items.find(
            (item) => item.producto_id === producto.producto_id
          );

          if (existente) {
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.producto_id
                  ? {
                      ...item,
                      cantidad: Math.min(
                        item.cantidad + 1,
                        producto.stock
                      ),
                      stock: producto.stock,
                      precio_unitario: producto.precio_unitario,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...producto,
                cantidad: 1,
              },
            ],
          };
        }),

      quitarProducto: (productoId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto_id !== productoId
          ),
        })),

      actualizarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.producto_id !== productoId) return item;

            const nuevaCantidad = Math.max(
              1,
              Math.min(Math.trunc(cantidad) || 1, item.stock)
            );

            return {
              ...item,
              cantidad: nuevaCantidad,
            };
          }),
        })),

      vaciarCarrito: () => set({ items: [] }),
    }),
    {
      name: "food-store-carrito",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

export const calcularTotalCarrito = (items: ItemCarrito[]) =>
  items.reduce(
    (total, item) =>
      total + item.precio_unitario * item.cantidad,
    0
  );

export const calcularCantidadCarrito = (items: ItemCarrito[]) =>
  items.reduce((total, item) => total + item.cantidad, 0);
