const { Op } = require('sequelize');
const Anuncio = require('../model/Anuncio');
const Vehiculo = require('../model/Vehiculo');
const Marca = require('../model/Marca');
const Modelo = require('../model/Modelo');
const Usuario = require('../model/Usuario');

module.exports = {
  verAnuncios: async (req, res) => {
    try {
      const anuncios = await Anuncio.findAll({
        where: { estado: 'activo' },
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
            attributes: ['anio', 'combustible', 'kilometros']
          }
        ]
      });

      // Opcional: transformar los datos si quieres que estén al mismo nivel que anuncio
      const anunciosConDatos = anuncios.map(anuncio => {
        const vehiculo = anuncio.vehiculo || {};
        return {
          ...anuncio.toJSON(),
          anio: vehiculo.anio,
          combustible: vehiculo.combustible,
          kilometros: vehiculo.kilometros
        };
      });
      console.log("Anuncios encontrados:", anunciosConDatos);

      res.json(anunciosConDatos);
    } catch (error) {
      console.error('Error al obtener anuncios:', error);
      res.status(500).json({ mensaje: 'Error al obtener los anuncios' });
    }
  },

  verAnunciosFiltrados: async (req, res) => {
    try {
      const whereAnuncio = { estado: 'activo' };
      const whereVehiculo = {};
      const whereModelo = {};
      const whereMarca = {};

      if (req.query.marca_id) {
        whereMarca.id = req.query.marca_id;
      }

      if (req.query.modelo_id) {
        whereModelo.id = req.query.modelo_id;
      }

      if (req.query.precio_min || req.query.precio_max) {
        whereAnuncio.precio = {};
        if (req.query.precio_min) {
          whereAnuncio.precio[Op.gte] = req.query.precio_min;
        }
        if (req.query.precio_max) {
          whereAnuncio.precio[Op.lte] = req.query.precio_max;
        }
      }

      if (req.query.anio_min || req.query.anio_max) {
        whereVehiculo.anio = {};
        if (req.query.anio_min) {
          whereVehiculo.anio[Op.gte] = req.query.anio_min;
        }
        if (req.query.anio_max) {
          whereVehiculo.anio[Op.lte] = req.query.anio_max;
        }
      }

      if (req.query.combustible) {
        whereVehiculo.combustible = req.query.combustible;
      }

      if (req.query.km_min || req.query.km_max) {
        whereVehiculo.kilometros = {};
        if (req.query.km_min) {
          whereVehiculo.kilometros[Op.gte] = req.query.km_min;
        }
        if (req.query.km_max) {
          whereVehiculo.kilometros[Op.lte] = req.query.km_max;
        }
      }

      const anuncios = await Anuncio.findAll({
        where: whereAnuncio,
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
            required: true,
            where: Object.keys(whereVehiculo).length ? whereVehiculo : undefined,
            attributes: ['anio', 'combustible', 'kilometros'],
            include: [
              {
                model: Modelo,
                required: true,
                where: Object.keys(whereModelo).length ? whereModelo : undefined,
                include: [
                  {
                    model: Marca,
                    required: true,
                    where: Object.keys(whereMarca).length ? whereMarca : undefined
                  }
                ]
              }
            ]
          }
        ],
        order: [['fecha_publicacion', 'DESC']]
      });

      // Transformar los datos como en verAnuncios
      const anunciosConDatos = anuncios.map(anuncio => {
        const vehiculo = anuncio.vehiculo || {};
        return {
          ...anuncio.toJSON(),
          anio: vehiculo.anio,
          combustible: vehiculo.combustible,
          kilometros: vehiculo.kilometros
        };
      });

      res.json(anunciosConDatos);
    } catch (error) {
      console.error('Error al filtrar anuncios:', error);
      res.status(500).json({ mensaje: 'Error al filtrar los anuncios' });
    }
  },


  verMisAnuncios: async (req, res) => {
    const usuarioId = parseInt(req.query.usuarioId, 10);

    if (isNaN(usuarioId)) {
      return res.status(400).json({ mensaje: 'usuarioId inválido o no proporcionado' });
    }

    try {
      const anuncios = await Anuncio.findAll({
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
          }
        ],
        where: { vendedor_id: usuarioId }
      });
      console.log(anuncios);
      res.json(anuncios);
    } catch (error) {
      console.error('Error al obtener tus anuncios:', error);
      res.status(500).json({ mensaje: 'Error al obtener tus anuncios' });
    }
  },

  detalleAnuncio: async (req, res) => {
    const { id } = req.params;

    try {
      const anuncio = await Anuncio.findByPk(id, {
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
            include: [
              {
                model: Modelo,
                include: [
                  {
                    model: Marca
                  }
                ]
              }
            ]
          },
          {
            model: Usuario,
            as: 'vendedor',
          }
        ]
      });

      if (!anuncio) {
        return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
      }
      res.json(anuncio);
    } catch (error) {
      console.error('❌ Error al obtener el detalle del anuncio:', error);
      res.status(500).json({ mensaje: 'Error al obtener el detalle del anuncio' });
    }
  },


  crearAnuncio: async (req, res) => {

    try {
      const {
        titulo,
        matricula,
        modelo_id,
        estado_vehiculo,
        anio,
        kilometros,
        combustible,
        transmision,
        traccion,
        potencia,
        cilindrada,
        color,
        numero_puertas,
        plazas,
        descripcion,
        precio
      } = req.body;

      const vendedor_id = req.usuario?.id;

      // Verificación de campos obligatorios
      const camposObligatorios = {
        titulo, matricula, modelo_id, estado_vehiculo, anio,
        kilometros, combustible, transmision, traccion,
        potencia, cilindrada, color, numero_puertas, plazas,
        descripcion, precio
      };

      const faltanCampos = Object.entries(camposObligatorios).filter(([key, val]) =>
        val === undefined || val === null || val === ''
      );

      if (faltanCampos.length > 0) {
        console.warn('⚠️ Faltan campos:', faltanCampos.map(([k]) => k));
        return res.status(400).json({ error: `Faltan campos: ${faltanCampos.map(([k]) => k).join(', ')}` });
      }

      const [vehiculo, creado] = await Vehiculo.findOrCreate({
        where: { matricula },
        defaults: {
          matricula,
          modelo_id,
          estado_vehiculo,
          anio,
          kilometros,
          combustible,
          transmision,
          traccion,
          potencia,
          cilindrada,
          color,
          numero_puertas,
          plazas
        }
      });

      const anuncio = await Anuncio.create({
        titulo,
        matricula,
        vendedor_id,
        descripcion,
        precio,
        estado: 'activo',
        imagen_principal: req.files?.imagen_principal?.[0]?.filename || 'assets/default-car.jpg',
        imagenes_adicionales: req.files?.imagenes_adicionales?.map(img => img.filename) || [],
        fecha_publicacion: new Date(),
        fecha_actualizacion: new Date()
      });

      res.status(201).json(anuncio);

    } catch (error) {
      console.error('❌ Error al crear el anuncio:', error);
      res.status(500).json({ error: 'Error al crear el anuncio' });
    }
  },

  borraAnuncio: async (req, res) => {
    const { id } = req.params;

    try {
      const anuncio = await Anuncio.findByPk(id);

      if (!anuncio) {
        return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
      }

      // Comprobación de permisos
      const esVendedor = anuncio.vendedor_id === req.usuario.id;
      const esAdmin = req.usuario.email === 'admin@admin.com' || req.usuario.rol === 'admin';

      if (!esVendedor && !esAdmin) {
        return res.status(403).json({ mensaje: 'No autorizado para eliminar este anuncio' });
      }

      await anuncio.destroy();

      res.json({ mensaje: 'Anuncio eliminado correctamente' });
    } catch (error) {
      console.error('Error al borrar el anuncio:', error);
      res.status(500).json({ mensaje: 'Error al borrar el anuncio' });
    }
  },

  setAnuncioVendido: async (req, res) => {
    const { id } = req.params;
    try {
      const [actualizado] = await Anuncio.update({ estado: 'vendido' }, { where: { id } });

      if (actualizado) {
        const anuncio = await Anuncio.findByPk(id);
        res.json({ mensaje: 'Anuncio marcado como vendido', anuncio });
      } else {
        res.status(404).json({ mensaje: 'Anuncio no encontrado' });
      }
    } catch (error) {
      console.error('Error al marcar el anuncio como vendido:', error);
      res.status(500).json({ mensaje: 'Error al marcar como vendido' });
    }
  },
};
