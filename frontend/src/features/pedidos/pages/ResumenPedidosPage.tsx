import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api/axios";

interface ResumenPedidos {
  total_pedidos: number;
  total_vendido: number;
  por_estado: Record<string, number>;
}

const dinero = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

async function obtenerResumen(): Promise<ResumenPedidos> {
  const respuesta = await api.get<ResumenPedidos>("/pedidos/resumen");
  return respuesta.data;
}

export default function ResumenPedidosPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidos", "resumen"],
    queryFn: obtenerResumen,
  });

  if (isLoading) {
    return <p>Cargando resumen administrativo...</p>;
  }

  if (isError || !data) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Resumen administrativo</h1>
        <p role="alert">No se pudo cargar el resumen.</p>
        <button
          onClick={() => void refetch()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </section>
    );
  }

  const estados = [
    ["PENDIENTE", "Pendientes"],
    ["EN_PREPARACION", "En preparación"],
    ["ENTREGADO", "Entregados"],
    ["CANCELADO", "Cancelados"],
  ];

  return (
    <section className="space-y-6 text-slate-900 dark:text-white">
      <div>
        <h1 className="text-3xl font-bold">Resumen administrativo</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Estadísticas generales de los pedidos de Food Store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <h2 className="text-sm font-medium">Total de pedidos</h2>
          <p className="mt-2 text-3xl font-bold">
            {data.total_pedidos}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <h2 className="text-sm font-medium">Total vendido</h2>
          <p className="mt-2 text-3xl font-bold">
            {dinero(data.total_vendido)}
          </p>
        </article>
      </div>

      <h2 className="text-xl font-semibold">Pedidos por estado</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {estados.map(([clave, etiqueta]) => (
          <article
            key={clave}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <p className="text-sm">{etiqueta}</p>
            <p className="mt-2 text-2xl font-bold">
              {data.por_estado[clave] ?? 0}
            </p>
          </article>
        ))}
      </div>

      <Link
        to="/admin/pedidos"
        className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Ver pedidos
      </Link>
    </section>
  );
}
