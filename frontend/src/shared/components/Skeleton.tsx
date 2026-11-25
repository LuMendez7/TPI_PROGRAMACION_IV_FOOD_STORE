
export default function Skeleton() {
  return (
    <section
      className="catalogo-grid"
      aria-label="Cargando productos"
      aria-busy="true"
    >
      {Array.from({ length: 8 }, (_, indice) => (
        <article
          key={indice}
          className="catalogo-tarjeta animate-pulse"
        >
          <div className="h-44 bg-slate-200 dark:!bg-slate-700" />
          <div className="space-y-4 p-5">
            <div className="h-6 w-3/4 rounded bg-slate-200 dark:!bg-slate-700" />
            <div className="h-4 w-full rounded bg-slate-200 dark:!bg-slate-700" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:!bg-slate-700" />
            <div className="h-8 w-1/2 rounded bg-slate-200 dark:!bg-slate-700" />
            <div className="h-11 rounded-lg bg-slate-200 dark:!bg-slate-700" />
          </div>
        </article>
      ))}
    </section>
  );
}
