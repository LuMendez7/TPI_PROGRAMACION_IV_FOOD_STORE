
export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "foodstore-theme";

export function getStoredTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem(
      THEME_STORAGE_KEY
    );

    if (
      storedTheme === "light" ||
      storedTheme === "dark"
    ) {
      return storedTheme;
    }
  } catch {
    // Si localStorage no está disponible,
    // se utiliza el tema claro.
  }

  return "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark"
  );

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // La aplicación puede funcionar aunque
    // el navegador no permita guardar el tema.
  }
}

export function initializeTheme(): Theme {
  const theme = getStoredTheme();

  applyTheme(theme);

  return theme;
}
