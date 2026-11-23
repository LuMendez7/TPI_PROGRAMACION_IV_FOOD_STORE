class CategoriaError(Exception):
    """Excepción base del módulo de categorías."""


class CategoriaNoEncontradaError(CategoriaError):
    """La categoría solicitada no existe."""


class CategoriaDuplicadaError(CategoriaError):
    """Ya existe una categoría con ese nombre."""


class CategoriaNombreInvalidoError(CategoriaError):
    """El nombre de la categoría no es válido."""