import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  useCarritoStore,
  calcularTotalCarrito,
  calcularCantidadCarrito,
} from "../../../store/carritoStore";

import { crearPedido } from "../../pedidos/services/pedidoService";
import type { PedidoCreate } from "../../pedidos/types/pedido";

// Las mismas fotografías que utiliza el catálogo público.
const imagenesProductos: Record<string, string> = {
  "hamburguesa vegetariana": "hamburguesa-vegetariana.jpg",
  "hamburguesa doble": "hamburguesa-doble.jpg",
  "hamburguesa clasica": "hamburguesa-clasica.jpg",
  "pizza muzzarella": "pizza-muzzarella.jpg",
  "pizza especial": "pizza-especial.jpg",
  "pizza napolitana": "pizza-napolitana.jpg",
  "gaseosa 500 ml": "gaseosa.jpg",
  "agua mineral 500 ml": "agua-mineral.jpg",
};

function imagenDeProducto(nombre: string): string | null {
  const normalizado = nombre.trim().toLocaleLowerCase("es-AR")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const archivo = imagenesProductos[normalizado];
  return archivo ? `/images/productos/${archivo}` : null;
}

export default function CarritoPage() {
  const queryClient = useQueryClient();

  const items = useCarritoStore((state) => state.items);
  const quitarProducto = useCarritoStore(
    (state) => state.quitarProducto
  );
  const actualizarCantidad = useCarritoStore(
    (state) => state.actualizarCantidad
  );
  const vaciarCarrito = useCarritoStore(
    (state) => state.vaciarCarrito
  );

  const [formaPago, setFormaPago] = useState("EFECTIVO");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [notas, setNotas] = useState("");

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const total = calcularTotalCarrito(items);
  const cantidad = calcularCantidadCarrito(items);

  const formatearPrecio = (precio: number) =>
    precio.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

  const campo =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-white dark:focus:!ring-blue-900";

  async function confirmarPedido(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (procesando) return;

    setError("");
    setMensaje("");

    if (items.length === 0) {
      setError("El carrito está vacío.");
      return;
    }

    if (!direccionEntrega.trim()) {
      setError("Ingresá una dirección de entrega.");
      return;
    }

    const cantidadesValidas = items.every(
      (item) =>
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0 &&
        item.cantidad <= item.stock
    );

    if (!cantidadesValidas) {
      setError(
        "Revisá las cantidades. No pueden superar el stock disponible."
      );
      return;
    }

    const datos: PedidoCreate = {
      forma_pago: formaPago,
      direccion_entrega: direccionEntrega.trim(),
      notas: notas.trim(),
      items: items.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
      })),
    };

    setProcesando(true);

    try {
      const pedido = await crearPedido(datos);

      vaciarCarrito();

      setDireccionEntrega("");
      setNotas("");
      setFormaPago("EFECTIVO");

      setMensaje(
        `¡Pedido #${pedido.id} confirmado correctamente! Total: ${formatearPrecio(pedido.total)}.`
      );

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: ["pedidos"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),
      ]);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo confirmar el pedido."
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:!bg-slate-900 dark:!text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:!text-white">
              🛒 Mi carrito
            </h1>

            <p className="mt-2 text-slate-600 dark:!text-slate-300">
              Revisá los productos antes de confirmar tu compra.
            </p>
          </div>

          <Link
            to="/catalogo"
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold !text-white hover:bg-blue-700"
          >
            Seguir comprando
          </Link>
        </div>

        {mensaje && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-300 bg-green-50 p-5 text-green-800 dark:!border-green-700 dark:!bg-green-950 dark:!text-green-200"
          >
            <p className="font-semibold">{mensaje}</p>

            <Link
              to="/pedidos"
              className="mt-3 inline-block font-semibold underline"
            >
              Ver mis pedidos
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 dark:!border-red-700 dark:!bg-red-950 dark:!text-red-200"
          >
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:!border-slate-600 dark:!bg-slate-800">
            <p className="text-xl font-semibold text-slate-900 dark:!text-white">
              Tu carrito está vacío.
            </p>

            <p className="mt-2 text-slate-600 dark:!text-slate-300">
              Agregá productos desde el catálogo.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:!border-slate-600 dark:!bg-slate-800">
              {items.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-200 p-5 last:border-b-0 dark:!border-slate-600"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {imagenDeProducto(item.nombre) && (
                      <img
                        src={imagenDeProducto(item.nombre)!}
                        alt={`Imagen de ${item.nombre}`}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 object-cover dark:!border-slate-600 sm:h-24 sm:w-24"
                      />
                    )}
                    <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 dark:!text-white">
                      {item.nombre}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:!text-slate-300">
                      Precio unitario:{" "}
                      {formatearPrecio(item.precio_unitario)}
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:!text-slate-300">
                      Stock disponible: {item.stock}
                    </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                      onClick={() =>
                        actualizarCantidad(
                          item.producto_id,
                          item.cantidad - 1
                        )
                      }
                      disabled={procesando || item.cantidad <= 1}
                      className="rounded-lg border border-slate-400 bg-white px-3 py-2 !text-slate-900 hover:bg-slate-100 disabled:opacity-40 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-white dark:hover:!bg-slate-600"
                    >
                      −
                    </button>

                    <span className="min-w-8 text-center font-semibold text-slate-900 dark:!text-white">
                      {item.cantidad}
                    </span>

                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                      onClick={() =>
                        actualizarCantidad(
                          item.producto_id,
                          item.cantidad + 1
                        )
                      }
                      disabled={
                        procesando || item.cantidad >= item.stock
                      }
                      className="rounded-lg border border-slate-400 bg-white px-3 py-2 !text-slate-900 hover:bg-slate-100 disabled:opacity-40 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-white dark:hover:!bg-slate-600"
                    >
                      +
                    </button>
                  </div>

                  <div className="min-w-32 text-right">
                    <p className="font-bold text-emerald-700 dark:!text-emerald-400">
                      {formatearPrecio(
                        item.precio_unitario * item.cantidad
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() =>
                      quitarProducto(item.producto_id)
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold !text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:!border-slate-600 dark:!bg-slate-800">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-lg text-slate-900 dark:!text-white">
                  Productos: {cantidad}
                </span>

                <button
                  type="button"
                  disabled={procesando}
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Querés eliminar todos los productos del carrito?"
                      )
                    ) {
                      vaciarCarrito();
                    }
                  }}
                  className="font-semibold text-red-600 hover:underline disabled:opacity-50 dark:!text-red-400"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-5 dark:!border-slate-600">
                <span className="text-xl font-bold text-slate-900 dark:!text-white">
                  Total
                </span>

                <span className="text-2xl font-bold text-emerald-700 dark:!text-emerald-400">
                  {formatearPrecio(total)}
                </span>
              </div>
            </div>

            <form
              onSubmit={confirmarPedido}
              className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:!border-slate-600 dark:!bg-slate-800"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:!text-white">
                  Confirmar compra
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:!text-slate-300">
                  Completá los datos para registrar tu pedido.
                </p>
              </div>

              <div>
                <label
                  htmlFor="forma-pago"
                  className="font-semibold text-slate-900 dark:!text-white"
                >
                  Forma de pago
                </label>

                <select
                  id="forma-pago"
                  value={formaPago}
                  onChange={(evento) =>
                    setFormaPago(evento.target.value)
                  }
                  disabled={procesando}
                  className={campo}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="direccion-entrega"
                  className="font-semibold text-slate-900 dark:!text-white"
                >
                  Dirección de entrega *
                </label>

                <input
                  id="direccion-entrega"
                  type="text"
                  required
                  maxLength={250}
                  placeholder="Ej.: Calle 123, San Nicolás"
                  value={direccionEntrega}
                  onChange={(evento) =>
                    setDireccionEntrega(evento.target.value)
                  }
                  disabled={procesando}
                  className={campo}
                />
              </div>

              <div>
                <label
                  htmlFor="notas-pedido"
                  className="font-semibold text-slate-900 dark:!text-white"
                >
                  Notas adicionales (opcional)
                </label>

                <textarea
                  id="notas-pedido"
                  rows={3}
                  placeholder="Ej.: Sin cebolla, tocar timbre..."
                  value={notas}
                  onChange={(evento) =>
                    setNotas(evento.target.value)
                  }
                  disabled={procesando}
                  className={campo}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:!border-slate-600">
                <p className="text-lg font-bold text-slate-900 dark:!text-white">
                  Total:{" "}
                  <span className="text-emerald-700 dark:!text-emerald-400">
                    {formatearPrecio(total)}
                  </span>
                </p>

                <button
                  type="submit"
                  disabled={procesando}
                  className="rounded-lg bg-green-600 px-6 py-3 font-bold !text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {procesando
                    ? "Confirmando pedido..."
                    : "Confirmar pedido"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
