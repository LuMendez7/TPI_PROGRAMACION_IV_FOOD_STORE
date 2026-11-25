import { Link } from "react-router-dom";

import {
  useCarritoStore,
  calcularTotalCarrito,
  calcularCantidadCarrito,
} from "../../../store/carritoStore";


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

  const total = calcularTotalCarrito(items);
  const cantidad = calcularCantidadCarrito(items);

  const formatearPrecio = (precio: number) =>
    precio.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

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
                      disabled={item.cantidad <= 1}
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
                        item.cantidad >= item.stock
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

            <div className="flex justify-end">
              <Link
                to="/checkout"
                className="rounded-lg bg-green-600 px-6 py-3 font-bold !text-white hover:bg-green-700"
              >
                Continuar al pago
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
