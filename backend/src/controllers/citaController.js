const supabase = require('../config/supabase');

// Agendar una nueva cita médica (Algoritmo inteligente)
const agendarCita = async (req, res) => {
    try {
        const { id_medico, fecha, hora } = req.body;
        const id_paciente = req.usuario.id; // Obtenemos el ID del paciente directamente desde su JWT seguro

        if (!id_medico || !fecha || !hora) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // REGLA 1: Validar si el médico trabaja en ese horario
        const { data: disponibilidad, error: errorDisp } = await supabase
            .from('disponibilidad_medicos')
            .select('*')
            .eq('id_medico', id_medico)
            .eq('fecha', fecha)
            .lte('hora_inicio', hora) // hora_inicio debe ser menor o igual a la hora de la cita
            .gte('hora_fin', hora);   // hora_fin debe ser mayor o igual a la hora de la cita

        if (errorDisp || !disponibilidad || disponibilidad.length === 0) {
            return res.status(400).json({ error: "El médico no tiene disponibilidad configurada para esa fecha u hora." });
        }

        // REGLA 2: Evitar colisiones (Verificar si ya existe una cita agendada para ese médico a esa misma hora)
        const { data: citaExistente, error: errorCita } = await supabase
            .from('citas_medicas')
            .select('*')
            .eq('id_medico', id_medico)
            .eq('fecha', fecha)
            .eq('hora', hora)
            .eq('estado', 'programada') // Solo importa si la cita sigue activa
            .maybeSingle();

        if (citaExistente) {
            return res.status(409).json({ error: "Colisión de horarios detectada. El médico ya tiene una cita reservada en ese bloque." });
        }

        // Si supera las dos reglas de negocio, insertamos la cita de forma segura
        const { data: nuevaCita, error: errorInsert } = await supabase
            .from('citas_medicas')
            .insert([
                { id_paciente, id_medico, fecha, hora, estado: 'programada' }
            ])
            .select();

        if (errorInsert) throw errorInsert;

        res.status(201).json({
            message: "¡Cita médica agendada con éxito! 📅✨",
            cita: nuevaCita[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const cancelarCita = async (req, res) => {
    try {
        const id_cita = req.params.id; // El ID de la cita viaja en la URL
        const usuarioId = req.usuario.id;
        const rol = req.usuario.rol;

        // 1. Buscar la cita en la base de datos
        const { data: cita, error: errorCita } = await supabase
            .from('citas_medicas')
            .select('*')
            .eq('id', id_cita)
            .single();

        if (errorCita || !cita) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }

        // 2. Verificar que el usuario tenga permiso para cancelar ESTA cita
        if (rol === 'paciente' && cita.id_paciente !== usuarioId) {
            return res.status(403).json({ error: "No tienes permiso para cancelar esta cita" });
        }
        if (rol === 'medico' && cita.id_medico !== usuarioId) {
            return res.status(403).json({ error: "No tienes permiso para cancelar esta cita" });
        }

        // 3. Actualizar el estado a 'cancelada'
        const { error: errorUpdate } = await supabase
            .from('citas_medicas')
            .update({ estado: 'cancelada' })
            .eq('id', id_cita);

        if (errorUpdate) throw errorUpdate;

        res.status(200).json({ message: "La cita ha sido cancelada exitosamente 🚫" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerMisCitas = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const rol = req.usuario.rol;

        // Preparamos la consulta base
        let query = supabase.from('citas_medicas').select('*');

        // Filtramos dependiendo de quién esté pidiendo la lista
        if (rol === 'paciente') {
            query = query.eq('id_paciente', usuarioId);
        } else if (rol === 'medico') {
            query = query.eq('id_medico', usuarioId);
        }

        // Ejecutamos la consulta ordenando por fecha de la más cercana a la más lejana
        const { data: citas, error } = await query.order('fecha', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            message: "Listado de citas recuperado con éxito 📅",
            total: citas.length,
            citas: citas
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Recuerda agregarla al export final:
module.exports = {
    agendarCita,
    cancelarCita,
    obtenerMisCitas
};
// Asegúrate de exportarla al final


