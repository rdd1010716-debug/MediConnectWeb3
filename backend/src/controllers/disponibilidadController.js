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

// Obtener disponibilidad de un médico específico
const obtenerDisponibilidadPorMedico = async (req, res) => {
    try {
        const { id_medico } = req.params;

        if (!id_medico) {
            return res.status(400).json({ error: "El ID del médico es requerido" });
        }

        const { data, error } = await supabase
            .from('disponibilidad_medicos')
            .select('*')
            .eq('id_medico', id_medico)
            .order('fecha', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            message: "Disponibilidad recuperada con éxito",
            disponibilidades: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { establecerDisponibilidad, obtenerDisponibilidadPorMedico };