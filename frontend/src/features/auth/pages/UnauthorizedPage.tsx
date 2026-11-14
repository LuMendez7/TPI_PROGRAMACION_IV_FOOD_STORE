
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto mt-12 max-w-lg rounded-xl bg-white p-8 text-center shadow">
      <div className="mb-4 text-5xl font-bold text-red-600">
        403
      </div>

      <h1 className="mb-3 text-2xl font-bold">
        Acceso denegado
      </h1>

      <p className="mb-6 text-gray-600">
        No tenés permisos suficientes para acceder
        a esta sección del sistema.
      </p>

      <Link
        to="/categorias"
        className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Volver a categorías
      </Link>
    </section>
  );
}
