
export { default as PedidosPage } from "./pages/PedidosPage";

export {
  listarPedidos,
  crearPedido,
  cambiarEstadoPedido,
} from "./services/pedidoService";

export type {
  Pedido,
  PedidoCreate,
  DetallePedido,
  DetallePedidoCreate,
  PedidoEstadoActualizar,
} from "./types/pedido";
