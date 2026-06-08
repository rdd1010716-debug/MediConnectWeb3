const supabase = require('../config/supabase');

const establecerDisponibilidad = async (req, res) => {
    try {
        const { fecha, hora_inicio, hora_fin } = req.body;
        const id_medico = req.usuario.id; // Viene seguro desde el JWT del médico

        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const { data, error } = await supabase
            .from('disponibilidad_medicos')
            .insert([{ id_medico, fecha, hora_inicio, hora_fin }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Disponibilidad del médico guardada con éxito 🕒",
            disponibilidad: data[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { establecerDisponibilidad };