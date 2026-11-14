
import axios from 'axios'

import { api } from '../../../api/axios'

import type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
} from '../types/producto'

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detalle: unknown = error.response?.data?.detail

    if (typeof detalle === 'string') {
      return detalle
    }

    if (error.response?.status === 401) {
      return 'Debés iniciar sesión para realizar esta operación.'
    }

    if (error.response?.status === 403) {
      return 'No tenés permisos para realizar esta operación.'
    }

    return `Error HTTP ${error.response?.status ?? 'de conexión'}`
  }

  return error instanceof Error
    ? error.message
    : 'Error desconocido'
}

export async function listarProductos(): Promise<Producto[]> {
  try {
    const response = await api.get<Producto[]>('/productos/')
    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function crearProducto(
  producto: ProductoCreate
): Promise<Producto> {
  try {
    const response = await api.post<Producto>(
      '/productos/',
      producto
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function actualizarProducto(
  id: number,
  producto: ProductoUpdate
): Promise<Producto> {
  try {
    const response = await api.put<Producto>(
      `/productos/${id}`,
      producto
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function eliminarProducto(id: number): Promise<void> {
  try {
    await api.delete(`/productos/${id}`)
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}
