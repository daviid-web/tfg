const Favorito = require('../model/Favorito');
const Anuncio = require('../model/Anuncio');
const Vehiculo = require('../model/Vehiculo');
const Usuario = require('../model/Usuario');
const Modelo = require('../model/Modelo');
const Marca = require('../model/Marca');

module.exports = {
  // Obtener todos los favoritos del usuario autenticado
  obtenerFavoritos: async (req, res) => {
    try {
      const { id: usuarioId } = req.usuario;
      
      console.log('Obteniendo favoritos para el usuario:', usuarioId);
      
      // Buscar todos los favoritos del usuario
      const favoritos = await Favorito.findAll({
        where: { usuario_id: usuarioId },
        include: [{
          model: Anuncio,
          as: 'anuncio',
          include: [{
            model: Vehiculo,
            as: 'vehiculo'
          }]
        }]
      });
      
      // Mapear los IDs de anuncios para el frontend
      const favoritosSimples = favoritos.map(fav => ({
        id: fav.id,
        anuncio_id: fav.anuncio_id,
        usuario_id: fav.usuario_id,
        fecha_agregado: fav.fecha_agregado
      }));
      
      res.json(favoritosSimples);
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      res.status(500).json({ error: 'Error al obtener los favoritos' });
    }
  },
  
  // Agregar un anuncio a favoritos
  agregarFavorito: async (req, res) => {
    try {
      const { anuncioId } = req.params;
      const { id: usuarioId } = req.usuario;
      
      console.log(`Agregando anuncio ${anuncioId} a favoritos del usuario ${usuarioId}`);

      // Verificar si el anuncio existe
      const anuncio = await Anuncio.findByPk(anuncioId);
      if (!anuncio) {
        return res.status(404).json({ error: 'Anuncio no encontrado' });
      }

      // Verificar si ya es favorito
      const existente = await Favorito.findOne({
        where: { 
          usuario_id: usuarioId, 
          anuncio_id: anuncioId 
        }
      });

      if (existente) {
        return res.status(400).json({ error: 'Este anuncio ya está en tus favoritos' });
      }

      // Crear nuevo favorito
      const nuevoFavorito = await Favorito.create({ 
        usuario_id: usuarioId, 
        anuncio_id: anuncioId,
        fecha_agregado: new Date()
      });

      res.status(201).json({
        mensaje: 'Anuncio añadido a favoritos',
        favorito: {
          id: nuevoFavorito.id,
          anuncio_id: nuevoFavorito.anuncio_id,
          usuario_id: nuevoFavorito.usuario_id,
          fecha_agregado: nuevoFavorito.fecha_agregado
        }
      });
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      res.status(500).json({ error: 'Error al agregar el anuncio a favoritos' });
    }
  },

  // Eliminar un favorito
  eliminarFavorito: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: usuarioId } = req.usuario;
      
      console.log(`Eliminando favorito ${id} del usuario ${usuarioId}`);

      // Buscar el favorito
      const favorito = await Favorito.findOne({
        where: { 
          id,
          usuario_id: usuarioId 
        }
      });

      if (!favorito) {
        return res.status(404).json({ error: 'Favorito no encontrado' });
      }

      // Eliminar el favorito
      await favorito.destroy();
      
      res.json({ mensaje: 'Favorito eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      res.status(500).json({ error: 'Error al eliminar el favorito' });
    }
  },
  
  // Eliminar un favorito por ID de anuncio
  eliminarFavoritoPorAnuncio: async (req, res) => {
    try {
      const { anuncioId } = req.params;
      const { id: usuarioId } = req.usuario;
      
      console.log(`Eliminando favorito del anuncio ${anuncioId} para el usuario ${usuarioId}`);

      // Buscar el favorito por anuncio_id
      const favorito = await Favorito.findOne({
        where: { 
          anuncio_id: anuncioId,
          usuario_id: usuarioId 
        }
      });

      if (!favorito) {
        return res.status(404).json({ error: 'Favorito no encontrado' });
      }

      // Eliminar el favorito
      await favorito.destroy();
      
      res.json({ mensaje: 'Favorito eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar favorito por anuncio:', error);
      res.status(500).json({ error: 'Error al eliminar el favorito' });
    }
  },

  // Listar favoritos de un usuario específico
  listarFavoritos: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: usuarioSolicitante } = req.usuario;
      
      // Verificar permisos
      if (parseInt(id) !== usuarioSolicitante && req.usuario.rol !== 'admin') {
        console.log('Acceso denegado: El usuario no tiene permisos');
        return res.status(403).json({ error: 'No tienes permiso para ver estos favoritos' });
      }
  
      
      // Obtener favoritos con información del anuncio y relaciones correctas para obtener marca y modelo
      const favoritos = await Favorito.findAll({
        where: { usuario_id: id },
        include: [{
          model: Anuncio,
          as: 'anuncio',
          attributes: ['id', 'titulo', 'precio', 'imagen_principal'],
          include: [{
            model: Vehiculo,
            as: 'vehiculo',
            attributes: ['matricula', 'anio', 'kilometros', 'combustible'],
            include: [{
              model: Modelo,
              as: 'Modelo', // Cambiado de 'modelo' a 'Modelo' para que coincida con la asociación
              attributes: ['nombre'],
              include: [{
                model: Marca,
                attributes: ['nombre']
              }]
            }]
          }]
        }],
        order: [['fecha_agregado', 'DESC']]
      });
  
      console.log('Favoritos encontrados:', favoritos.length);
      
      // Formatear la respuesta para que coincida con lo que espera el frontend
      const favoritosFormateados = favoritos.map(favorito => {
        const anuncio = favorito.anuncio;
        const vehiculo = anuncio.vehiculo || {};
        const modelo = vehiculo.modelo || {};
        const marca = modelo.marca || {};
        
        return {
          id: favorito.id,
          anuncio_id: anuncio.id,
          usuario_id: favorito.usuario_id,
          fecha_agregado: favorito.fecha_agregado,
          anuncio: {
            id: anuncio.id,
            titulo: anuncio.titulo,
            precio: anuncio.precio,
            marca: marca.nombre || '',
            modelo: modelo.nombre || '',
            anio: vehiculo.anio || 0,
            kilometros: vehiculo.kilometros || 0,
            combustible: vehiculo.combustible || '',
            imagen_principal: anuncio.imagen_principal
          }
        };
      });
  
      console.log('Respuesta formateada lista para enviar');
      console.log(favoritosFormateados);
      res.json(favoritosFormateados);
    } catch (error) {
      console.error('Error en listarFavoritos:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Error al obtener la lista de favoritos' });
    }
  },

  // Verificar si un anuncio es favorito del usuario
  esFavorito: async (req, res) => {
    try {
      const { anuncioId } = req.params;
      const { id: usuarioId } = req.usuario;

      const favorito = await Favorito.findOne({
        where: { 
          usuario_id: usuarioId, 
          anuncio_id: anuncioId 
        }
      });

      res.json({ 
        esFavorito: !!favorito,
        favorito: favorito ? {
          id: favorito.id,
          anuncio_id: favorito.anuncio_id,
          usuario_id: favorito.usuario_id
        } : null
      });
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      res.status(500).json({ error: 'Error al verificar si el anuncio es favorito' });
    }
  }
};
