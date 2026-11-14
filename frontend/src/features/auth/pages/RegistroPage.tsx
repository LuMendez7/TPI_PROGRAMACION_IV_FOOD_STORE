
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../../../api/axios";

export default function RegistroPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      confirmarPassword: "",
    },

    onSubmit: async ({ value }) => {
      setError("");

      const username = value.username.trim();
      const full_name = value.full_name.trim();
      const email = value.email.trim();

      if (username.length < 3) {
        setError(
          "El nombre de usuario debe tener al menos 3 caracteres."
        );
        return;
      }

      if (!full_name) {
        setError("Ingresá tu nombre completo.");
        return;
      }

      if (value.password !== value.confirmarPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      if (value.password.length < 8) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );
        return;
      }

      try {
        setCargando(true);

        await api.post("/auth/register", {
          username,
          full_name,
          email,
          password: value.password,
        });

        navigate("/login", { replace: true });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detalle: unknown =
            err.response?.data?.detail;

          if (typeof detalle === "string") {
            setError(detalle);
          } else if (err.response?.status === 422) {
            setError("Revisá los datos ingresados.");
          } else {
            setError("No se pudo completar el registro.");
          }
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setCargando(false);
      }
    },
  });

  const estiloCampo =
    "w-full rounded-lg border border-gray-300 px-3 py-2";

  return (
    <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="mb-2 text-2xl font-bold">
        Crear cuenta
      </h1>

      <p className="mb-6 text-gray-600">
        Registrate para utilizar el sistema.
      </p>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="username">
          {(field) => (
            <label className="block">
              Nombre de usuario

              <input
                className={estiloCampo}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) =>
                  field.handleChange(evento.target.value)
                }
                required
                minLength={3}
                maxLength={100}
                autoComplete="username"
              />
            </label>
          )}
        </form.Field>

        <form.Field name="full_name">
          {(field) => (
            <label className="block">
              Nombre completo

              <input
                className={estiloCampo}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) =>
                  field.handleChange(evento.target.value)
                }
                required
                maxLength={100}
                autoComplete="name"
              />
            </label>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <label className="block">
              Correo electrónico

              <input
                className={estiloCampo}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) =>
                  field.handleChange(evento.target.value)
                }
                required
                autoComplete="email"
              />
            </label>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <label className="block">
              Contraseña

              <input
                className={estiloCampo}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) =>
                  field.handleChange(evento.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
          )}
        </form.Field>

        <form.Field name="confirmarPassword">
          {(field) => (
            <label className="block">
              Confirmar contraseña

              <input
                className={estiloCampo}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) =>
                  field.handleChange(evento.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
          )}
        </form.Field>

        {error && (
          <p
            role="alert"
            className="rounded bg-red-100 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </section>
  );
}
