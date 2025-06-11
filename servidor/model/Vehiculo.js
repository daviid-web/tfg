const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Modelo = require('./Modelo');
const Anuncio = require('./Anuncio');

const Vehiculo = sequelize.define('Vehiculo', {
    matricula: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    modelo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado_vehiculo: {
        type: DataTypes.ENUM('nuevo', 'seminuevo', 'kilometro_0', 'segunda_mano', 'ocasion', 'prototipo'),
        allowNull: false
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1900,
            max: new Date().getFullYear() + 1
        }
    },
    kilometros: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    combustible: {
        type: DataTypes.ENUM('gasolina', 'diesel', 'electrico', 'hibrido', 'GLP', 'hidrogeno', 'otros'),
        allowNull: false
    },
    transmision: {
        type: DataTypes.ENUM('manual', 'automatica', 'semiautomatica', 'CVT'),
        allowNull: false
    },
    traccion: {
        type: DataTypes.ENUM('delantera', 'trasera', '4x4'),
        allowNull: false
    },
    potencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    cilindrada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numero_puertas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 6
        }
    },
    plazas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 9
        }
    },
    peso: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    consumo: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    fotos: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'Vehiculo',
    timestamps: true
});

// Relaciones
Vehiculo.belongsTo(Modelo, { foreignKey: 'modelo_id' });
Modelo.hasMany(Vehiculo, { foreignKey: 'modelo_id'});


module.exports = Vehiculo;

