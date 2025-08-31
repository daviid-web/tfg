🚗 FastCarTrade - Guía de Inicio Rápido

Este repositorio contiene el código de FastCarTrade, una aplicación web para compraventa de vehículos.
El proyecto está compuesto por tres servicios principales:

🗄️ Base de datos

⚙️ Servidor (backend)

💻 Cliente (frontend)

Sigue esta guía para desplegarlo en tu máquina local usando Docker.

📋 Requisitos

Antes de empezar, asegúrate de tener instalados:

Docker

Linux: Docker Engine

Windows: Docker Desktop

Git

⚡ Instalación y Despliegue

Clonar el repositorio

git clone https://github.com/daviid-web/tfg


Acceder al directorio del proyecto

cd TFG


Levantar los contenedores con Docker Compose

docker-compose up


(la primera vez puede tardar unos minutos mientras se descargan las imágenes)

🌍 Acceder a la Aplicación

Windows
Abre tu navegador y visita:
http://localhost:4200

Linux
Dependiendo de tu configuración de red en Docker, puede que necesites usar la IP del contenedor.
En este caso, la aplicación está disponible en:
http://192.168.2.3:4200

✅ Verificación

Si ves la página de FastCarTrade cargada en tu navegador, ¡el despliegue fue exitoso! 🚀
