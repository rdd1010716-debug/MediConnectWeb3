const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario está logueado (Token válido)
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrae el token del "Bearer TOKEN"

    if (!token) {
        return res.status(403).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Guarda los datos del usuario (id y rol) en la petición
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

// Middleware para controlar el acceso según el Rol (RBAC)
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: "No tienes permisos (rol) para realizar esta acción." });
        }
        next();
    };
};

// Middleware de seguridad exclusivo para Socket.io (Sprint 3)
const autenticarSocket = (socket, next) => {
    // Socket.io recibe las credenciales en la propiedad 'auth' durante el handshake
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Acceso denegado. Token no proporcionado."));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.usuario = decoded; // Guardamos los datos del usuario dentro del socket activo
        next();
    } catch (error) {
        return next(new Error("Token inválido o expirado."));
    }
};

module.exports = { verificarToken, verificarRol, autenticarSocket };