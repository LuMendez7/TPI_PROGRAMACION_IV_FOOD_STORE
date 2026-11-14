
import { useForm } from "@tanstack/react-form";

import type {
  Categoria,
  CategoriaInput,
} from "../types/categoria";

interface Props {
  categoria: Categoria | null;
  onGuardar: (datos: CategoriaInput) => Promise<void>;
  onCerrar: () => void;
  guardando: boolean;
}

export default function CategoriaModal({
  categoria,
  onGuardar,
  onCerrar,
  guardando,
}: Props) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },

    onSubmit: async ({ value }) => {
      await onGuardar(value);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:!text-white">
        <h2 className="mb-5 text-xl font-bold text-slate-800 dark:!text-white">
          {categoria ? "Editar categoría" : "Nueva categoría"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? "El nombre debe tener al menos 2 caracteres"
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="categoria-nombre"
                  className="mb-1 block font-medium text-slate-700 dark:!text-slate-100"
                >
                  Nombre
                </label>

                <input
                  id="categoria-nombre"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  onBlur={field.handleBlur}
                />

                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label
                  htmlFor="categoria-descripcion"
                  className="mb-1 block font-medium"
                >
                  Descripción
                </label>

                <textarea
                  id="categoria-descripcion"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                  rows={3}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="rounded-lg bg-gray-200 px-4 py-2 text-slate-800 transition-colors hover:bg-gray-300 disabled:opacity-50 dark:!bg-slate-600 dark:!text-white dark:hover:!bg-slate-500"
            >
              Cancelar
            </button>

            <form.Subscribe
              selector={(state) => [state.canSubmit]}
            >
              {([canSubmit]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || guardando}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}
