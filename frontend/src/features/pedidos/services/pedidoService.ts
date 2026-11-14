
import axios from "axios";

import { api } from "../../../api/axios";

import type {
  Pedido,
  PedidoCreate,
  PedidoEstadoActualizar,
} from "../types/pedido";

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detalle: unknown = error.response?.data?.detail;

    if (typeof detalle === "string") {
      return detalle;
    }

    if (Array.isArray(detalle)) {
      return detalle
        .map((item: { msg?: string }) => item.msg ?? "Dato inválido")
        .join(", ");
    }

    if (error.response?.status === 401) {
      return "Debés iniciar sesión.";
    }

    if (error.response?.status === 403) {
      return "No tenés permisos para realizar esta operación.";
    }

    return "No se pudo completar la operación.";
  }

  return error instanceof Error
    ? error.message
    : "Error desconocido.";
}

export async function listarPedidos(
  esAdmin: boolean
): Promise<Pedido[]> {
  try {
    const ruta = esAdmin
      ? "/pedidos/admin/todos"
      : "/pedidos/mis-pedidos";

    const respuesta = await api.get<Pedido[]>(ruta);
    return respuesta.data;
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

export async function crearPedido(
  datos: PedidoCreate
): Promise<Pedido> {
  try {
    const respuesta = await api.post<Pedido>(
      "/pedidos/",
      datos
    );

    return respuesta.data;
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

export async function cambiarEstadoPedido(
  id: number,
  datos: PedidoEstadoActualizar
): Promise<Pedido> {
  try {
    const respuesta = await api.patch<Pedido>(
      `/pedidos/${id}/estado`,
      datos
    );

    return respuesta.data;
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}
