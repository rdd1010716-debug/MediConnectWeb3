const supabase = require('../config/supabase');

// Obtener el historial de chat paginado (de 20 en 20)
const obtenerHistorial = async (req, res) => {
    try {
        const { id_cita } = req.params;
        
        // Extraemos 'page' y 'limit' de la URL (por defecto página 1, límite 20)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!id_cita) {
            return res.status(400).json({ error: "El ID de la cita es requerido" });
        }

        // Calculamos el rango de índices para Supabase
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Consultamos con rango y traemos los más recientes primero
        const { data: mensajes, error, count } = await supabase
            .from('mensajes_chat')
            .select('*', { count: 'exact' }) // El count sirve para saber el total real en la BD
            .eq('id_cita', id_cita)
            .order('creado_en', { ascending: false }) // Descendente para traer lo último
            .range(from, to);

        if (error) throw error;

        res.status(200).json({
            pagina_actual: page,
            mensajes_por_pagina: limit,
            total_mensajes_en_bd: count,
            // Volteamos el array al final para que el frontend los dibuje de arriba hacia abajo (cronológico)
            mensajes: mensajes.reverse() 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Subir un archivo multimedia al chat
const subirArchivoMultimedia = async (req, res) => {
    try {
        // Multer dejará el archivo en req.file
        const file = req.file;
        const { id_cita, tipo_content } = req.body; 
        const emisor_id = req.usuario.id; // Extraído del token de seguridad

        if (!file) return res.status(400).json({ error: "No se proporcionó ningún archivo" });
        if (!id_cita) return res.status(400).json({ error: "El ID de la cita es obligatorio" });

        // 1. Generar un nombre único para que no se sobreescriban archivos con el mismo nombre
        const extension = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${emisor_id}.${extension}`;

        // 2. Subir el archivo a Supabase Storage (al bucket 'chat-multimedia')
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chat-multimedia')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) throw uploadError;

        // 3. Obtener la URL pública del archivo recién subido
        const { data: publicUrlData } = supabase.storage
            .from('chat-multimedia')
            .getPublicUrl(fileName);

        const fileUrl = publicUrlData.publicUrl;

        // 4. Guardar el mensaje en la base de datos indicando que es una imagen/video/audio
        const { data: nuevoMensaje, error: dbError } = await supabase
            .from('mensajes_chat')
            .insert([{
                id_cita,
                emisor_id,
                tipo_content: tipo_content || 'image', // Por defecto será imagen
                contenido: fileUrl // Guardamos la URL pública en lugar de texto
            }])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({
            message: "¡Archivo multimedia enviado con éxito! 📸",
            mensaje: nuevoMensaje[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// No olvides exportar ambas funciones
module.exports = { 
    obtenerHistorial,
    subirArchivoMultimedia 
};

