require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const supabase = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');
const citaRoutes = require('./routes/citaRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const chatRoutes = require('./routes/chatRoutes');
const especialidadRoutes = require('./routes/especialidadRoutes');
const historiaRoutes = require('./routes/historiaRoutes');
const recetaRoutes = require('./routes/recetaRoutes');

const {
    verificarToken,
    verificarRol,
    autenticarSocket
} = require('./middlewares/authMiddleware');

const app = express();
const server = http.createServer(app);

// Inicializar Socket.IO ANTES de usarlo
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware de autenticación para WebSockets
io.use(autenticarSocket);

// Conexión WebSocket
io.on('connection', (socket) => {
    console.log(
        `🔌 Usuario conectado por WebSocket seguro: ${socket.id} (ID Usuario: ${socket.usuario.id}, Rol: ${socket.usuario.rol})`
    );

    // Unirse a una sala privada de una cita
    socket.on('join_room', (data) => {
        try {
            const { id_cita } = data;

            if (!id_cita) {
                return socket.emit('error_message', {
                    error: 'ID de cita requerido'
                });
            }

            socket.join(`cita_${id_cita}`);

            console.log(
                `👤 Usuario ${socket.usuario.id} se unió a la sala: cita_${id_cita}`
            );
        } catch (error) {
            console.error('Error en join_room:', error.message);

            socket.emit('error_message', {
                error: 'No se pudo unir a la sala'
            });
        }
    });

    // Enviar mensaje
    socket.on('send_message', async (data) => {
        try {
            const { id_cita, tipo_content, contenido } = data;

            const emisor_id = socket.usuario.id;

            if (!id_cita || !contenido) {
                return socket.emit('error_message', {
                    error: 'Faltan datos obligatorios'
                });
            }

            // Guardar mensaje en Supabase
            const { data: nuevoMensaje, error } = await supabase
                .from('mensajes_chat')
                .insert([
                    {
                        id_cita,
                        emisor_id,
                        tipo_content: tipo_content || 'text',
                        contenido
                    }
                ])
                .select();

            if (error) {
                throw error;
            }

            // Enviar mensaje a todos los miembros de la sala
            io.to(`cita_${id_cita}`).emit(
                'receive_message',
                nuevoMensaje[0]
            );

            console.log(
                `💬 Mensaje enviado en cita_${id_cita} por usuario ${emisor_id}`
            );
        } catch (error) {
            console.error(
                '❌ Error procesando mensaje:',
                error.message
            );

            socket.emit('error_message', {
                error: 'No se pudo procesar tu mensaje'
            });
        }
    });
    // ... (Tu evento send_message se queda igual)

    // Evento: Usuario está escribiendo
    socket.on('typing', (data) => {
        const { id_cita } = data;
        // Emitir a todos en la sala EXCEPTO al que está tecleando
        socket.to(`cita_${id_cita}`).emit('user_typing', { 
            emisor_id: socket.usuario.id,
            mensaje: "escribiendo..."
        });
    });

    // Evento: Usuario dejó de escribir
    socket.on('stop_typing', (data) => {
        const { id_cita } = data;
        socket.to(`cita_${id_cita}`).emit('user_stopped_typing', { 
            emisor_id: socket.usuario.id 
        });
    });

    // Evento: Mensaje visto (Confirmación de lectura)
    socket.on('mark_seen', (data) => {
        const { id_cita, mensaje_id } = data;
        socket.to(`cita_${id_cita}`).emit('message_seen', { 
            mensaje_id, 
            visto_por: socket.usuario.id 
        });
    });

    socket.on('disconnect', () => {
        console.log(
            `❌ Usuario desconectado de WebSocket: ${socket.id}`
        );
    });
});

// Middlewares globales
app.use(cors());
app.use(express.json());

// Exponer io para controllers
app.set('io', io);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/historias', historiaRoutes);
app.use('/api/recetas', recetaRoutes)

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'MediConnect API corriendo con Supabase (PostgreSQL) 🚀'
    });
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
                break;
            }
        }
        if (localIp !== 'localhost') break;
    }
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
    console.log(`📱 Para mobile usa: http://${localIp}:${PORT}`);
    console.log('📡 Conexión con Supabase configurada.');
});