const supabase = require('../config/supabase');

// Obtener la lista de todos los médicos
const obtenerMedicos = async (req, res) => {
    try {
        // Consultamos la tabla usuarios y filtramos solo los que tienen rol 'medico'
        // Solo devolvemos id, nombre y email (por seguridad, NUNCA la contraseña)
        const { data: medicos, error } = await supabase
            .from('usuarios')
            .select('id, nombre, email')
            .eq('rol', 'medico');

        if (error) throw error;

        res.status(200).json({
            message: "Listado de médicos recuperado con éxito 👨‍⚕️",
            total: medicos.length,
            medicos: medicos
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerMedicos };