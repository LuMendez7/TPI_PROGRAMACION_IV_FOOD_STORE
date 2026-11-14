
export { default as CategoriasPage } from "./pages/CategoriasPage";
export { default as CategoriaModal } from "./components/CategoriaModal";
export { default as CategoriaTable } from "./components/CategoriaTable";

export {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "./services/categoriaService";

export {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoriesQueryKey,
} from "./hooks/useCategories";

export type {
  Categoria,
  CategoriaInput,
} from "./types/categoria";
