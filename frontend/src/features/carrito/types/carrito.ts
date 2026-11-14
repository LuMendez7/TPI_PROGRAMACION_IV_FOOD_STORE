
export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
}

export interface EstadoCarrito {
  items: ItemCarrito[];
  agregarProducto: (producto: Omit<ItemCarrito, "cantidad">) => void;
  quitarProducto: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
}
