const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Usuario = require("../model/Usuario");
const JWT_SECRET = process.env.JWT_SECRET || "unaClaveSuperSecreta123";

const sesionController = {
  // GET /
  inicio: (req, res) => {
    res.redirect("http://192.168.2.3:4200/");
  },

  // POST /api/sesion/registro
  registro: async (req, res) => {
    console.log("---- REGISTRO ----");
    console.log("Body recibido:", req.body);

    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
      console.warn("Faltan datos en el registro:", { nombre, correo, password });
      return res.status(400).json({ error: "Faltan datos" });
    }

    try {
      console.log("Buscando si el usuario ya existe...");
      const existe = await Usuario.findOne({ where: { correo } });
      if (existe) {
        console.warn("Usuario ya registrado con ese correo:", correo);
        return res.status(409).json({ error: "El usuario ya existe" });
      }

      console.log("Hasheando contraseña...");
      const hash = await bcrypt.hash(password, 10);
      console.log("Hash generado:", hash);

      console.log("Creando nuevo usuario...");
      const nuevoUsuario = await Usuario.create({
        nombre,
        correo,
        password: hash,
        rol: rol || "comprador"
      });
      console.log("Usuario creado:", nuevoUsuario.dataValues);

      console.log("Generando token JWT...");
      const token = jwt.sign(
        {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      console.log("Registro completado con éxito.");
      res.status(201).json({
        mensaje: "Usuario registrado",
        token,
        usuario: {
          id: nuevoUsuario.id,
          nombre,
          correo,
          rol: nuevoUsuario.rol
        }
      });
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  },

  // POST /api/sesion/login
  login: async (req, res) => {
    console.log("---- LOGIN ----");
    console.log("Body recibido:", req.body);

    const { correo, password } = req.body;

    if (!correo || !password) {
      console.warn("Faltan campos en el login:", { correo, password });
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
      console.log("Buscando usuario por correo:", correo);
      const usuario = await Usuario.findOne({ where: { correo } });
      if (!usuario) {
        console.warn("No se encontró usuario con ese correo");
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      console.log("Verificando si el usuario está activo...");
      if (!usuario.activo) {
        console.warn("La cuenta está desactivada:", usuario.id);
        return res.status(403).json({ error: "Esta cuenta ha sido desactivada" });
      }

      console.log("Comparando contraseñas...");
      const coincide = await bcrypt.compare(password, usuario.password);
      console.log("¿Contraseña coincide?", coincide);
      if (!coincide) {
        console.warn("Contraseña incorrecta para:", correo);
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      console.log("Generando token JWT...");
      const token = jwt.sign(
        {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      console.log("Inicio de sesión exitoso.");
      res.json({
        mensaje: "Inicio de sesión exitoso",
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    } catch (err) {
      console.error("Error en el login:", err);
      res.status(500).json({ error: "Error en el login" });
    }
  },

  // POST /api/sesion/logout
  logout: (req, res) => {
    console.log("Cerrando sesión...");
    res.json({ mensaje: "Sesión cerrada correctamente" });
  }
};

module.exports = sesionController;
