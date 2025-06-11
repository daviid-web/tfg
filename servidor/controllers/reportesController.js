const Reporte = require('../model/Reporte');
const Anuncio = require('../model/Anuncio');
const Usuario = require('../model/Usuario');

const reportar = async (req, res) => {
  try {
    const anuncioId = req.params.id;
    const usuarioId = req.usuario.id; 
    const { motivo } = req.body;

    // Verifica que el anuncio existe
    const anuncio = await Anuncio.findByPk(anuncioId);
    if (!anuncio) {
      return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
    }

    // Verifica si el usuario ya ha reportado este anuncio
    const yaReportado = await Reporte.findOne({
      where: { anuncioId, usuarioId }
    });

    if (yaReportado) {
      return res.status(400).json({ mensaje: 'Ya has reportado este anuncio' });
    }

    // Crea el reporte
    const nuevoReporte = await Reporte.create({
      anuncioId,
      usuarioId,
      motivo
    });

    res.status(201).json({ mensaje: 'Reporte enviado correctamente', reporte: nuevoReporte });

  } catch (error) {
    console.error('Error al reportar anuncio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  reportar
};
