const supabase = require('../config/supabase');

const subirReceta = async (req, res) => {
    try {
        const { id_historia } = req.body;
        const file = req.file;

        if (!file || !id_historia) return res.status(400).json({ error: "Faltan datos" });

        // Subir a bucket 'recetas-digitales' (créalo en Supabase Storage)
        const fileName = `${Date.now()}_receta_${id_historia}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('recetas-digitales')
            .upload(fileName, file.buffer, { contentType: 'application/pdf' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('recetas-digitales').getPublicUrl(fileName);

        // Guardar en tabla 'recetas'
        const { data, error } = await supabase
            .from('recetas')
            .insert([{ id_historia, archivo_url: urlData.publicUrl }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: "Receta subida", data: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { subirReceta };