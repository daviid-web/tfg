const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mensaje = sequelize.define('Mensaje', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  emisor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receptor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  anuncio_id: {
  type: DataTypes.INTEGER,
  allowNull: false
},
}, {
  tableName: 'Mensaje',
  timestamps: true
});

module.exports = Mensaje;
