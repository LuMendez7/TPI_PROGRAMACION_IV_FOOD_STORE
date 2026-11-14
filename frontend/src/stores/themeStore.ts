import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeState = {
  darkMode: boolean;
  toggleTheme: () => void;
};

function updateDocumentTheme(darkMode: boolean) {
  document.documentElement.classList.toggle("dark", darkMode);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleTheme: () => set((state) => {
        const darkMode = !state.darkMode;
        updateDocumentTheme(darkMode);
        return { darkMode };
      }),
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) updateDocumentTheme(state.darkMode);
      },
    }
  )
);

// Aplicar el tema guardado antes de mostrar la interfaz.
updateDocumentTheme(useThemeStore.getState().darkMode);
