
import { api } from "./api";

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
}

export async function listarProductos(): Promise<Producto[]> {
  const respuesta = await api.get<Producto[]>("/productos/");
  return respuesta.data;
}
