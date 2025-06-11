const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reporte = sequelize.define('Reporte', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuarios',
            key: 'id',
        },
    },
    anuncioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Anuncios',
            key: 'id',
        },
    },
});

module.exports = Reporte;
