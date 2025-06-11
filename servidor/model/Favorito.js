// models/Favorito.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Anuncio = require('./Anuncio');

const Favorito = sequelize.define('Favorito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuario',
      key: 'id'
    }
  },
  anuncio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Anuncio',
      key: 'id'
    }
  },
  fecha_agregado: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Favorito',
  timestamps: false,
});

// Establecer relaciones
Favorito.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Favorito.belongsTo(Anuncio, { foreignKey: 'anuncio_id', as: 'anuncio' });

module.exports = Favorito;

