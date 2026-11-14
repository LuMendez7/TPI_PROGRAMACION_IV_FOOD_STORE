
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const error = useAuthStore((state) => state.error);
  const limpiarError = useAuthStore((state) => state.limpiarError);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      try {
        await login(value.username.trim(), value.password);
        navigate("/catalogo", { replace: true });
      } catch {
        // El error se muestra desde Zustand.
      }
    },
  });

  return (
    <section className="mx-auto mt-12 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
        Iniciar sesión
      </h1>

      <p className="mb-6 text-center text-gray-600">
        Ingresá con tu cuenta de Food Store.
      </p>

      {usuario && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-center text-green-700">
          Sesión iniciada como {usuario.full_name}
        </p>
      )}

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="username"
          validators={{
            onBlur: ({ value }) =>
              !value.trim()
                ? "El nombre de usuario es obligatorio"
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor="login-username"
                className="mb-1 block font-medium text-slate-900"
              >
                Nombre de usuario
              </label>

              <input
                id="login-username"
                type="text"
                required
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value);
                  limpiarError();
                }}
                className="w-full rounded-lg border border-gray-300 p-3 text-slate-900"
                placeholder="Ejemplo: admin"
              />

              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block font-medium text-slate-900"
              >
                Contraseña
              </label>

              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => {
                  field.handleChange(evento.target.value);
                  limpiarError();
                }}
                className="w-full rounded-lg border border-gray-300 p-3 text-slate-900"
                placeholder="Ingresá tu contraseña"
              />
            </div>
          )}
        </form.Field>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="mt-6 border-t pt-5 text-center">
        <p className="text-sm text-gray-600">
          ¿Todavía no tenés una cuenta?
        </p>

        <Link
          to="/registro"
          className="mt-2 inline-block font-semibold text-blue-600 hover:underline"
        >
          Crear cuenta
        </Link>
      </div>
    </section>
  );
}
