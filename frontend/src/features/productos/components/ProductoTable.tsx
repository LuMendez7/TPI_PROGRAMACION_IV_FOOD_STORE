import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type { Producto } from "../types/producto";

interface Props {
  productos: Producto[];
  esAdmin: boolean;
  eliminando: boolean;
  actualizandoStock: boolean;
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
  onActualizarStock: (producto: Producto) => void;
}

export default function ProductoTable({
  productos,
  esAdmin,
  eliminando,
  actualizandoStock,
  onEditar,
  onEliminar,
  onActualizarStock,
}: Props) {
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "precio_base",
      header: "Precio",
      cell: ({ row }) =>
        row.original.precio_base.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    { accessorKey: "categoria_id", header: "Categoría" },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "disponible",
      header: "Disponible",
      cell: ({ row }) => (row.original.disponible ? "Sí" : "No"),
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
            className="rounded bg-yellow-500 px-3 py-1 text-white"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onActualizarStock(row.original)}
            disabled={actualizandoStock}
            className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
          >
            {actualizandoStock ? "Actualizando..." : "Actualizar stock"}
          </button>
          <button
            type="button"
            onClick={() => onEliminar(row.original)}
            disabled={eliminando}
            className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      ),
    });
  }

  const table = useReactTable({
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });

  const paginaActual = table.getState().pagination.pageIndex + 1;
  const totalPaginas = table.getPageCount();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:!border-slate-600 dark:!bg-slate-800 dark:!text-white">
        <table className="foodstore-productos-tabla w-full border-collapse text-left">
          <thead className="bg-slate-800 text-white dark:!bg-slate-700">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="p-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white text-slate-900 dark:!bg-slate-800 dark:!text-white">
            {table.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-slate-200 dark:!border-slate-600">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="p-3">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          Página {paginaActual} de {totalPaginas} — {productos.length} productos
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded bg-slate-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded bg-slate-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
