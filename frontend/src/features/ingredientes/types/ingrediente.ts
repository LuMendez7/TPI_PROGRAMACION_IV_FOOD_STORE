
export interface Ingrediente {
  id: number
  nombre: string
  descripcion: string
  precio: number
  disponible: boolean
}

export interface IngredienteInput {
  nombre: string
  descripcion: string
  precio: number
  disponible: boolean
}
