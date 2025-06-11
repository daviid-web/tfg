const Vehiculo = require('../model/Vehiculo');
const Marca = require('../model/Marca');
const Modelo = require('../model/Modelo');
const Anuncio = require('../model/Anuncio');
const { Op } = require('sequelize');

module.exports = {
  // Crear un nuevo vehículo
  crearVehiculo: async (req, res) => {
    try {
      const {
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
        peso,
        consumo,
        fotos
      } = req.body;

      // Verificar datos obligatorios
      if (!matricula || !modelo_id || !estado_vehiculo || !anio || !kilometros || !combustible ||
        !transmision || !traccion || !potencia || !cilindrada || !color || !numero_puertas || !plazas) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
      }

      // Verificar si el modelo existe
      const modeloExiste = await Modelo.findByPk(modelo_id);
      if (!modeloExiste) {
        return res.status(404).json({ error: 'El modelo especificado no existe' });
      }

      // Verificar si ya existe un vehículo con esa matrícula
      const vehiculoExistente = await Vehiculo.findByPk(matricula);
      if (vehiculoExistente) {
        return res.status(409).json({ error: 'Ya existe un vehículo con esa matrícula' });
      }

      // Crear el vehículo
      const nuevoVehiculo = await Vehiculo.create({
        matricula,
        modelo_id,
        estado_vehiculo,
        anio,
        kilometros,
        combustible: typeof combustible === 'object' ? combustible.toString() : combustible,
        transmision,
        traccion,
        potencia,
        cilindrada,
        color,
        numero_puertas,
        plazas,
        peso,
        consumo,
        fotos
      });

      res.status(201).json({
        mensaje: 'Vehículo creado correctamente',
        vehiculo: nuevoVehiculo
      });
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      res.status(500).json({ error: 'Error al crear el vehículo' });
    }
  },

  // Obtener todos los vehículos
  obtenerVehiculos: async (req, res) => {
    try {
      const {
        marca, modelo, anioMin, anioMax, precioMin, precioMax,
        kilometrosMin, kilometrosMax, combustible, transmision, estado
      } = req.query;

      // Construir filtros
      let filtros = {};
      let includeModelo = {
        model: Modelo,
        as: 'modelo'
      };

      // Filtros específicos para el modelo
      if (marca || modelo) {
        includeModelo.where = {};

        if (marca) {
          includeModelo.where.marca = marca;
        }

        if (modelo) {
          includeModelo.where.nombre = modelo;
        }
      }

      // Filtros para el vehículo
      if (anioMin || anioMax) {
        filtros.anio = {};
        if (anioMin) filtros.anio[Op.gte] = parseInt(anioMin);
        if (anioMax) filtros.anio[Op.lte] = parseInt(anioMax);
      }

      if (kilometrosMin || kilometrosMax) {
        filtros.kilometros = {};
        if (kilometrosMin) filtros.kilometros[Op.gte] = parseFloat(kilometrosMin);
        if (kilometrosMax) filtros.kilometros[Op.lte] = parseFloat(kilometrosMax);
      }

      if (combustible) {
        // Asegurarse de que combustible sea un string
        filtros.combustible = typeof combustible === 'object' ? combustible.toString() : combustible;
      }

      if (transmision) {
        filtros.transmision = transmision;
      }

      if (estado) {
        filtros.estado_vehiculo = estado;
      }

      // Obtener vehículos con filtros
      const vehiculos = await Vehiculo.findAll({
        where: filtros,
        include: [includeModelo],
        order: [['createdAt', 'DESC']]
      });

      res.json(vehiculos);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      res.status(500).json({ error: 'Error al obtener los vehículos' });
    }
  },

  // Obtener un vehículo por su matrícula
  obtenerVehiculoPorMatricula: async (req, res) => {
    try {
      const { matricula } = req.params;

      const vehiculo = await Vehiculo.findByPk(matricula, {
        include: [{
          model: Modelo,
          as: 'modelo'
        }]
      });

      if (!vehiculo) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      res.json(vehiculo);
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      res.status(500).json({ error: 'Error al obtener el vehículo' });
    }
  },

  // Actualizar un vehículo
  actualizarVehiculo: async (req, res) => {
    try {
      const { matricula } = req.params;
      const {
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
        peso,
        consumo,
        fotos
      } = req.body;

      // Verificar si el vehículo existe
      const vehiculo = await Vehiculo.findByPk(matricula);
      if (!vehiculo) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      // Verificar si el modelo existe (si se está actualizando)
      if (modelo_id) {
        const modeloExiste = await Modelo.findByPk(modelo_id);
        if (!modeloExiste) {
          return res.status(404).json({ error: 'El modelo especificado no existe' });
        }
      }

      // Actualizar los campos del vehículo
      await vehiculo.update({
        modelo_id: modelo_id || vehiculo.modelo_id,
        estado_vehiculo: estado_vehiculo || vehiculo.estado_vehiculo,
        anio: anio || vehiculo.anio,
        kilometros: kilometros || vehiculo.kilometros,
        combustible: combustible ? (typeof combustible === 'object' ? combustible.toString() : combustible) : vehiculo.combustible,
        transmision: transmision || vehiculo.transmision,
        traccion: traccion || vehiculo.traccion,
        potencia: potencia || vehiculo.potencia,
        cilindrada: cilindrada || vehiculo.cilindrada,
        color: color || vehiculo.color,
        numero_puertas: numero_puertas || vehiculo.numero_puertas,
        plazas: plazas || vehiculo.plazas,
        peso: peso !== undefined ? peso : vehiculo.peso,
        consumo: consumo !== undefined ? consumo : vehiculo.consumo,
        fotos: fotos || vehiculo.fotos
      });

      // Obtener el vehículo actualizado con sus relaciones
      const vehiculoActualizado = await Vehiculo.findByPk(matricula, {
        include: [{
          model: Modelo,
          as: 'modelo'
        }]
      });

      res.json({
        mensaje: 'Vehículo actualizado correctamente',
        vehiculo: vehiculoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      res.status(500).json({ error: 'Error al actualizar el vehículo' });
    }
  },

  
  // Listar todas las marcas disponibles
  listarMarcas: async (req, res) => {
    try {
      const marcas = await Marca.findAll({
        order: [['nombre', 'ASC']],
      });
       
      res.json(marcas);
    } catch (error) {
      console.error('Error al listar marcas:', error);
      res.status(500).json({ error: 'Error al obtener el listado de marcas' });
    }
  },

  // Listar modelos filtrados por marca
  listarModelos: async (req, res) => {
    try {
      const { marca_id } = req.query;
      
      if (!marca_id) {
        return res.status(400).json({ error: 'Se debe especificar una marca para filtrar los modelos' });
      }
      
      const modelos = await Modelo.findAll({
        attributes: ['id', 'nombre'],
        where: { marca_id: marca_id },
        order: [['nombre', 'ASC']]
      });
      
      res.json(modelos);
    } catch (error) {
      console.error('Error al listar modelos:', error);
      res.status(500).json({ error: 'Error al obtener el listado de modelos' });
    }
  },

  // Listar todos los tipos de combustible
  listarCombustibles: async (req, res) => {
    try {
      // Obtener los tipos de combustible desde el modelo de Vehiculo
      const tiposCombustible = Vehiculo.rawAttributes.combustible.values;
      
      // Devolver directamente el array de strings
      res.json(tiposCombustible);
    } catch (error) {
      console.error('Error al listar combustibles:', error);
      res.status(500).json({ error: 'Error al obtener el listado de combustibles' });
    }
  }
};
