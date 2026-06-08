const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Registro de Usuario
const registrar = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const { data: usuarioExistente } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .single();

        if (usuarioExistente) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                { nombre, email, password: hashedPassword, rol }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Usuario registrado con éxito 🎉",
            user: {
                id: data[0].id,
                nombre: data[0].nombre,
                email: data[0].email,
                rol: data[0].rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Inicio de Sesión (Login)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
        }

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            return res.status(404).json({ error: "El usuario no existe o el correo es incorrecto" });
        }

        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: "Login exitoso, ¡bienvenido! 🔓",
            token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Solicitar Recuperación de Contraseña
const solicitarRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "El email es obligatorio" });

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !usuario) {
            return res.status(404).json({ error: "No existe un usuario con este correo" });
        }

        const tokenRecuperacion = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        console.log(`📩 Simulando correo para ${email}: Token generado -> ${tokenRecuperacion}`);

        res.status(200).json({
            message: "Instrucciones generadas. Usa este token para resetear tu contraseña.",
            token: tokenRecuperacion 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Cambiar la contraseña usando el token
const resetearPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { nueva_password } = req.body;

        if (!token || !nueva_password) {
            return res.status(400).json({ error: "Token y nueva_password son obligatorios" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_password, salt);

        const { error } = await supabase
            .from('usuarios')
            .update({ password: hashedPassword })
            .eq('id', decoded.id);

        if (error) throw error;

        res.status(200).json({ message: "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión." });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "El token de recuperación ha expirado." });
        }
        res.status(400).json({ error: "Token inválido o error en el servidor." });
    }
};

// Exportar todas las funciones de forma limpia al final
module.exports = {
    registrar,
    login,
    solicitarRecuperacion,
    resetearPassword
};