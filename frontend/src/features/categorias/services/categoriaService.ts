
import axios from 'axios'

import { api } from '../../../api/axios'

import type {
  Categoria,
  CategoriaInput,
} from '../types/categoria'

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

export async function listarCategorias(): Promise<Categoria[]> {
  try {
    const response = await api.get<Categoria[]>('/categorias/')
    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function crearCategoria(
  categoria: CategoriaInput
): Promise<Categoria> {
  try {
    const response = await api.post<Categoria>(
      '/categorias/',
      categoria
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function actualizarCategoria(
  id: number,
  categoria: CategoriaInput
): Promise<Categoria> {
  try {
    const response = await api.put<Categoria>(
      `/categorias/${id}`,
      categoria
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function eliminarCategoria(id: number): Promise<void> {
  try {
    await api.delete(`/categorias/${id}`)
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}
