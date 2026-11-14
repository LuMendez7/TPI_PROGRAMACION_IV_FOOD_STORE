
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { api } from "../../../api/axios";

interface UsuarioAdmin {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  disabled: boolean;
}

export default function AdminUsersPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get<UsuarioAdmin[]>("/usuarios/");
      setUsuarios(respuesta.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("No tenés permisos para administrar usuarios.");
      } else {
        setError("No se pudo cargar la lista de usuarios.");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  async function cambiarEstado(usuario: UsuarioAdmin) {
    const activar = usuario.disabled;
    const accion = activar ? "activar" : "desactivar";

    if (
      !window.confirm(
        `¿Querés ${accion} la cuenta de ${usuario.full_name}?`
      )
    ) {
      return;
    }

    setProcesandoId(usuario.id);
    setError("");
    setMensaje("");

    try {
      await api.patch(`/usuarios/${usuario.id}/estado`, {
        disabled: !activar,
      });

      setMensaje(
        `La cuenta de ${usuario.full_name} se ${
          activar ? "activó" : "desactivó"
        } correctamente.`
      );

      await cargarUsuarios();
    } catch (err) {
      const detalle = axios.isAxiosError(err)
        ? err.response?.data?.detail
        : null;

      setError(
        typeof detalle === "string"
          ? detalle
          : "No se pudo modificar el estado del usuario."
      );
    } finally {
      setProcesandoId(null);
    }
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
          onClick={() => void cargarUsuarios()}
          disabled={cargando || procesandoId !== null}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Actualizar lista
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
                <tr key={usuario.id} className="border-t border-slate-300 dark:!border-slate-600">
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
                      disabled={procesandoId !== null}
                      onClick={() => void cambiarEstado(usuario)}
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

          {usuarios.length === 0 && (
            <p className="p-5">No hay usuarios registrados.</p>
          )}
        </div>
      )}
    </section>
  );
}
