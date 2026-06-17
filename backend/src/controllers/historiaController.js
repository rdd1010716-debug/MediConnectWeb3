const supabase = require('../config/supabase');

// Guardar diagnóstico de una cita
const guardarHistoria = async (req, res) => {
    try {
        const { id_cita, diagnostico, tratamiento, notas_medicas } = req.body;

        const { data, error } = await supabase
            .from('historias_clinicas')
            .insert([{ id_cita, diagnostico, tratamiento, notas_medicas }])
            .select();

        if (error) throw error;

        res.status(201).json({ 
            message: "Historia clínica creada correctamente 📝", 
            data: data[0] 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener historia de un paciente por ID de cita
const obtenerHistoria = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const { data, error } = await supabase
            .from('historias_clinicas')
            .select('*')
            .eq('id_cita', id_cita)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ error: "Historia no encontrada" });
    }
};

// Actualizar historia clínica existente
const actualizarHistoria = async (req, res) => {
    try {
        const { id_cita, diagnostico, tratamiento, notas_medicas } = req.body;

        const { data, error } = await supabase
            .from('historias_clinicas')
            .update({ diagnostico, tratamiento, notas_medicas })
            .eq('id_cita', id_cita)
            .select();

        if (error) throw error;

        res.status(200).json({
            message: "Historia clínica actualizada correctamente ✏️",
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { guardarHistoria, obtenerHistoria, actualizarHistoria };