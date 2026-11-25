import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listarProductosPaginados, type Producto } from "../services/productos";
import { useCategories } from "../features/categorias/hooks/useCategories";
import Skeleton from "../shared/components/Skeleton";
import EstadoVacio from "../shared/components/EstadoVacio";
import Paginacion from "../shared/components/Paginacion";
import { useCarritoStore, calcularCantidadCarrito } from "../store/carritoStore";
import "./CatalogoPage.css";

const imagenes: Record<string, string> = {
  "hamburguesa vegetariana": "hamburguesa-vegetariana.jpg",
  "hamburguesa doble": "hamburguesa-doble.jpg",
  "hamburguesa clásica": "hamburguesa-clasica.jpg",
  "hamburguesa clasica": "hamburguesa-clasica.jpg",
  "pizza muzzarella": "pizza-muzzarella.jpg",
  "pizza especial": "pizza-especial.jpg",
  "pizza napolitana": "pizza-napolitana.jpg",
  "gaseosa 500 ml": "gaseosa.jpg",
  "agua mineral 500 ml": "agua-mineral.jpg",
};

function imagenDeProducto(nombre: string): string | null {
  const normalizado = nombre.trim().toLocaleLowerCase("es-AR");
  const archivo = imagenes[normalizado];
  return archivo ? `/images/productos/${archivo}` : null;
}

export default function CatalogoPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [pagina, setPagina] = useState(0);

  const limite = 8;

  const { data: categorias = [] } = useCategories();

  const {
    data,
    isLoading: cargando,
    isError,
  } = useQuery({
    queryKey: [
      "catalogo",
      "productos",
      pagina,
      busqueda,
      categoriaId,
    ],
    queryFn: () =>
      listarProductosPaginados({
        skip: pagina * limite,
        limit: limite,
        search: busqueda.trim() || undefined,
        categoria_id: categoriaId
          ? Number(categoriaId)
          : undefined,
      }),
    staleTime: 30_000,
  });

  const productos = data?.items ?? [];
  const total = data?.total ?? 0;

  function limpiarFiltros() {
    setBusqueda("");
    setCategoriaId("");
    setPagina(0);
  }

  const error = isError ? "No se pudieron cargar los productos." : "";
  const [mensaje, setMensaje] = useState("");
  const items = useCarritoStore((state) => state.items);
  const agregarProducto = useCarritoStore((state) => state.agregarProducto);
  const cantidadCarrito = calcularCantidadCarrito(items);

  function agregarAlCarrito(producto: Producto) {
    if (!producto.disponible || producto.stock <= 0) return;
    const cantidadActual = items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0;
    if (cantidadActual >= producto.stock) {
      setMensaje(`No podés agregar más unidades de "${producto.nombre}" porque alcanzaste el stock disponible.`);
      return;
    }
    agregarProducto({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
    });
    setMensaje(`Agregaste "${producto.nombre}" al carrito.`);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:!bg-slate-900 dark:!text-white">
      <div className="mx-auto max-w-6xl">
        <header className="catalogo-bienvenida mb-8">
          <div className="catalogo-bienvenida-texto">
            <p className="catalogo-etiqueta">SABORES PARA DISFRUTAR</p>
            <h1 className="catalogo-bienvenida-titulo">¡Bienvenido a Food Store!</h1>
            <p className="catalogo-bienvenida-subtitulo">
              Descubrí tus comidas favoritas y hacé tu pedido de manera fácil y rápida.
            </p>
            <p className="catalogo-bienvenida-detalle">Elegí lo que más te gusta. Nosotros nos encargamos del resto.</p>
          </div>
          <Link
            to="/carrito"
            className="catalogo-acceso-carrito"
            aria-label={`Abrir carrito, ${cantidadCarrito} ${cantidadCarrito === 1 ? "producto" : "productos"}`}
          >
            🛒 Carrito: {cantidadCarrito} {cantidadCarrito === 1 ? "producto" : "productos"}
          </Link>
        </header>

        <div className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:!border-slate-700 dark:!bg-slate-800 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-slate-200">
              Buscar productos
            </span>
            <input
              type="search"
              value={busqueda}
              placeholder="Buscar por nombre..."
              onChange={(evento) => {
                setBusqueda(evento.target.value);
                setPagina(0);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 dark:!border-slate-600 dark:!bg-slate-700 dark:!text-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-slate-200">
              Categoría
            </span>
            <select
              value={categoriaId}
              onChange={(evento) => {
                setCategoriaId(evento.target.value);
                setPagina(0);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 dark:!border-slate-600 dark:!bg-slate-700 dark:!text-white"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        {mensaje && (
          <div role="status" className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:!border-emerald-800 dark:!bg-emerald-950 dark:!text-emerald-200">
            <span>{mensaje}</span>
            <button type="button" onClick={() => setMensaje("")} aria-label="Cerrar mensaje" className="font-bold">×</button>
          </div>
        )}
        {cargando && <Skeleton />}
        {error && <p role="alert" className="rounded-lg bg-red-100 p-4 text-red-700 dark:!bg-red-950 dark:!text-red-200">{error}</p>}
        {!cargando && !error && productos.length === 0 && (
          <EstadoVacio
            titulo="No encontramos productos"
            mensaje="Probá con otra búsqueda o categoría."
            onLimpiar={limpiarFiltros}
          />
        )}

        {!cargando && !error && productos.length > 0 && (
          <div className="catalogo-seccion-titulo">
            <div>
              <h2>Nuestro menú</h2>
              <p>Elegí tu favorito y agregalo al carrito.</p>
            </div>
            <span className="catalogo-contador-productos">{total} productos</span>
          </div>
        )}

        {!cargando && !error && (
          <section className="catalogo-grid" aria-label="Productos del catálogo">
            {productos.map((producto) => {
              const disponible = producto.disponible && producto.stock > 0;
              const cantidadAgregada = items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0;
              const stockAlcanzado = cantidadAgregada >= producto.stock;
              const imagen = producto.imagen_url || imagenDeProducto(producto.nombre);
              return (
                <article key={producto.id} className="catalogo-tarjeta">
                  {imagen ? (
                    <img src={imagen} alt={`Imagen de ${producto.nombre}`} loading="lazy" className="catalogo-imagen" />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-slate-100 text-slate-500 dark:!bg-slate-700 dark:!text-slate-300">Sin imagen disponible</div>
                  )}
                  <div className="catalogo-contenido">
                    <h2 className="text-xl font-semibold text-slate-900 dark:!text-white">{producto.nombre}</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:!text-slate-300">{producto.descripcion}</p>
                    <p className="mt-4 text-2xl font-bold text-emerald-700 dark:!text-emerald-400">
                      {producto.precio_base.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:!text-slate-300">Stock: {producto.stock}</p>
                    <div className="mt-3">
                      <span className={disponible
                        ? "inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:!bg-green-900/50 dark:!text-green-300"
                        : "inline-block rounded-full bg-red-100 px-3 py-1 text-sm text-red-700 dark:!bg-red-900/50 dark:!text-red-300"}>
                        {disponible ? "Disponible" : "Sin stock"}
                      </span>
                    </div>
                    <div className="mt-auto pt-5">
                      <button type="button" disabled={!disponible || stockAlcanzado} onClick={() => agregarAlCarrito(producto)} className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                        {!disponible ? "Sin stock" : stockAlcanzado ? "Stock máximo agregado" : "Agregar al carrito"}
                      </button>
                      {cantidadAgregada > 0 && <p className="mt-3 text-center text-sm text-slate-600 dark:!text-slate-300">En el carrito: {cantidadAgregada}</p>}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {!cargando && !error && total > 0 && (
          <Paginacion
            pagina={pagina}
            limite={limite}
            total={total}
            onChange={setPagina}
          />
        )}
      </div>
    </main>
  );
}
