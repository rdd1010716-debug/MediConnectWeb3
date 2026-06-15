require('dotenv').config(); // <-- OBLIGATORIO EN LA LÍNEA 1
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Faltan las variables de entorno de Supabase en el archivo .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;