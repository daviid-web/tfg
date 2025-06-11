const Usuario = require('../model/Usuario');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');

module.exports = {
  cambiarRol: async (req, res) => {
    try {
      const { id } = req.params;
      const { rol } = req.body;
      const usuarioSolicitante = req.usuario;

      // Verificar que el usuario tenga permisos para cambiar roles
      // Solo administradores o el propio usuario pueden cambiar su rol
      if (usuarioSolicitante.rol !== 'admin' && usuarioSolicitante.id !== parseInt(id)) {
        return res.status(403).json({ error: 'No tienes permisos para cambiar el rol de este usuario' });
      }

      // Validar que el rol sea válido
      if (!['comprador', 'vendedor'].includes(rol)) {
        return res.status(400).json({ error: 'Rol no válido' });
      }

      // Buscar el usuario
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar el rol
      usuario.rol = rol;
      await usuario.save();

      // Generar nuevo token con el rol actualizado
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        mensaje: 'Rol actualizado correctamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        },
        token
      });
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      res.status(500).json({ error: 'Error al cambiar el rol del usuario' });
    }
  },
  // Obtener perfil de usuario
  obtenerPerfil: async (req, res) => {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        attributes: ['id', 'nombre', 'correo', 'rol', 'telefono', 'foto', 'fecha_registro']
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
    }
  },

  // Actualizar perfil de usuario
  actualizarPerfil: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, correo, telefono } = req.body;
      const { id: usuarioSolicitante } = req.usuario;

      // Verificar permisos
      if (parseInt(id) !== usuarioSolicitante && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para modificar este perfil' });
      }

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar datos
      if (nombre) usuario.nombre = nombre;
      if (correo) usuario.correo = correo;
      if (telefono) usuario.telefono = telefono;

      await usuario.save();

      res.json({
        mensaje: 'Perfil actualizado correctamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          telefono: usuario.telefono,
          foto: usuario.foto,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar el perfil del usuario' });
    }
  },

  // Subir foto de perfil
  subirFotoPerfil: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: usuarioSolicitante } = req.usuario;

      // Verificar permisos
      if (parseInt(id) !== usuarioSolicitante && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para modificar este perfil' });
      }

      // Verificar si se subió un archivo
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
      }

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Construir la URL de la imagen
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const relativePath = `/uploads/${req.file.filename}`;
      const imageUrl = `${baseUrl}${relativePath}`;

      // Actualizar la URL de la foto en la base de datos
      usuario.foto = imageUrl;
      await usuario.save();

      res.json({
        mensaje: 'Foto de perfil actualizada correctamente',
        url: imageUrl
      });
    } catch (error) {
      console.error('Error al subir foto de perfil:', error);
      res.status(500).json({ error: 'Error al subir la foto de perfil' });
    }
  },

  cambiarPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNueva } = req.body;
      const { id: usuarioSolicitante } = req.usuario;

      console.log('--- Cambiar contraseña ---');
      console.log('ID en URL:', id);
      console.log('ID del usuario autenticado (token):', usuarioSolicitante);
      console.log('Contraseña actual recibida:', passwordActual);
      console.log('Nueva contraseña recibida:', passwordNueva);

      // Verificar permisos
      if (parseInt(id) !== usuarioSolicitante) {
        console.log('❌ IDs no coinciden. Permiso denegado.');
        return res.status(403).json({ error: 'No tienes permiso para cambiar la contraseña de este usuario' });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        console.log('❌ Usuario no encontrado en la base de datos.');
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('✅ Usuario encontrado:', usuario.email || usuario.id);

      // Verificar contraseña actual con bcrypt
      const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
      console.log('¿Contraseña actual válida?:', passwordValida);

      if (!passwordValida) {
        console.log('❌ La contraseña actual no coincide.');
        return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
      }

      // Hashear nueva contraseña antes de guardar
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordNueva, salt);

      usuario.password = hashedPassword;
      await usuario.save();

      console.log('✅ Contraseña actualizada correctamente.');
      res.json({
        mensaje: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      console.error('❌ Error inesperado al cambiar contraseña:', error);
      res.status(500).json({ error: 'Error al cambiar la contraseña' });
    }
  }


}
