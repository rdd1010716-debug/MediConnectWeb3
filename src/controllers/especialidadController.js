const supabase = require('../config/supabase');

// Obtener todas las especialidades
const obtenerEspecialidades = async (req, res) => {
    try {
        // AQUÍ LO TOCAS: Añadimos el filtro para traer solo las activas
        const { data, error } = await supabase
            .from('especialidades')
            .select('*')
            .eq('activo', true); 
            
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear nueva especialidad (Solo admin)
const crearEspecialidad = async (req, res) => {
    try {
        const { nombre } = req.body;
        const { data, error } = await supabase.from('especialidades').insert([{ nombre }]);
        if (error) throw error;
        res.status(201).json({ message: "Especialidad creada con éxito", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editarEspecialidad = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    try {
        const { data, error } = await supabase
            .from('especialidades')
            .update({ nombre, descripcion })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: "Especialidad no encontrada" });
        }

        res.json({ message: "Especialidad actualizada con éxito", especialidad: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. OCULTAR (BORRADO LÓGICO)
const ocultarEspecialidad = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('especialidades')
            .update({ activo: false })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: "Especialidad no encontrada" });
        }

        res.json({ message: "Especialidad desactivada/ocultada correctamente", especialidad: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerEspecialidades,
    crearEspecialidad,
    editarEspecialidad,
    ocultarEspecialidad
};