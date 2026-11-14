# FOOD STORE
## Trabajo Práctico Integrador - Programación IV

### Descripción

Food Store es una aplicación web desarrollada como Trabajo Práctico Integrador de Programación IV.

Permite gestionar productos alimenticios, categorías, usuarios y pedidos mediante una interfaz web conectada con una API REST.

### Tecnologías utilizadas

Backend:
- Python
- FastAPI
- SQLModel
- PostgreSQL
- Autenticación JWT

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router

### Funcionalidades

- Inicio de sesión y registro de usuarios.
- Autenticación y autorización mediante roles.
- Administración de usuarios.
- Gestión de categorías.
- Gestión de productos.
- Catálogo de alimentos con imágenes.
- Carrito de compras.
- Consulta y administración de pedidos.
- Gestión de estados de pedidos.
- Interfaz adaptable a diferentes pantallas.
- Modo claro y oscuro.

### Roles

Administrador:
- Administra usuarios.
- Gestiona categorías y productos.
- Consulta y administra pedidos.

Cliente:
- Consulta el catálogo.
- Agrega productos al carrito.
- Consulta sus pedidos.

### Estructura del proyecto

backend/
  API REST, modelos, servicios y acceso a datos.

frontend/
  Aplicación React, componentes, páginas y servicios.

README.md
  Documentación general del proyecto.

## Repositorio de GitHub

Enlace público:
https://github.com/LuMendez7/TPI_PROGRAMACION_IV_FOOD_STORE

## Video de demostración

Duración requerida: 10 a 15 minutos.

Enlace público:
https://drive.google.com/file/d/1lhaLHhmXcC711ImqDjJkjr8hfzHwqS2p/view?usp=sharing

## Requisitos previos

Para ejecutar Food Store se necesita:

- Python 3.12.
- PostgreSQL instalado y en funcionamiento.
- Node.js y pnpm.
- Una base de datos PostgreSQL creada para el proyecto.

## Instalación y ejecución del backend

1. Ingresar a la carpeta del backend:

    cd backend

2. Crear un entorno virtual:

    python -m venv .venv

3. Activar el entorno virtual en Windows PowerShell:

    .\.venv\Scripts\Activate.ps1

4. Instalar las dependencias:

    pip install -r requirements.txt

5. Crear el archivo .env a partir de .env.example y configurar las variables correspondientes.

6. Ejecutar el seed inicial:

    python -m app.db.seed

7. Iniciar la API:

    uvicorn app.main:app

La documentación interactiva estará disponible en:

http://127.0.0.1:8000/docs

## Configuración de PostgreSQL y variables de entorno

El backend utiliza PostgreSQL como sistema de gestión de base de datos.

Antes de ejecutar la aplicación, se debe crear la base de datos y configurar el archivo backend/.env utilizando backend/.env.example como referencia.

Variables principales:

- DATABASE_URL: cadena de conexión a PostgreSQL.
- SECRET_KEY: clave secreta utilizada para la autenticación.
- ALGORITHM: algoritmo de firma de los tokens JWT.
- ACCESS_TOKEN_EXPIRE_MINUTES: duración de los tokens.
- FRONTEND_ORIGIN: dirección del frontend autorizada mediante CORS.

El archivo .env contiene información privada y no debe publicarse.

## Datos iniciales y administrador

El proyecto incluye un script de inicialización:

    python -m app.db.seed

Este procedimiento permite preparar los datos iniciales de la aplicación, incluyendo el administrador, las categorías y los productos.

El nombre de usuario predeterminado del administrador es:

    admin

El correo predeterminado es:

    admin@foodstore.local

La contraseña del administrador se configura mediante la variable de entorno SEED_ADMIN_PASSWORD o se solicita durante la ejecución del seed cuando corresponde crear el usuario.

La contraseña debe tener al menos 12 caracteres.

Por seguridad, no se publica ninguna contraseña real en el repositorio.

## Configuración del frontend

Ingresar a la carpeta frontend desde la raíz del proyecto.

Crear el archivo .env.local tomando como referencia frontend/.env.example.

La variable VITE_API_URL debe apuntar a la API:

    VITE_API_URL=http://127.0.0.1:8000/api/v1

Instalar las dependencias:

    pnpm install

Verificar la compilación:

    pnpm build

Iniciar el frontend:

    pnpm dev

La aplicación estará disponible normalmente en:

http://localhost:5173

## Prueba de funcionamiento

Una vez iniciados el backend y el frontend:

1. Registrar un usuario cliente.
2. Iniciar sesión.
3. Consultar el catálogo.
4. Agregar productos al carrito.
5. Confirmar una compra.
6. Consultar el pedido generado.
7. Ingresar con el administrador.
8. Gestionar usuarios, categorías y productos.
9. Consultar y administrar pedidos.
10. Cancelar un pedido y comprobar la restitución del stock.

## Archivos excluidos de la entrega

No deben incluirse archivos con credenciales ni dependencias instaladas localmente.

Se excluyen, entre otros:

- .env y .env.local
- .venv y venv
- node_modules
- __pycache__ y archivos .pyc
- dist
- Archivos temporales y respaldos innecesarios

Los archivos .env.example deben conservarse.


