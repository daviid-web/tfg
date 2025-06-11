const express = require("express");
const multer = require("multer");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "unaClaveSuperSecreta123";


// =====================================
// CONTROLADORES
// =====================================
const sesionController = require("../controllers/sesionController");
const favoritosController = require("../controllers/favoritosController.js");
const anunciosController = require("../controllers/anunciosController");
const vehiculoController = require("../controllers/vehiculoController");
const adminController = require("../controllers/adminController"); 
const reportesController = require("../controllers/reportesController"); 
// const comentariosController = require("../controllers/comentariosController"); 
const mensajesController = require("../controllers/mensajesController");
const usuarioController = require("../controllers/usuarioController");

// =====================================
// MIDDLEWARES
// =====================================
const validarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) return res.status(401).json({ error: "Token no proporcionado" });
  
    const token = authHeader.split(" ")[1];
  
    try {
      const datos = jwt.verify(token, JWT_SECRET);
      req.usuario = datos;
      next();
    } catch (err) {
      res.status(401).json({ error: "Token inválido" });
    }
};

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
  }
});

const upload = multer({ storage });

// =====================================
// RUTAS DE SESIÓN
// =====================================
router.get("/", sesionController.inicio);
router.post("/api/sesion/registro", sesionController.registro); 
router.post("/api/sesion/login", sesionController.login); 
router.post("/api/sesion/logout", validarToken, sesionController.logout); 

// =====================================
// RUTAS DE ANUNCIOS
// =====================================
router.get("/api/anuncios", anunciosController.verAnuncios); 
router.get("/api/mis-anuncios", validarToken, anunciosController.verMisAnuncios);
router.get("/api/anuncios/:id", anunciosController.detalleAnuncio);
router.post("/api/anuncios",validarToken, upload.fields([
  { name: "imagen_principal", maxCount: 1 },
  { name: "imagenes_adicionales", maxCount: 3 }
  ]),
  anunciosController.crearAnuncio
);
router.delete("/api/anuncios/:id", validarToken, anunciosController.borraAnuncio); 
router.post("/api/anuncios/:id/vender", validarToken, anunciosController.setAnuncioVendido); 
router.get("/api/filtros", anunciosController.verAnunciosFiltrados);


// =====================================
// RUTAS DE VEHICULOS
// =====================================
router.get("/api/marcas", vehiculoController.listarMarcas); 
router.get("/api/modelos", vehiculoController.listarModelos); 
router.get("/api/combustibles", vehiculoController.listarCombustibles); 

// =====================================
// RUTAS DE USUARIOS
// =====================================
router.get("/api/usuarios/:id", validarToken, usuarioController.obtenerPerfil); 
router.put("/api/usuarios/:id", validarToken, usuarioController.actualizarPerfil);
router.put("/api/usuarios/:id/rol", validarToken, usuarioController.cambiarRol); 
router.post("/api/usuarios/:id/foto", validarToken, upload.single("imagen"), usuarioController.subirFotoPerfil); 
router.put("/api/usuarios/:id/password", validarToken, usuarioController.cambiarPassword); 


// =====================================
// RUTAS DE FAVORITOS
// =====================================
router.get("/api/usuarios/:id/favoritos", validarToken, favoritosController.listarFavoritos); 
router.post("/api/favoritos/:anuncioId", validarToken, favoritosController.agregarFavorito);
router.delete("/api/favoritos/anuncio/:anuncioId", validarToken, favoritosController.eliminarFavoritoPorAnuncio);
router.delete("/api/favoritos/:id", validarToken, favoritosController.eliminarFavorito);

// =====================================
// RUTAS DE MENSAJES
// =====================================
router.post("/api/mensajes", validarToken, mensajesController.enviarMensaje);
router.get("/api/usuarios/:id/conversaciones", validarToken, mensajesController.getConversaciones);
router.get("/api/mensajes/conversacion", validarToken, mensajesController.getMensajesDeConversacion);
router.delete("/api/mensajes/:id", validarToken, mensajesController.eliminarMensaje);
router.post('/api/mensajes/iniciar-o-seleccionar', validarToken, mensajesController.iniciarOSeleccionarConversacion);

// =====================================
// RUTAS DE REPORTES
// =====================================
router.post("/api/anuncios/:id/reportar", validarToken, reportesController.reportar);

// =====================================
// RUTAS DE ADMINISTRADORES
// =====================================
router.get('/api/usuarios', validarToken, adminController.listarUsuarios);
router.put('/api/usuarios/:id/estado', validarToken, adminController.actualizarEstadoUsuario);
router.put('/api/anuncios/:id/estado', validarToken, adminController.actualizarEstadoAnuncio);  
router.get('/api/reportes', validarToken, adminController.listarReportes);
router.delete('/api/reportes/:id', validarToken, adminController.eliminarReporte);
router.delete('/api/usuarios/:id', validarToken, adminController.eliminarUsuario);

// =====================================
// EXPORTAR RUTAS
// =====================================
module.exports = router;


