const express = require('express');
const app = express();
const http = require('http'); 
const socketIo = require('socket.io');
require('dotenv').config();
const routes = require('./routes/routes');
const sequelize = require('./config/database');
const cors = require('cors');
const path = require('path');

const mensajeController = require('./controllers/mensajesController'); 

app.use(cors({
  origin: process.env.CLIENT_URL, 
  methods: ["GET", "POST", "PUT", "DELETE"] 
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL, 
    methods: ["GET", "POST"]
  }
});

mensajeController.setSocketIO(io);

app.use(routes);

io.on('connection', (socket) => {
  console.log('Nuevo cliente WebSocket conectado:', socket.id);

  // ¡ESTA ES LA CORRECCIÓN! Cambiado de 'joinRoom' a 'unirseSala'
  socket.on('unirseSala', (data) => { 
    // Los datos 'userId1', 'userId2', 'anuncioId' no son necesarios aquí
    // ya que el frontend envía directamente el 'roomName' como 'sala'
    // Puedes simplificarlo para que 'data' sea directamente 'roomName'
    const roomName = data; // Si el frontend envía 'sala' directamente
    
    // Si tu frontend envía un objeto { userId1, userId2, anuncioId } entonces haz esto:
    // const { userId1, userId2, anuncioId } = data;
    // const roomName = `${Math.min(userId1, userId2)}-${Math.max(userId1, userId2)}-${anuncioId}`;
    
    socket.join(roomName);
    console.log(`Cliente ${socket.id} se unió a la sala: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente WebSocket desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { 
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

sequelize.sync({ force: false }) 
  .then(() => console.log("Modelos sincronizados"))
  .catch((err) => console.error("Error al sincronizar modelos", err));

sequelize.authenticate()
  .then(() => console.log('Conexión con la base de datos establecida correctamente.'))
  .catch(err => console.error('Error al conectar con la base de datos:', err));

require('./model/Relaciones');