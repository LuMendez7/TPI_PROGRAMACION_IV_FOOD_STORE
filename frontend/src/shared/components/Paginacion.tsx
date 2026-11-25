
interface Props {
  pagina: number;
  limite: number;
  total: number;
  onChange: (pagina: number) => void;
}

export default function Paginacion({
  pagina,
  limite,
  total,
  onChange,
}: Props) {
  const paginas = Math.max(1, Math.ceil(total / limite));

  return (
    <nav
      aria-label="Paginacion"
      className="mt-8 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-sm">
        P&aacute;gina {pagina + 1} de {paginas} - {total} resultados
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagina === 0}
          onClick={() => onChange(pagina - 1)}
          className="rounded-lg bg-slate-700 px-4 py-2 text-white disabled:opacity-40"
        >
          Anterior
        </button>

        <button
          type="button"
          disabled={pagina + 1 >= paginas}
          onClick={() => onChange(pagina + 1)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
