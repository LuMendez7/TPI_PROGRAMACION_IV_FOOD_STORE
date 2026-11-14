
import { useEffect } from "react";

import AppRouter from "@/routes/AppRouter";
import Toast from "@/shared/components/Toast";
import { useAuthStore } from "@/stores/authStore";


export default function App() {
  const cargarUsuario = useAuthStore(
    (state) => state.cargarUsuario
  );

  useEffect(() => {
    void cargarUsuario();
  }, [cargarUsuario]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}
