
interface Props {
  titulo?: string;
  mensaje?: string;
  onLimpiar?: () => void;
}

export default function EstadoVacio({
  titulo = "No hay resultados",
  mensaje = "No encontramos elementos para mostrar.",
  onLimpiar,
}: Props) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:!border-slate-600">
      <div className="mb-3 text-4xl" aria-hidden="true">
        &#128269;
      </div>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="mt-2 text-slate-500 dark:!text-slate-300">
        {mensaje}
      </p>
      {onLimpiar && (
        <button
          type="button"
          onClick={onLimpiar}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
