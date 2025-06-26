# 🚗 FastCarTrade

**FastCarTrade** es una plataforma web de compraventa de vehículos entre particulares, desarrollada como Trabajo de Fin de Grado. Permite a los usuarios registrar vehículos, publicar anuncios, comunicarse por chat en tiempo real y dejar valoraciones sobre vendedores y vehículos.

---

## 🧰 Tecnologías utilizadas

- **Frontend:** [Angular](https://angular.io/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Base de datos:** [MySQL](https://www.mysql.com/) con [Sequelize](https://sequelize.org/)
- **Autenticación:** [JWT](https://jwt.io/)
- **Comunicación en tiempo real:** [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) mediante [Socket.IO](https://socket.io/)
- **Contenedores:** [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)

---

## 📁 Estructura del proyecto
/tfg
├── backend/ # API REST con Node.js + Express
├── frontend/ # Aplicación Angular + Tailwind CSS
├── docker-compose.yml # Orquestación de servicios
└── README.md


---

## 🚀 Ejecución del proyecto con Docker

### ✅ Requisitos previos

- Tener instalado [Docker](https://www.docker.com/products/docker-desktop)

### ▶️ Instrucciones

1. Clona el repositorio:

   ```bash
   git clone https://github.com/daviid-web/tfg.git
   cd tfg

2. Crea el archivo .env dentro de la carpeta backend/ (ver sección inferior).

3. Levanta los contenedores con:
docker compose up --build
Accede a la aplicación:

Frontend: http://192.168.2.3:4200


🧪 Funcionalidades principales
Registro e inicio de sesión de usuarios

Publicación y edición de anuncios

Subida de imágenes

Filtros avanzados por marca, modelo, precio, etc.

Chat en tiempo real entre compradores y vendedores

Valoraciones y comentarios en los anuncios

Backend y frontend orquestados con Docker


📦 API
El backend expone una API RESTful que permite:

Gestión de usuarios (registro, login, autenticación con JWT)

CRUD de anuncios de vehículos

Subida de imágenes

Envío y recepción de mensajes en tiempo real

Valoraciones y comentarios

👤 Autor
David Velasco Durán
📧 velascodurandavid@gmail.com
🔗 LinkedIn 
https://www.linkedin.com/in/david-velasco-duran-26746819b/