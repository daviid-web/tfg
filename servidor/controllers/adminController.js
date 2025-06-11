const Usuario = require('../model/Usuario');
const Reporte = require('../model/Reporte');
const Anuncio = require('../model/Anuncio');

module.exports = {
    listarUsuarios: async (req, res) => {
        try {
            const usuarios = await Usuario.findAll();
            res.json(usuarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al listar usuarios' });
        }
    },
    actualizarEstadoUsuario: async (req, res) => {
        try {
            const id = req.params.id;
            const { activo } = req.body;
            const usuario = await Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            usuario.activo = activo;
            await usuario.save();
            res.json({ mensaje: 'Estado actualizado', usuario });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar usuario' });
        }
    },
    listarAnuncios: async (req, res) => {
        try {
            const anuncios = await Anuncio.findAll();
            res.json(anuncios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al listar anuncios' });
        }
    },

    actualizarEstadoAnuncio: async (req, res) => {
        try {
            const id = req.params.id;
            const { activo } = req.body;
            const anuncio = await Anuncio.findByPk(id);
            if (!anuncio) return res.status(404).json({ mensaje: 'Anuncio no encontrado' });

            anuncio.activo = activo;
            await anuncio.save();
            res.json({ mensaje: 'Estado actualizado', anuncio });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar anuncio' });
        }
    },

    listarReportes: async (req, res) => {
        try {
            const reportes = await Reporte.findAll({
                include: [
                    {
                        model: Usuario,
                        attributes: ['id', 'nombre', 'correo'],
                    },
                    {
                        model: Anuncio,
                        attributes: ['id', 'titulo', 'descripcion'],
                    }
                ]
            });

            res.json(reportes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al listar reportes' });
        }
    },

    eliminarReporte: async (req, res) => {
        try {
            const id = req.params.id;
            const reporte = await Reporte.findByPk(id);
            if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });

            await reporte.destroy();
            res.json({ mensaje: 'Reporte eliminado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al eliminar reporte' });
        }
    },

    
  eliminarUsuario : async (req, res) => {
    const { id } = req.params; 

    try {
        const usuarioEliminado = await Usuario.destroy({ where: { id: id } }); 

        if (usuarioEliminado === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Usuario eliminado exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar usuario.', error: error.message });
    }
}
};

