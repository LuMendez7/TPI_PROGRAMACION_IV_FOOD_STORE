
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type { Categoria } from "../types/categoria";

interface Props {
  categorias: Categoria[];
  esAdmin: boolean;
  onEditar: (categoria: Categoria) => void;
  onEliminar: (categoria: Categoria) => void;
}

export default function CategoriaTable({
  categorias,
  esAdmin,
  onEditar,
  onEliminar,
}: Props) {
  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
    },
  ];

  if (esAdmin) {
    columns.push({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEditar(row.original)}
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => onEliminar(row.original)}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      ),
    });
  }

  const table = useReactTable({
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:!border-slate-600 dark:!bg-slate-800 dark:!text-white">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-800 text-white dark:!bg-slate-700">
          {table.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((header) => (
                <th key={header.id} className="p-4">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white text-slate-900 dark:!bg-slate-800 dark:!text-white">
          {table.getRowModel().rows.map((fila) => (
            <tr
              key={fila.id}
              className="border-t border-slate-200 dark:!border-slate-600"
            >
              {fila.getVisibleCells().map((celda) => (
                <td key={celda.id} className="p-4">
                  {flexRender(
                    celda.column.columnDef.cell,
                    celda.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 dark:!border-slate-600">
        <span className="text-sm">
          P&aacute;gina {table.getState().pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}
        </span>

        <div className="flex items-center gap-2">
          <select
            aria-label="Categorias por pagina"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-lg border border-slate-300 p-2 dark:!bg-slate-700"
          >
            {[5, 10, 20].map((cantidad) => (
              <option key={cantidad} value={cantidad}>
                {cantidad} por pagina
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg bg-slate-700 px-3 py-2 text-white disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
