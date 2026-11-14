export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  stock: number;
  disponible: boolean;
  categoria_id: number;
  ingredientes_ids: number[];
}

export type ProductoCreate = Omit<Producto, "id">;

export type ProductoUpdate = ProductoCreate;
