const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comentario = require('./Comentario');
const Usuario = require('./Usuario');
const Vehiculo = require('./Vehiculo');


const Anuncio = sequelize.define('Anuncio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    matricula: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Vehiculo',
            key: 'matricula'
        }
    },
    vendedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuario',
            key: 'id'
        }
    },
    titulo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'vendido'),
        defaultValue: 'activo',
        allowNull: false
    },
    imagen_principal: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'assets/default-car.jpg'
    },
    imagenes_adicionales: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('imagenes_adicionales');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('imagenes_adicionales', JSON.stringify(value));
        }
    }
}, {
    tableName: 'Anuncio',
    timestamps: true,
    createdAt: 'fecha_publicacion',
    updatedAt: 'fecha_actualizacion'
});

// Relaciones
Anuncio.belongsTo(Usuario, {
    foreignKey: 'vendedor_id',
    as: 'vendedor'
});

Anuncio.hasMany(Comentario, {
    foreignKey: 'anuncio_id',
    as: 'comentarios'
});

// Anuncio pertenece a un Vehiculo por la matrícula
Anuncio.belongsTo(Vehiculo, {
  foreignKey: 'matricula',
  targetKey: 'matricula',
  as: 'vehiculo'
});

Vehiculo.hasOne(Anuncio, {
  foreignKey: 'matricula',
  sourceKey: 'matricula',
  as: 'anuncio'
});


module.exports = Anuncio;
