
export { default as IngredientesPage } from "./pages/IngredientesPage";

export {
  listarIngredientes,
  crearIngrediente,
  actualizarIngrediente,
  eliminarIngrediente,
} from "./services/ingredienteService";

export {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
  ingredientsQueryKey,
} from "./hooks/useIngredients";

export type {
  Ingrediente,
  IngredienteInput,
} from "./types/ingrediente";
