import { useState, type FormEvent } from "react";
import "../../../styles/ajustesTablas.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../../../stores/authStore";
import { listarProductos } from "../../productos/services/productoService";
import {
  listarPedidos,
  crearPedido,
  cambiarEstadoPedido,
  cancelarPedidoCliente,
  listarPedidosPaginados,
} from "../services/pedidoService";
import type { PedidoCreate, DetallePedidoCreate } from "../types/pedido";

const TRANSICIONES_PERMITIDAS: Record<string, string[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const dinero = (valor: number) =>
  valor.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const campo =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-white dark:focus:!ring-blue-900";

const botonAzul =
  "rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

function formularioVacio(): PedidoCreate {
  return {
    forma_pago: "EFECTIVO",
    direccion_entrega: "",
    notas: "",
    items: [{ producto_id: 0, cantidad: 1 }],
  };
}

function etiquetaEstado(estado: string) {
  const estilos: Record<string, string> = {
    PENDIENTE:
      "bg-amber-100 text-amber-900 dark:!bg-amber-900/40 dark:!text-amber-200",
    EN_PREPARACION:
      "bg-violet-100 text-violet-800 dark:!bg-violet-900/40 dark:!text-violet-200",
    ENTREGADO:
      "bg-green-100 text-green-800 dark:!bg-green-900/40 dark:!text-green-200",
    CANCELADO:
      "bg-red-100 text-red-800 dark:!bg-red-900/40 dark:!text-red-200",
  };

  const estadoNormalizado = estado.toUpperCase();

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[estadoNormalizado] ??
        "bg-slate-100 text-slate-800 dark:!bg-slate-700 dark:!text-white"
      }`}
    >
      {estadoNormalizado.replaceAll("_", " ")}
    </span>
  );
}

export default function PedidosPage() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.rol === "ADMIN";

  const [formulario, setFormulario] = useState<PedidoCreate>(formularioVacio());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [detallesAbiertos, setDetallesAbiertos] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [pagina, setPagina] = useState(1);

  const {
    data: resultadoPedidos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pedidos", esAdmin, pagina],
    queryFn: async () => {
      if (esAdmin) {
        return await listarPedidosPaginados(pagina, 10);
      }

      const pedidos = await listarPedidos(false);

      return {
        pagina: 1,
        limite: pedidos.length,
        total: pedidos.length,
        paginas: 1,
        pedidos,
      };
    },
    enabled: Boolean(usuario),
  });

  const pedidos = resultadoPedidos?.pedidos ?? [];
  const totalPaginas = resultadoPedidos?.paginas ?? 1;

  const {
    data: productos = [],
    isLoading: cargandoProductos,
    isError: errorProductos,
  } = useQuery({
    queryKey: ["productos"],
    queryFn: listarProductos,
    enabled: mostrarFormulario,
  });
  const cancelarMutation = useMutation({
    mutationFn: cancelarPedidoCliente,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]);

      setError("");
      setMensaje("Pedido cancelado y stock restituido correctamente.");
    },
    onError: (err: Error) => {
      setMensaje("");
      setError(err.message);
    },
  });

  function cancelarPedido(id: number) {
    if (!window.confirm(`¿Confirmás cancelar el pedido #${id}?`)) {
      return;
    }

    setError("");
    setMensaje("");
    cancelarMutation.mutate(id);
  }

  const crearMutation = useMutation({
    mutationFn: crearPedido,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]);
      setFormulario(formularioVacio());
      setMostrarFormulario(false);
      setError("");
      setMensaje("Pedido creado correctamente.");
    },
    onError: (err: Error) => setError(err.message),
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      cambiarEstadoPedido(id, { estado }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]);
      setError("");
      setMensaje("Estado actualizado correctamente.");
    },
    onError: (err: Error) => setError(err.message),
  });

  function modificarItem(
    indice: number,
    campoItem: keyof DetallePedidoCreate,
    valor: number
  ) {
    setFormulario((actual) => ({
      ...actual,
      items: actual.items.map((item, i) =>
        i === indice ? { ...item, [campoItem]: valor } : item
      ),
    }));
  }

  function agregarItem() {
    setFormulario((actual) => ({
      ...actual,
      items: [...actual.items, { producto_id: 0, cantidad: 1 }],
    }));
  }

  function quitarItem(indice: number) {
    setFormulario((actual) => ({
      ...actual,
      items: actual.items.filter((_, i) => i !== indice),
    }));
  }

  function guardarPedido(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!formulario.direccion_entrega.trim()) {
      setError("Ingresá la dirección de entrega.");
      return;
    }
    if (
      formulario.items.length === 0 ||
      formulario.items.some(
        (item) =>
          item.producto_id <= 0 ||
          !Number.isInteger(item.cantidad) ||
          item.cantidad <= 0
      )
    ) {
      setError("Seleccioná productos y cantidades válidas.");
      return;
    }
    const ids = formulario.items.map((item) => item.producto_id);
    if (new Set(ids).size !== ids.length) {
      setError("No repitas productos; modificá la cantidad.");
      return;
    }
    setError("");
    setMensaje("");
    crearMutation.mutate({
      ...formulario,
      direccion_entrega: formulario.direccion_entrega.trim(),
    });
  }

  function actualizarEstado(id: number, estado: string) {
    if (!window.confirm(`¿Confirmás cambiar el pedido #${id} a "${estado}"?`)) {
      return;
    }
    setError("");
    setMensaje("");
    estadoMutation.mutate({ id, estado });
  }

  function alternarDetalle(id: number) {
    setDetallesAbiertos((actual) =>
      actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id]
    );
  }

  const totalEstimado = formulario.items.reduce((total, item) => {
    const producto = productos.find((p) => p.id === item.producto_id);
    return total + (producto?.precio_base ?? 0) * item.cantidad;
  }, 0);

  return (
    <section className="space-y-6 text-slate-900 dark:!text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {esAdmin ? "Administración de pedidos" : "Mis pedidos"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:!text-slate-300">
            {esAdmin
              ? "Consultá los pedidos registrados y gestioná sus estados."
              : "Consultá el estado y el detalle de tus compras."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormulario(formularioVacio());
            setError("");
            setMensaje("");
            setMostrarFormulario((actual) => !actual);
          }}
          className={botonAzul}
        >
          {mostrarFormulario ? "Cerrar formulario" : "+ Nuevo pedido"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-100 p-3 text-red-800 dark:!bg-red-950 dark:!text-red-200">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="rounded-lg bg-green-100 p-3 text-green-800 dark:!bg-green-950 dark:!text-green-200">
          {mensaje}
        </p>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={guardarPedido}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:!border-slate-600 dark:!bg-slate-800 dark:!text-slate-100"
        >
          <h2 className="text-xl font-bold">Nuevo pedido</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Forma de pago
              <select
                className={campo}
                value={formulario.forma_pago}
                onChange={(e) =>
                  setFormulario({ ...formulario, forma_pago: e.target.value })
                }
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Dirección de entrega
              <input
                className={campo}
                required
                value={formulario.direccion_entrega}
                onChange={(e) =>
                  setFormulario({ ...formulario, direccion_entrega: e.target.value })
                }
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Notas (opcional)
            <textarea
              className={campo}
              rows={2}
              value={formulario.notas}
              onChange={(e) =>
                setFormulario({ ...formulario, notas: e.target.value })
              }
            />
          </label>
          <h3 className="text-lg font-semibold">Productos del pedido</h3>
          {cargandoProductos && <p>Cargando productos...</p>}
          {errorProductos && (
            <p className="text-red-600 dark:!text-red-300">No se pudieron cargar los productos.</p>
          )}
          {formulario.items.map((item, indice) => (
            <div
              key={indice}
              className="grid items-end gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] dark:!border-slate-600"
            >
              <label className="block text-sm font-medium">
                Producto
                <select
                  className={campo}
                  required
                  value={item.producto_id}
                  onChange={(e) =>
                    modificarItem(indice, "producto_id", Number(e.target.value))
                  }
                >
                  <option value={0}>Seleccionar producto</option>
                  {productos
                    .filter((p) => p.disponible || p.id === item.producto_id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - {dinero(p.precio_base)}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Cantidad
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  className={campo}
                  value={item.cantidad}
                  onChange={(e) =>
                    modificarItem(indice, "cantidad", Number(e.target.value))
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => quitarItem(indice)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={agregarItem}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
          >
            + Agregar producto
          </button>
          <p className="text-lg font-bold">Total estimado: {dinero(totalEstimado)}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={crearMutation.isPending || cargandoProductos || errorProductos}
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {crearMutation.isPending ? "Guardando..." : "Confirmar pedido"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isLoading && <p>Cargando pedidos...</p>}
      {isError && (
        <p role="alert" className="text-red-600 dark:!text-red-300">
          No se pudieron cargar los pedidos.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:!border-slate-600 dark:!bg-slate-800">
          <table className="foodstore-pedidos-tabla w-full table-fixed border-collapse text-left text-sm text-slate-900 dark:!text-slate-100">
            <colgroup>
              <col style={{ width: esAdmin ? "10%" : "12%" }} />
              {esAdmin && <col style={{ width: "15%" }} />}
              <col style={{ width: "20%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: esAdmin ? "20%" : "33%" }} />
            </colgroup>
            <thead className="bg-slate-800 text-white dark:!bg-slate-700">
              <tr>
                <th className="p-4">ID</th>
                {esAdmin && <th className="p-4">Usuario</th>}
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Pago</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 && (
                <tr>
                  <td
                    colSpan={esAdmin ? 6 : 5}
                    className="p-6 text-center text-slate-600 dark:!text-slate-300"
                  >
                    No hay pedidos registrados.
                  </td>
                </tr>
              )}
              {pedidos.map((pedido) => {
                const abierto = detallesAbiertos.includes(pedido.id);
                const estadoActual = pedido.estado.toUpperCase();

                const opcionesEstado =
                  TRANSICIONES_PERMITIDAS[estadoActual] ?? [];

                const puedeCambiarEstado =
                  esAdmin && opcionesEstado.length > 0;

                return (
                  <tr key={pedido.id}>
                    <td colSpan={esAdmin ? 6 : 5} className="p-0">
                      <table className="w-full table-fixed border-collapse text-left text-sm">
                        <colgroup>
                          <col style={{ width: esAdmin ? "10%" : "12%" }} />
                          {esAdmin && <col style={{ width: "15%" }} />}
                          <col style={{ width: "20%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "19%" }} />
                          <col style={{ width: esAdmin ? "20%" : "33%" }} />
                        </colgroup>
                        <tbody>
                          <tr className="border-t border-slate-200 bg-white text-slate-900 dark:!border-slate-600 dark:!bg-slate-800 dark:!text-slate-100">
                            <td className="p-4 font-semibold">#{pedido.id}</td>
                            {esAdmin && <td className="p-4">Usuario #{pedido.usuario_id}</td>}
                            <td className="p-4 text-center">{etiquetaEstado(pedido.estado)}</td>
                            <td className="p-4 text-center capitalize">{pedido.forma_pago}</td>
                            <td className="p-4 font-semibold">{dinero(pedido.total)}</td>
                            <td className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => alternarDetalle(pedido.id)}
                                aria-expanded={abierto}
                                className="rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
                              >
                                {abierto ? "Ocultar detalle" : "Ver detalle"}
                              </button>
                              {!esAdmin && estadoActual === "PENDIENTE" && (
                                <button
                                  type="button"
                                  onClick={() => cancelarPedido(pedido.id)}
                                  disabled={cancelarMutation.isPending}
                                  className="ml-2 rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {cancelarMutation.isPending
                                    ? "Procesando..."
                                    : "Cancelar pedido"}
                                </button>
                              )}
                            </td>
                          </tr>
                          {abierto && (
                            <tr className="border-t border-slate-200 bg-slate-50 text-slate-900 dark:!border-slate-600 dark:!bg-slate-900/40 dark:!text-slate-100">
                              <td colSpan={esAdmin ? 6 : 5} className="p-4 md:p-6">
                                <div className="mb-4 grid gap-2 text-sm md:grid-cols-2">
                                  <p><strong>Dirección:</strong> {pedido.direccion_entrega}</p>
                                  <p><strong>Forma de pago:</strong> {pedido.forma_pago}</p>
                                  {pedido.notas && (
                                    <p className="md:col-span-2"><strong>Notas:</strong> {pedido.notas}</p>
                                  )}
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:!border-slate-600">
                                  <table className="w-full border-collapse text-left text-sm">
                                    <thead className="bg-slate-700 text-white">
                                      <tr>
                                        <th className="p-3">Producto</th>
                                        <th className="p-3">Cantidad</th>
                                        <th className="p-3">Precio</th>
                                        <th className="p-3">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white text-slate-900 dark:!bg-slate-800 dark:!text-slate-100">
                                      {pedido.items.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-200 dark:!border-slate-600">
                                          <td className="p-3">{item.nombre_producto}</td>
                                          <td className="p-3">{item.cantidad}</td>
                                          <td className="p-3">{dinero(item.precio_unitario)}</td>
                                          <td className="p-3">{dinero(item.subtotal)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {puedeCambiarEstado && (
                                  <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <label htmlFor={`estado-${pedido.id}`} className="font-medium">
                                      Cambiar estado:
                                    </label>
                                    <select
                                      id={`estado-${pedido.id}`}
                                      className={`${campo} !mt-0 max-w-xs`}
                                    value=""
                                    disabled={estadoMutation.isPending}
                                    onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                                    >
                                      <option value="" disabled>
                                        Seleccionar nuevo estado
                                      </option>

                                      {opcionesEstado.map((estado) => (
                                        <option key={estado} value={estado}>
                                          {estado.replaceAll("_", " ")}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {esAdmin && !isLoading && !isError && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => setPagina((actual) => actual - 1)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="font-medium">
            Página {pagina} de {totalPaginas}
          </span>

          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((actual) => actual + 1)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}
