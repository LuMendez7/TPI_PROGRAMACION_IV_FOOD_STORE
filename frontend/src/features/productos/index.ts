
export { default as ProductosPage } from "./pages/ProductosPage";

export {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./services/productoService";

export {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  productsQueryKey,
} from "./hooks/useProducts";

export type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
} from "./types/producto";
