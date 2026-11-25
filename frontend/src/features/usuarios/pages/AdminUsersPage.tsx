
import { useState } from "react";
import axios from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axios";

interface UsuarioAdmin {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  disabled: boolean;
}

const usuariosQueryKey = ["admin", "usuarios"] as const;

async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const respuesta = await api.get<UsuarioAdmin[]>("/admin/usuarios");
  return respuesta.data;
}

async function modificarEstado(usuario: UsuarioAdmin): Promise<void> {
  const accion = usuario.disabled ? "activar" : "desactivar";
  await api.post(`/admin/usuarios/${usuario.id}/${accion}`);
}

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) {
      return "No tenés permisos para administrar usuarios.";
    }

    const detalle: unknown = error.response?.data?.detail;

    if (typeof detalle === "string") {
      return detalle;
    }
  }

  return "No se pudo completar la operación.";
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const [errorAccion, setErrorAccion] = useState("");
  const [mensaje, setMensaje] = useState("");

  const {
    data: usuarios = [],
    isLoading: cargando,
    isFetching,
    isError,
    error: errorConsulta,
    refetch,
  } = useQuery<UsuarioAdmin[], Error>({
    queryKey: usuariosQueryKey,
    queryFn: listarUsuarios,
  });

  const estadoMutation = useMutation({
    mutationFn: modificarEstado,

    onSuccess: async (_, usuario) => {
      const accion = usuario.disabled ? "activó" : "desactivó";

      setMensaje(
        `La cuenta de ${usuario.full_name} se ${accion} correctamente.`
      );

      await queryClient.invalidateQueries({
        queryKey: usuariosQueryKey,
      });
    },

    onError: (error) => {
      setErrorAccion(obtenerMensajeError(error));
    },
  });

  const procesandoId = estadoMutation.isPending
    ? estadoMutation.variables?.id ?? null
    : null;

  const error = errorAccion ||
    (isError
      ? obtenerMensajeError(errorConsulta)
      : "");

  function cambiarEstado(usuario: UsuarioAdmin) {
    const accion = usuario.disabled ? "activar" : "desactivar";

    if (
      !window.confirm(
        `¿Querés ${accion} la cuenta de ${usuario.full_name}?`
      )
    ) {
      return;
    }

    setErrorAccion("");
    setMensaje("");
    estadoMutation.mutate(usuario);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Administración de usuarios
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-300">
            Gestioná las cuentas registradas en Food Store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorAccion("");
            void refetch();
          }}
          disabled={isFetching || estadoMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isFetching ? "Actualizando..." : "Actualizar lista"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status" className="rounded-lg bg-green-100 p-3 text-green-700">
          {mensaje}
        </p>
      )}

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:!border-slate-600 dark:!bg-slate-800 dark:!text-white">
          <table className="w-full text-left">
            <thead className="bg-slate-700 text-white dark:!bg-slate-700">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white text-slate-900 dark:!bg-slate-800 dark:!text-white">
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-slate-300 dark:!border-slate-600"
                >
                  <td className="p-3">{usuario.id}</td>
                  <td className="p-3">{usuario.username}</td>
                  <td className="p-3">{usuario.full_name}</td>
                  <td className="p-3">{usuario.email}</td>
                  <td className="p-3">{usuario.role}</td>
                  <td className="p-3">
                    {usuario.disabled ? "Inactivo" : "Activo"}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={estadoMutation.isPending}
                      onClick={() => cambiarEstado(usuario)}
                      className={`rounded-lg px-3 py-2 text-white disabled:opacity-50 ${
                        usuario.disabled
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {procesandoId === usuario.id
                        ? "Procesando..."
                        : usuario.disabled
                          ? "Activar"
                          : "Desactivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuarios.length === 0 && !isError && (
            <p className="p-5">No hay usuarios registrados.</p>
          )}
        </div>
      )}
    </section>
  );
}
