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
- Autenticación JWT mediante cookie HttpOnly

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router
- TanStack Query
- TanStack Form
- TanStack Table

### Funcionalidades

- Inicio de sesión y registro de usuarios.
- Autenticación y autorización mediante roles.
- Administración de usuarios.
- Gestión de categorías.
- Gestión de productos.
- Catálogo de alimentos con imágenes, búsqueda, filtro por categoría y paginación.
- Carrito de compras.
- Checkout independiente con formulario TanStack Form.
- Consulta y administración de pedidos.
- Gestión de estados de pedidos.
- Validación de transiciones entre estados.
- Cancelación de pedidos pendientes por el cliente.
- Restitución automática del stock al cancelar.
- Validación de disponibilidad, stock y productos duplicados.
- Paginación de pedidos para clientes y administradores.
- Panel administrativo con resumen de pedidos y ventas.
- Pruebas automatizadas del backend.
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

6. Crear las tablas de PostgreSQL en una base de datos nueva:

    python create_tables.py

   Este comando debe ejecutarse solamente durante la instalación inicial, antes de que existan las tablas del TPI.

7. Ejecutar el seed inicial:

    python -m app.db.seed

8. Iniciar la API:

    uvicorn app.main:app --reload

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

Para una instalación nueva de demostración, ejecutar
desde la carpeta backend en PowerShell:

    python -m app.db.seed

Credenciales de demostración solicitadas en la consigna:

- Usuario: admin
- Contraseña: Admin1234!
- Rol: admin

Estas credenciales son exclusivamente para evaluación local.
No deben utilizarse en producción.

Para otras instalaciones, configurar una contraseña privada
de al menos 12 caracteres mediante la variable SEED_ADMIN_PASSWORD.

El seed es idempotente y no modifica la contraseña
de un administrador existente.

## Configuración del frontend

Ingresar a la carpeta frontend desde la raíz del proyecto.

Crear el archivo .env.local tomando como referencia frontend/.env.example.

La variable VITE_API_URL debe apuntar a la API:

    VITE_API_URL=http://localhost:8000/api/v1

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


## Pruebas automatizadas

El backend incluye pruebas automatizadas desarrolladas con pytest.

Para ejecutarlas, ingresar a la carpeta backend, activar el entorno virtual e iniciar:

    python -m pytest -v

Resultado de la verificación final:

- 17 pruebas aprobadas.
- 0 pruebas fallidas.

El frontend se verificó mediante:

    pnpm build

La compilación finalizó correctamente.
