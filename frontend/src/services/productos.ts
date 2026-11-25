
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

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export async function listarProductos(): Promise<Producto[]> {
  const productos: Producto[] = [];
  const limite = 100;
  let skip = 0;

  while (true) {
    const respuesta = await api.get<ProductosPaginados>(
      "/productos/paginados",
      {
        params: {
          skip,
          limit: limite,
        },
      }
    );

    const pagina = respuesta.data;

    productos.push(...pagina.items);
    skip += pagina.items.length;

    if (pagina.items.length === 0 || skip >= pagina.total) {
      break;
    }
  }

  return productos;
}

export interface FiltrosCatalogo {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
}

export async function listarProductosPaginados(
  filtros: FiltrosCatalogo
): Promise<ProductosPaginados> {
  const respuesta = await api.get<ProductosPaginados>(
    "/productos/",
    { params: filtros }
  );

  return respuesta.data;
}
