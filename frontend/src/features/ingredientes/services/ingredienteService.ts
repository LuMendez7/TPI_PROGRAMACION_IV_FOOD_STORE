
import axios from 'axios'

import { api } from '../../../api/axios'

import type {
  Ingrediente,
  IngredienteInput,
} from '../types/ingrediente'

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

export async function listarIngredientes(): Promise<Ingrediente[]> {
  try {
    const response = await api.get<Ingrediente[]>(
      '/ingredientes/'
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function crearIngrediente(
  datos: IngredienteInput
): Promise<Ingrediente> {
  try {
    const response = await api.post<Ingrediente>(
      '/ingredientes/',
      datos
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function actualizarIngrediente(
  id: number,
  datos: IngredienteInput
): Promise<Ingrediente> {
  try {
    const response = await api.put<Ingrediente>(
      `/ingredientes/${id}`,
      datos
    )

    return response.data
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}

export async function eliminarIngrediente(id: number): Promise<void> {
  try {
    await api.delete(`/ingredientes/${id}`)
  } catch (error) {
    throw new Error(obtenerMensajeError(error), { cause: error })
  }
}
