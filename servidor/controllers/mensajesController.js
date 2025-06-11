const { Op } = require('sequelize');
const Mensaje = require('../model/Mensaje');
const Usuario = require('../model/Usuario');
const Anuncio = require('../model/Anuncio');

let io;

module.exports = {
  setSocketIO: (socketIO) => {
    io = socketIO;
    console.log('Socket.IO inicializado.');
  },

  enviarMensaje: async (req, res) => {
    const emisor_id = req.usuario.id;
    const { receptor_id, anuncio_id, contenido } = req.body;

    if (!receptor_id || !anuncio_id || !contenido?.trim()) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
      const [receptor, anuncio] = await Promise.all([
        Usuario.findByPk(receptor_id),
        Anuncio.findByPk(anuncio_id)
      ]);

      if (!receptor || !anuncio) {
        return res.status(404).json({ error: 'Receptor o anuncio no encontrado.' });
      }

      const nuevoMensaje = await Mensaje.create({
        emisor_id,
        receptor_id,
        anuncio_id,
        contenido: contenido.trim(),
        // fecha_envio: new Date(), // Puedes mantener esto si la columna existe y la usas para algo específico,
                                  // pero para ordenar usaremos 'createdAt'.
        leido: false
      });

      const mensajeConDetalles = await Mensaje.findByPk(nuevoMensaje.id, {
        include: [
          { model: Usuario, as: 'emisor', attributes: ['id', 'nombre', 'foto'] },
          { model: Usuario, as: 'receptor', attributes: ['id', 'nombre', 'foto'] },
          { model: Anuncio, as: 'anuncio', attributes: ['id', 'titulo', 'imagen_principal'] }
        ]
      });

      const room = `${Math.min(emisor_id, receptor_id)}-${Math.max(emisor_id, receptor_id)}-${anuncio_id}`;
      if (io) {
        io.to(room).emit('mensajeRecibido', mensajeConDetalles);
      } else {
        console.warn('Socket.IO no está inicializado. No se pudo emitir el mensaje.');
      }

      res.status(201).json({ mensaje: 'Mensaje enviado.', datos: mensajeConDetalles });

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      res.status(500).json({ error: 'Error interno al enviar el mensaje.' });
    }
  },

  eliminarMensaje: async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    try {
      const mensaje = await Mensaje.findByPk(id);

      if (!mensaje) {
        return res.status(404).json({ error: 'Mensaje no encontrado.' });
      }

      const autorizado = mensaje.emisor_id === usuarioId || mensaje.receptor_id === usuarioId;
      if (!autorizado) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este mensaje.' });
      }

      await mensaje.destroy();
      res.json({ mensaje: 'Mensaje eliminado.' });

    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      res.status(500).json({ error: 'Error interno al eliminar el mensaje.' });
    }
  },

  getConversaciones: async (req, res) => {
    const usuarioId = parseInt(req.params.id);

    if (usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para ver estas conversaciones.' });
    }

    try {
      const mensajes = await Mensaje.findAll({
        where: {
          [Op.or]: [{ emisor_id: usuarioId }, { receptor_id: usuarioId }]
        },
        include: [
          { model: Usuario, as: 'emisor', attributes: ['id', 'nombre', 'foto'] },
          { model: Usuario, as: 'receptor', attributes: ['id', 'nombre', 'foto'] },
          { model: Anuncio, as: 'anuncio', attributes: ['id', 'titulo', 'imagen_principal'] }
        ],
        // --- CAMBIO AQUÍ: Usamos 'createdAt' en lugar de 'fecha_envio' ---
        order: [['createdAt', 'DESC']] // Ordena por la fecha de creación más reciente
      });

      const conversaciones = [];
      const vistos = new Set();

      for (const msg of mensajes) {
        const otroId = msg.emisor_id === usuarioId ? msg.receptor_id : msg.emisor_id;
        const clave = `${otroId}-${msg.anuncio_id}`;
        if (!vistos.has(clave)) {
          conversaciones.push(msg);
          vistos.add(clave);
        }
      }

      res.json(conversaciones);

    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      res.status(500).json({ error: 'Error interno al obtener las conversaciones.' });
    }
  },

  getMensajesDeConversacion: async (req, res) => {
    const usuarioId = parseInt(req.query.usuarioId);
    const receptorId = parseInt(req.query.receptorId);
    const anuncioId = parseInt(req.query.anuncioId);
    const usuarioAutenticadoId = req.usuario.id;

    if (isNaN(usuarioId) || isNaN(receptorId) || isNaN(anuncioId)) {
      return res.status(400).json({ error: 'Parámetros de conversación inválidos.' });
    }

    if (usuarioAutenticadoId !== usuarioId && usuarioAutenticadoId !== receptorId) {
      return res.status(403).json({ error: 'No autorizado para ver esta conversación.' });
    }

    try {
      const mensajes = await Mensaje.findAll({
        where: {
          anuncio_id: anuncioId,
          [Op.or]: [
            { emisor_id: usuarioId, receptor_id: receptorId },
            { emisor_id: receptorId, receptor_id: usuarioId }
          ]
        },
        include: [
          { model: Usuario, as: 'emisor', attributes: ['id', 'nombre', 'foto'] },
          { model: Usuario, as: 'receptor', attributes: ['id', 'nombre', 'foto'] },
          { model: Anuncio, as: 'anuncio', attributes: ['id', 'titulo', 'imagen_principal'] }
        ],
        // --- CAMBIO AQUÍ: Usamos 'createdAt' en lugar de 'fecha_envio' ---
        order: [['createdAt', 'ASC']] // Ordena cronológicamente por la fecha de creación
      });

      res.json(mensajes);

    } catch (error) {
      console.error('Error al obtener mensajes de la conversación:', error);
      res.status(500).json({ error: 'Error interno al obtener los mensajes de la conversación.' });
    }
  },

  // ... (tus funciones existentes como enviarMensaje, etc.) ...

  // Nuevo método para iniciar o seleccionar una conversación
  iniciarOSeleccionarConversacion: async (req, res) => {
    // emisorId es tu usuario logueado
    // receptorId es el vendedor del anuncio
    // anuncioId es el ID del anuncio
    const { emisorId, receptorId, anuncioId } = req.body;

    // --- Validaciones ---
    if (!emisorId || !receptorId || !anuncioId) {
      return res.status(400).json({ error: 'Faltan parámetros necesarios (emisorId, receptorId, anuncioId).' });
    }
    if (emisorId === receptorId) {
      return res.status(400).json({ error: 'No puedes iniciar una conversación contigo mismo.' });
    }

    try {
      // 1. Buscar si ya existe una conversación para este par de usuarios y este anuncio
      const conversacionExistente = await Mensaje.findOne({
        where: {
          anuncio_id: anuncioId,
          // Busca mensajes donde los IDs coincidan, sin importar el orden
          [Op.or]: [
            { emisor_id: emisorId, receptor_id: receptorId },
            { emisor_id: receptorId, receptor_id: emisorId }
          ]
        },
        // Solo necesitamos saber si existe, no el contenido del mensaje
        attributes: ['id', 'emisor_id', 'receptor_id', 'anuncio_id']
      });

      if (conversacionExistente) {
        // Si ya existe una conversación, simplemente la devolvemos
        console.log(`[Backend] Conversación existente encontrada: ${conversacionExistente.id}`);
        return res.status(200).json({
          message: 'Conversación existente seleccionada.',
          conversationId: conversacionExistente.id,
          receptorId: receptorId, // Devolvemos los IDs que usó el frontend
          anuncioId: anuncioId
        });
      } else {
        // Si no existe, creamos el primer mensaje para "iniciar" la conversación
        const primerMensaje = await Mensaje.create({
          emisor_id: emisorId,
          receptor_id: receptorId,
          anuncio_id: anuncioId,
          contenido: '¡Hola! Me interesa este anuncio.', // Puedes poner un mensaje por defecto o vacío
          leido: false // O true, según tu lógica inicial
        });

        console.log(`[Backend] Nueva conversación iniciada con el primer mensaje ID: ${primerMensaje.id}`);
        return res.status(201).json({
          message: 'Nueva conversación iniciada.',
          conversationId: primerMensaje.id,
          receptorId: receptorId,
          anuncioId: anuncioId
        });
      }

    } catch (error) {
      console.error('[Backend] Error en iniciarOSeleccionarConversacion:', error);
      res.status(500).json({ error: 'Error interno del servidor al iniciar/seleccionar conversación.' });
    }
  },
};