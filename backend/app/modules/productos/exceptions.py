
class ProductoNoEncontradoError(Exception):
    """Se produce cuando un producto no existe."""

    pass


class CategoriaProductoNoValidaError(Exception):
    """Se produce cuando la categoría no existe o está inactiva."""

    pass


class ProductoDatoInvalidoError(Exception):
    """Se produce cuando un dato obligatorio del producto es inválido."""

    pass
