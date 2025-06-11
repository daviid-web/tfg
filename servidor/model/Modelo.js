const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Marca = require('./Marca');

const Modelo = sequelize.define('Modelo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    marca_id: {
        type: DataTypes.INTEGER,  
        allowNull: false
    }
}, {
    tableName: 'Modelo',
    timestamps: true
});

// Un Modelo pertenece a una Marca
Modelo.belongsTo(Marca, {
    foreignKey: 'marca_id'
});

// Una Marca tiene muchos Modelos
Marca.hasMany(Modelo, {
    foreignKey: 'marca_id'
});

module.exports = Modelo;
