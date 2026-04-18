// --- Servidor Backend Final (server.js) ---
// --- VERSIÓN CON NUEVA RUTA DE INGRESO DIRECTO ---

// 1. IMPORTACIÓN DE MÓDULOS
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// 2. CONFIGURACIÓN INICIAL DE EXPRESS
const app = express();
const port = 3000;

// 3. CONFIGURACIÓN DE LA BASE DE DATOS
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'db_estacionamiento_utp2'
});

// 4. CONEXIÓN A LA BASE DE DATOS
db.connect(err => {
    if (err) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! ERROR CRÍTICO AL CONECTAR A LA BASE DE DATOS !!!');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('Mensaje de Error:', err.message);
        console.error('Código de Error de MySQL:', err.code);
        console.error('\nPOSIBLES SOLUCIONES:');
        console.error('1. Asegúrate de que tu servidor MySQL (XAMPP, WAMP, etc.) esté en ejecución.');
        console.error('2. Verifica que el `user` y `password` en este archivo sean correctos.');
        console.error('3. Confirma que la base de datos "db_estacionamiento_utp2" exista.');
        process.exit(1);
    }
    console.log('✅ Conexión exitosa a la base de datos MySQL: db_estacionamiento_utp2');
});

// 5. MIDDLEWARES
app.use(cors());
app.use(express.json());

// Middleware para servir imágenes de vehículos (carpeta "modelos de carros")
const path = require('path');
app.use('/modelos-de-carros', express.static(path.join(__dirname, '..', 'modelos de carros')));

// --- INICIO DE RUTAS DE LA API ---


// ==============================================================================
// === NUEVA RUTA PARA REGISTRAR INGRESO DIRECTO (POR PLACA, PROPIETARIO, ETC) ===
// ==============================================================================
app.post('/ingreso-directo', (req, res) => {
    console.log(`\n[${new Date().toLocaleString()}] Petición recibida en POST /ingreso-directo`);
    console.log('Datos recibidos del frontend:', req.body);

    const { placa, propietario, tipo_vehiculo, ubicacion } = req.body;

    if (!placa || !propietario || !tipo_vehiculo || !ubicacion) {
        console.error('Error: Faltan datos en la petición.');
        return res.status(400).json({ error: 'Faltan datos obligatorios: placa, propietario, tipo de vehículo y ubicación son requeridos.' });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }

        const partesNombre = propietario.trim().split(' ');
        const nombre = partesNombre.shift() || '';
        const apellido = partesNombre.join(' ') || '';

        // --- LÓGICA ACTUALIZADA ---
        // Paso A: Buscar el usuario. Si no existe, devolver un error.
        const queryBuscarUsuario = "SELECT id_usuario FROM usuarios WHERE nombre = ? AND apellido = ?";
        db.query(queryBuscarUsuario, [nombre, apellido], (err, results) => {
            if (err) {
                console.error("Error en Paso A (buscar usuario):", err);
                return db.rollback(() => res.status(500).json({ error: 'Error al buscar el usuario.', details: err.message }));
            }

            // Si el resultado está vacío, significa que el usuario NO existe.
            if (results.length === 0) {
                console.error("Error: Intento de registrar ingreso para un usuario no existente:", propietario);
                // Cancelamos la operación y enviamos un error 404 (Not Found)
                return db.rollback(() => {
                    res.status(404).json({ error: `El propietario '${propietario}' no se encuentra registrado. Por favor, regístrelo primero.` });
                });
            }
            
            // Si llegamos aquí, el usuario sí existe. Continuamos con su ID.
            const id_usuario = results[0].id_usuario;
            console.log(`Usuario encontrado con ID: ${id_usuario}`);
            procederConVehiculo(id_usuario);
        });

        // Función para el Paso B: Buscar o crear el vehículo (esta lógica se mantiene)
        const procederConVehiculo = (id_usuario) => {
            const queryBuscarVehiculo = "SELECT id_vehiculo FROM vehiculos WHERE placa = ?";
            db.query(queryBuscarVehiculo, [placa], (err, results) => {
                if (err) {
                    console.error("Error en Paso B (buscar vehículo):", err);
                    return db.rollback(() => res.status(500).json({ error: 'Error al buscar el vehículo.', details: err.message }));
                }

                if (results.length > 0) {
                    const id_vehiculo = results[0].id_vehiculo;
                    console.log(`Vehículo encontrado con ID: ${id_vehiculo}`);
                    procederConEspacio(id_usuario, id_vehiculo);
                } else {
                    const queryCrearVehiculo = "INSERT INTO vehiculos (id_usuario, placa, tipo_vehiculo, activo) VALUES (?, ?, ?, 1)";
                    db.query(queryCrearVehiculo, [id_usuario, placa, tipo_vehiculo], (err, result) => {
                        if (err) {
                            console.error("Error en Paso B (crear vehículo):", err);
                            return db.rollback(() => res.status(500).json({ error: 'Error al crear el nuevo vehículo.', details: err.message }));
                        }
                        const id_vehiculo = result.insertId;
                        console.log(`Vehículo nuevo creado con ID: ${id_vehiculo}`);
                        procederConEspacio(id_usuario, id_vehiculo);
                    });
                }
            });
        };
        
        // Función para el Paso C: Ocupar el espacio y registrar el acceso
        const procederConEspacio = (id_usuario, id_vehiculo) => {
            const queryGetEspacioId = "SELECT id_espacio FROM espacios WHERE ubicacion = ?";
            db.query(queryGetEspacioId, [ubicacion], (err, espacioResult) => {
                if (err || espacioResult.length === 0) {
                    console.error("Error en Paso C (buscar ID de espacio):", err || "Ubicación no encontrada");
                     return db.rollback(() => res.status(404).json({ error: 'La ubicación del espacio proporcionada no existe.', details: err ? err.message : '' }));
                }
                const id_espacio = espacioResult[0].id_espacio;
                console.log(`Espacio encontrado con Ubicación '${ubicacion}' e ID: ${id_espacio}`);

                const queryOcuparEspacio = "UPDATE espacios SET estado = 'ocupado', fecha_hora_ocupacion = NOW() WHERE id_espacio = ? AND estado = 'disponible'";
                db.query(queryOcuparEspacio, [id_espacio], (err, result) => {
                    if (err || result.affectedRows === 0) {
                        console.error("Error en Paso C (ocupar espacio):", err || "El espacio ya no estaba disponible (affectedRows = 0)");
                        return db.rollback(() => res.status(409).json({ error: 'El espacio ya no está disponible. Alguien más lo ocupó.', details: err ? err.message : '' }));
                    }

                    console.log(`Espacio ID ${id_espacio} actualizado a 'ocupado'.`);

                    const queryRegistrarAcceso = "INSERT INTO accesos (id_usuario, id_vehiculo, tipo_acceso, id_espacio, fecha_hora, metodo_identificacion) VALUES (?, ?, 'entrada', ?, NOW(), 'Manual')";
                    
                    db.query(queryRegistrarAcceso, [id_usuario, id_vehiculo, id_espacio], (err, result) => {
                        if (err) {
                            console.error("Error en Paso C (registrar acceso):", err);
                            return db.rollback(() => res.status(500).json({ error: 'Error final al registrar el acceso.', details: err.message }));
                        }

                        db.commit(err => {
                            if (err) {
                                console.error("Error al hacer COMMIT de la transacción:", err);
                                return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la transacción.', details: err.message }));
                            }
                            console.log('✅ ¡Transacción completada! Ingreso registrado exitosamente.');
                            res.status(201).json({ message: 'Ingreso registrado exitosamente.' });
                        });
                    });
                });
            });
        };
    });
});
// ==========================================================
// === RUTA PARA EL DASHBOARD (VEHÍCULOS ESTACIONADOS) ======
// ==========================================================
app.get('/registros-estacionamiento', (req, res) => {
    const query = `
        SELECT
            a.id_acceso, 
            v.placa, 
            v.tipo_vehiculo,
            u.nombre AS nombre_propietario,
            u.apellido AS apellido_propietario, 
            a.tipo_acceso,
            a.fecha_hora AS hora_ingreso, 
            e.estado AS estado_espacio,
            e.ubicacion AS ubicacion_espacio, 
            e.id_espacio
        FROM accesos a
        JOIN vehiculos v ON a.id_vehiculo = v.id_vehiculo
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        JOIN espacios e ON a.id_espacio = e.id_espacio
        WHERE a.tipo_acceso = 'entrada'
        ORDER BY a.fecha_hora DESC;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en GET /registros-estacionamiento:', err);
            res.status(500).json({ error: 'Error interno del servidor', details: err.message });
        } else {
            res.json(results);
        }
    });
});

// ==========================================================
// === RUTAS PARA LA GESTIÓN DE ESPACIOS ====================
// ==========================================================
app.get('/espacios', (req, res) => {
    const query = `SELECT id_espacio, ubicacion, estado, tipo_espacio, fecha_hora_ocupacion FROM espacios ORDER BY ubicacion`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la ruta GET /espacios:', err);
            res.status(500).json({ error: 'Error interno del servidor', details: err.message });
        } else {
            res.json(results);
        }
    });
});

// =================================================================
// === RUTA ACTUALIZADA PARA OBTENER DETALLES DE OCUPANTE/RESERVA ===


app.get('/espacios/:id/ocupante', (req, res) => {
    const idEspacio = req.params.id;

    // 1. Primero, busca si hay un INGRESO ACTIVO en el espacio.
    const queryAcceso = `
        SELECT u.nombre, u.apellido, u.rol, u.codigo_utp AS codigo, v.placa,
               v.tipo_vehiculo, a.fecha_hora AS hora_evento, 'Ocupado' AS tipo_detalle
        FROM accesos a
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        JOIN vehiculos v ON a.id_vehiculo = v.id_vehiculo
        WHERE a.id_espacio = ? AND a.tipo_acceso = 'entrada'
        ORDER BY a.fecha_hora DESC LIMIT 1;`;

    db.query(queryAcceso, [idEspacio], (err, accesoResults) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor', details: err.message });
        // Si encuentra un ingreso, devuelve la información y termina.
        if (accesoResults.length > 0) return res.json(accesoResults[0]);

        // 2. CORRECCIÓN: Si no hay ingreso, busca la ÚLTIMA RESERVA para ese espacio,
        // sin importar si está 'activa' o 'completada'.
        const queryReserva = `
            SELECT u.nombre, u.apellido, u.rol, u.codigo_utp AS codigo, v.placa,
                   v.tipo_vehiculo, r.fecha_hora_reserva AS hora_evento, 'Reservado' AS tipo_detalle
            FROM reservas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
            WHERE r.id_espacio = ?
            ORDER BY r.fecha_hora_reserva DESC LIMIT 1;`;

        db.query(queryReserva, [idEspacio], (err, reservaResults) => {
            if (err) return res.status(500).json({ error: 'Error en el servidor', details: err.message });
            // Si encuentra una reserva, devuelve la información y termina.
            if (reservaResults.length > 0) return res.json(reservaResults[0]);

            // 3. Si no hay ni ingreso ni reserva, busca un PERMISO FIJO.
            const queryPermiso = `
                SELECT u.nombre, u.apellido, u.rol, u.codigo_utp AS codigo, v.placa,
                       v.tipo_vehiculo, p.fecha_inicio AS hora_evento, 'Permiso Fijo' AS tipo_detalle
                FROM permisos p
                JOIN usuarios u ON p.id_usuario = u.id_usuario
                JOIN vehiculos v ON p.id_vehiculo = v.id_vehiculo
                WHERE p.id_espacio = ? AND p.estado_permiso = 'activo' LIMIT 1;`;
            
            db.query(queryPermiso, [idEspacio], (err, permisoResults) => {
                if (err) return res.status(500).json({ error: 'Error en el servidor', details: err.message });
                if (permisoResults.length > 0) return res.json(permisoResults[0]);

                // 4. Si no encuentra nada, ahora sí devuelve un error 404.
                res.status(404).json({ 
                    message: 'No se encontró ningún registro de acceso, reserva o permiso para este espacio.' 
                });
            });
        });
    });
});


// ==========================================================
// === RUTAS PARA INGRESOS Y SALIDAS (ACCESOS) ==============
// ==========================================================
app.post('/accesos', (req, res) => {
    const { id_usuario, id_vehiculo, metodo_identificacion, id_espacio } = req.body;
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: 'Error en el servidor.', details: err.message });
        const espacioQuery = `UPDATE espacios SET estado = 'ocupado', fecha_hora_ocupacion = NOW() WHERE id_espacio = ? AND estado = 'disponible'`;
        db.query(espacioQuery, [id_espacio], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => res.status(400).json({ error: 'No se pudo actualizar el estado del espacio. Probablemente ya está ocupado.' }));
            }
            const accesoQuery = `INSERT INTO accesos (id_usuario, id_vehiculo, tipo_acceso, metodo_identificacion, id_espacio) VALUES (?, ?, 'entrada', ?, ?)`;
            db.query(accesoQuery, [id_usuario, id_vehiculo, metodo_identificacion, id_espacio], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'No se pudo registrar el acceso.', details: err.message }));
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la operación.', details: err.message }));
                    res.status(201).json({ message: 'Ingreso registrado y espacio ocupado exitosamente.' });
                });
            });
        });
    });
});

app.delete('/accesos/:id', (req, res) => {
    const idAcceso = req.params.id;
    db.query('SELECT id_espacio FROM accesos WHERE id_acceso = ?', [idAcceso], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'El registro de acceso no existe.' });
        const idEspacioALiberar = results[0].id_espacio;
        db.beginTransaction(err => {
            if (err) return res.status(500).json({ error: 'Error al iniciar la transacción.', details: err.message });
            db.query('DELETE FROM accesos WHERE id_acceso = ?', [idAcceso], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'No se pudo eliminar el acceso.', details: err.message }));
                const checkPermisoQuery = "SELECT 1 FROM permisos WHERE id_espacio = ? AND estado_permiso = 'activo' LIMIT 1";
                db.query(checkPermisoQuery, [idEspacioALiberar], (err, permisoResults) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Error al verificar permisos.', details: err.message }));
                    if (permisoResults.length > 0) {
                        db.commit(commitErr => {
                            if (commitErr) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la salida.', details: commitErr.message }));
                            res.json({ message: 'Salida de visitante registrada. El espacio permanece ocupado por permiso fijo.' });
                        });
                    } else {
                        const espacioQuery = `UPDATE espacios SET estado = 'disponible', fecha_hora_ocupacion = NULL WHERE id_espacio = ?`;
                        db.query(espacioQuery, [idEspacioALiberar], (err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: 'No se pudo liberar el espacio.', details: err.message }));
                            db.commit(commitErr => {
                                if (commitErr) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la salida.', details: commitErr.message }));
                                res.json({ message: 'Salida registrada y espacio liberado exitosamente.' });
                            });
                        });
                    }
                });
            });
        });
    });
});


// === Resto de tus rutas (Usuarios, Vehículos, Reportes, Login, etc.) sin cambios...
// ==========================================================
// === RUTAS COMPLETAS PARA 'USUARIOS' (CRUD) ===============
// ==========================================================
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios ORDER BY nombre, apellido', (err, results) => {
        if (err) res.status(500).json({ error: 'Error al obtener usuarios.', details: err.message });
        else res.json(results);
    });
});
app.get('/usuarios/:id', (req, res) => {
    db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id], (err, results) => {
        if (err) res.status(500).json({ error: 'Error al obtener usuario.', details: err.message });
        else if (results.length === 0) res.status(404).json({ message: 'Usuario no encontrado' });
        else res.json(results[0]);
    });
});
app.post('/usuarios', (req, res) => {
    const { nombre, apellido, codigo_utp, rol, email, telefono, activo } = req.body;
    const query = 'INSERT INTO usuarios (nombre, apellido, codigo_utp, rol, email, telefono, activo, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
    db.query(query, [nombre, apellido, codigo_utp, rol, email, telefono, activo], (err, result) => {
        if (err) res.status(500).json({ error: 'Error al crear usuario.', details: err.message });
        else res.status(201).json({ message: 'Usuario creado exitosamente', id_usuario: result.insertId });
    });
});
app.put('/usuarios/:id', (req, res) => {
    const { nombre, apellido, codigo_utp, rol, email, telefono, activo } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, apellido = ?, codigo_utp = ?, rol = ?, email = ?, telefono = ?, activo = ? WHERE id_usuario = ?';
    db.query(query, [nombre, apellido, codigo_utp, rol, email, telefono, activo, req.params.id], (err, result) => {
        if (err) res.status(500).json({ error: 'Error al actualizar usuario.', details: err.message });
        else if (result.affectedRows === 0) res.status(404).json({ message: 'Usuario no encontrado' });
        else res.json({ message: 'Usuario actualizado exitosamente' });
    });
});
app.delete('/usuarios/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id], (err, result) => {
        if (err) res.status(500).json({ error: 'Error al eliminar usuario.', details: err.message });
        else if (result.affectedRows === 0) res.status(404).json({ message: 'Usuario no encontrado' });
        else res.json({ message: 'Usuario eliminado exitosamente' });
    });
});

// ==========================================================
// === RUTAS COMPLETAS PARA 'VEHICULOS' (CRUD) - CORREGIDO ===
// ==========================================================

// --- RUTA GET CORREGIDA ---
// Se ha modificado esta ruta para seleccionar explícitamente 'imagen_url'.
app.get('/vehiculos', (req, res) => {
    const query = `
        SELECT 
            id_vehiculo, 
            placa, 
            tipo_vehiculo, 
            marca, 
            modelo, 
            color, 
            id_usuario,
            activo,
            imagen_url 
        FROM vehiculos
        ORDER BY id_vehiculo ASC;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener vehículos:", err);
            res.status(500).json({ error: 'Error al obtener vehículos.', details: err.message });
        } else {
            res.json(results);
        }
    });
});

// --- TUS OTRAS RUTAS (POST, PUT, DELETE) ESTÁN BIEN Y SE MANTIENEN IGUAL ---
app.post('/vehiculos', (req, res) => {
    const { id_usuario, placa, tipo_vehiculo, marca, modelo, color, activo } = req.body;
    const query = 'INSERT INTO vehiculos (id_usuario, placa, tipo_vehiculo, marca, modelo, color, activo) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [id_usuario, placa, tipo_vehiculo, marca, modelo, color, activo], (err, result) => {
        if (err) res.status(500).json({ error: 'Error al crear vehículo.', details: err.message });
        else res.status(201).json({ message: 'Vehículo creado exitosamente', id_vehiculo: result.insertId });
    });
});

app.put('/vehiculos/:id', (req, res) => {
    const { id_usuario, placa, tipo_vehiculo, marca, modelo, color, activo } = req.body;
    const query = 'UPDATE vehiculos SET id_usuario = ?, placa = ?, tipo_vehiculo = ?, marca = ?, modelo = ?, color = ?, activo = ? WHERE id_vehiculo = ?';
    db.query(query, [id_usuario, placa, tipo_vehiculo, marca, modelo, color, activo, req.params.id], (err, result) => {
        if (err) res.status(500).json({ error: 'Error al actualizar vehículo.', details: err.message });
        else if (result.affectedRows === 0) res.status(404).json({ message: 'Vehículo no encontrado' });
        else res.json({ message: 'Vehículo actualizado exitosamente' });
    });
});

app.delete('/vehiculos/:id', (req, res) => {
    db.query('DELETE FROM vehiculos WHERE id_vehiculo = ?', [req.params.id], (err, result) => {
        if (err) res.status(500).json({ error: 'Error al eliminar vehículo.', details: err.message });
        else if (result.affectedRows === 0) res.status(404).json({ message: 'Vehículo no encontrado' });
        else res.json({ message: 'Vehículo eliminado exitosamente' });
    });
});

// ==========================================================
// === RUTAS PARA REPORTES ==================================
// ==========================================================
app.get('/reportes/ocupacion-zonas', (req, res) => {
    const query = `
        SELECT
            SUBSTRING_INDEX(ubicacion, '-', 1) AS zona,
            COUNT(*) AS total_espacios,
            SUM(CASE WHEN estado = 'ocupado' THEN 1 ELSE 0 END) AS espacios_ocupados
        FROM espacios
        WHERE ubicacion LIKE 'A-%' OR ubicacion LIKE 'B-%' OR ubicacion LIKE 'AM-%' OR ubicacion LIKE 'BM-%' OR ubicacion LIKE 'AD-%' OR ubicacion LIKE 'BD-%'
        GROUP BY zona;
    `;
    db.query(query, (err, results) => {
        if (err) res.status(500).json({ error: 'Error al generar reporte de zonas', details: err.message });
        else res.json(results);
    });
});

app.get('/reportes/horas-pico', (req, res) => {
    const query = `
        SELECT HOUR(fecha_hora) AS hora, COUNT(*) AS cantidad_ingresos
        FROM accesos WHERE tipo_acceso = 'entrada' GROUP BY hora ORDER BY hora ASC;
    `;
     db.query(query, (err, results) => {
        if (err) res.status(500).json({ error: 'Error al generar reporte de horas pico', details: err.message });
        else res.json(results);
    });
});

app.get('/reportes/historial-placa/:placa', (req, res) => {
    const placa = req.params.placa;
    const query = `
        SELECT a.fecha_hora, e.ubicacion, u.nombre, u.apellido
        FROM accesos a
        JOIN vehiculos v ON a.id_vehiculo = v.id_vehiculo
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        JOIN espacios e ON a.id_espacio = e.id_espacio
        WHERE v.placa = ? ORDER BY a.fecha_hora DESC LIMIT 100;
    `;
    db.query(query, [placa], (err, results) => {
        if (err) res.status(500).json({ error: 'Error al generar historial por placa', details: err.message });
        else res.json(results);
    });
});

app.get('/reportes/uso-por-rol', (req, res) => {
    const query = `
        SELECT u.rol, COUNT(a.id_acceso) AS total_accesos
        FROM accesos a JOIN usuarios u ON a.id_usuario = u.id_usuario
        GROUP BY u.rol ORDER BY total_accesos DESC;
    `;
    db.query(query, (err, results) => {
        if (err) res.status(500).json({ error: 'Error al generar reporte por rol', details: err.message });
        else res.json(results);
    });
});

// ==========================================================
// === RUTA DE LOGIN (CON OPERADOR FIJO) ====================
// ==========================================================
app.post('/login', (req, res) => {
    const { codigo, clave, rol } = req.body;

    if (!codigo || !clave || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // --- LÓGICA PARA EL USUARIO OPERADOR FIJO (NO USA LA BD) ---
    if (codigo.toLowerCase() === 'operador') {
        if (rol.toLowerCase() !== 'operador') {
            return res.status(401).json({ error: 'Para el usuario "operador", el rol seleccionado debe ser "Operador".' });
        }
        if (clave !== '654321') { // <--- Contraseña del operador
            return res.status(401).json({ error: 'Contraseña incorrecta para el usuario "operador".' });
        }
        console.log('✅ Acceso concedido para el Operador fijo.');
        return res.status(200).json({
            message: 'Login exitoso como Operador',
            usuario: {
                id_usuario: -1,
                codigo: 'OPERADOR',
                nombre: 'Operador de Garita',
                rol: 'operador'
            }
        });
    }

    // --- LÓGICA PARA EL USUARIO ADMIN FIJO (NO USA LA BD) ---
    if (codigo.toLowerCase() === 'admin') {
        if (rol.toLowerCase() !== 'admin' && rol.toLowerCase() !== 'administrador' && rol.toLowerCase() !== 'administrativo') {
             return res.status(401).json({ error: 'Para el usuario "admin", el rol seleccionado debe ser "Administrador".' });
        }
        if (clave !== '123456') {
            return res.status(401).json({ error: 'Contraseña incorrecta para el usuario "admin".' });
        }
        return res.status(200).json({
            message: 'Login exitoso como Superadministrador',
            usuario: { id_usuario: 0, codigo: 'ADMIN', nombre: 'Super', rol: 'admin' }
        });
    }

    // --- LÓGICA PARA USUARIOS DE LA BASE DE DATOS ---
    const query = 'SELECT * FROM usuarios WHERE UPPER(codigo_utp) = ?';
    db.query(query, [codigo.toUpperCase()], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error interno del servidor.' });
        if (results.length === 0) return res.status(401).json({ error: 'El código de usuario no existe.' });

        const usuario = results[0];
        const rolFromDB = usuario.rol.toLowerCase();
        const rolFromForm = rol.toLowerCase();

        const rolesValidos = {
            'estudiante': 'estudiante',
            'docente': 'docente',
            'administrativo': 'administrativo',
            'visitante': 'visitante'
        };

        if (rolesValidos[rolFromDB] !== rolFromForm) {
            return res.status(401).json({ error: `El rol seleccionado no corresponde a este usuario.` });
        }
        
        if (usuario.dni !== clave) {
            return res.status(401).json({ error: 'La contraseña (DNI) es incorrecta.' });
        }

        res.status(200).json({
            message: 'Login exitoso',
            usuario: {
                id_usuario: usuario.id_usuario,
                codigo: usuario.codigo_utp,
                nombre: usuario.nombre,
                rol: rolFromForm
            }
        });
    });
});


// ==========================================================
// === RUTA PARA RESERVAR UN ESPACIO (MEJORADA) =============
// ==========================================================
app.post('/espacios/reservar', (req, res) => {
    const { id_espacio, id_usuario, id_vehiculo } = req.body;

    if (!id_espacio || !id_usuario || !id_vehiculo) {
        return res.status(400).json({ error: 'Faltan datos para realizar la reserva (espacio, usuario y vehículo).' });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: 'Error al iniciar la transacción.' });

        const espacioQuery = "UPDATE espacios SET estado = 'reservado', fecha_hora_ocupacion = NOW() WHERE id_espacio = ? AND estado = 'disponible'";
        db.query(espacioQuery, [id_espacio], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ error: 'Error al actualizar el espacio.' }));
            if (result.affectedRows === 0) return db.rollback(() => res.status(409).json({ error: 'Lo sentimos, este espacio ya no está disponible.' }));

            const reservaQuery = "INSERT INTO reservas (id_usuario, id_vehiculo, id_espacio, fecha_hora_reserva, estado_reserva) VALUES (?, ?, ?, NOW(), 'activa')";
            db.query(reservaQuery, [id_usuario, id_vehiculo, id_espacio], (err, result) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'No se pudo crear el registro de la reserva.' }));

                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la reserva.' }));
                    res.status(201).json({ message: '¡Espacio reservado con éxito!' });
                });
            });
        });
    });
});


// ==========================================================
// === NUEVAS RUTAS PARA LA PÁGINA DEL OPERADOR =============
// ==========================================================

// ==========================================================
// === RUTA MEJORADA Y SIMPLIFICADA PARA BÚSQUEDA DEL OPERADOR
// ==========================================================
// Este código reemplaza la versión anterior. Es más seguro y elimina
// funciones complejas que podrían fallar en algunas versiones de MySQL.
app.get('/reservas/activas/:busqueda', (req, res) => {
    // Agregamos una guarda para evitar errores si el término de búsqueda está vacío
    const searchTerm = req.params.busqueda || '';
    const busqueda = `%${searchTerm.toLowerCase()}%`;

    const query = `
        -- Parte 1: Obtener vehículos con RESERVA ACTIVA
        SELECT
            r.id_reserva,
            NULL as id_acceso,
            u.nombre,
            u.apellido,
            v.placa,
            e.ubicacion,
            r.fecha_hora_reserva,
            'reservado' as estado
        FROM reservas r
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
        JOIN espacios e ON r.id_espacio = e.id_espacio
        WHERE r.estado_reserva = 'activa'
        AND (
            LOWER(v.placa) LIKE ? 
            OR LOWER(u.nombre) LIKE ? 
            OR LOWER(u.apellido) LIKE ? 
            OR LOWER(u.codigo_utp) LIKE ?
        )

        UNION

        -- Parte 2: Obtener vehículos con un espacio OCUPADO
        SELECT
            NULL as id_reserva,
            a.id_acceso,
            u.nombre,
            u.apellido,
            v.placa,
            e.ubicacion,
            a.fecha_hora as fecha_hora_reserva,
            'ocupado' as estado
        FROM accesos a
        JOIN espacios e ON a.id_espacio = e.id_espacio
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        JOIN vehiculos v ON a.id_vehiculo = v.id_vehiculo
        WHERE
            e.estado = 'ocupado'
            AND a.id_acceso = (
                SELECT MAX(id_acceso)
                FROM accesos
                WHERE id_espacio = e.id_espacio AND tipo_acceso = 'entrada'
            )
            AND (
                LOWER(v.placa) LIKE ?
                OR LOWER(u.nombre) LIKE ?
                OR LOWER(u.apellido) LIKE ?
                OR LOWER(u.codigo_utp) LIKE ?
            );
    `;

    // Se necesitan 8 parámetros (4 para la primera parte del UNION, 4 para la segunda)
    const queryParams = [
        busqueda, busqueda, busqueda, busqueda,
        busqueda, busqueda, busqueda, busqueda
    ];

    db.query(query, queryParams, (err, results) => {
        if (err) {
            // Este log es CLAVE para ver el error real en la terminal del servidor
            console.error('Error detallado de MySQL:', err);
            return res.status(500).json({ error: 'Error en la base de datos al realizar la búsqueda.', details: err.message });
        }
        res.json(results);
    });
});




// ==========================================================
// === RUTA PARA CONFIRMAR EL INGRESO DE UNA RESERVA ========
// ==========================================================
// El frontend debe llamar a esta ruta con el 'id_reserva'
app.post('/reservas/confirmar-ingreso', (req, res) => {
    const { id_reserva } = req.body;
    if (!id_reserva) {
        return res.status(400).json({ error: 'Se requiere el ID de la reserva.' });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error("Error al iniciar transacción:", err);
            return res.status(500).json({ error: 'Error al iniciar la transacción.' });
        }

        const getReservaQuery = "SELECT * FROM reservas WHERE id_reserva = ? AND estado_reserva = 'activa'";
        
        db.query(getReservaQuery, [id_reserva], (err, results) => {
            if (err || results.length === 0) {
                return db.rollback(() => res.status(404).json({ error: 'Reserva no encontrada o ya no está activa.' }));
            }
            
            const reserva = results[0];

            // 1. Actualizar el estado del ESPACIO a 'ocupado'
            const updateEspacioQuery = "UPDATE espacios SET estado = 'ocupado' WHERE id_espacio = ?";
            db.query(updateEspacioQuery, [reserva.id_espacio], (err, result) => {
                if (err) {
                    return db.rollback(() => res.status(500).json({ error: 'Error al ocupar el espacio físico.' }));
                }

                // 2. Actualizar el estado de la RESERVA a 'completada'
                const updateReservaQuery = "UPDATE reservas SET estado_reserva = 'completada' WHERE id_reserva = ?";
                db.query(updateReservaQuery, [id_reserva], (err, result) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: 'Error al actualizar la reserva.' }));
                    }

                    // 3. Crear el nuevo registro en la tabla 'accesos'
                    const accesoQuery = "INSERT INTO accesos (id_usuario, id_vehiculo, tipo_acceso, id_espacio, fecha_hora, metodo_identificacion) VALUES (?, ?, 'entrada', ?, NOW(), 'Reserva Verificada')";
                    db.query(accesoQuery, [reserva.id_usuario, reserva.id_vehiculo, reserva.id_espacio], (err, result) => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ 
                                error: 'Error al registrar el acceso del vehículo.',
                                details: err.sqlMessage 
                            }));
                        }

                        // 4. Confirmar transacción
                        db.commit(err => {
                            if (err) {
                                return db.rollback(() => res.status(500).json({ error: 'Error al confirmar el ingreso.' }));
                            }
                            res.status(200).json({ message: 'Ingreso confirmado y registrado exitosamente.' });
                        });
                    });
                });
            });
        });
    });
});


// ==========================================================
// === RUTA PARA LIBERAR UN ESPACIO OCUPADO (REGISTRAR SALIDA)
// ==========================================================
// El frontend debe llamar a esta ruta con el 'id_acceso'
app.delete('/accesos/:id', (req, res) => {
    const idAcceso = req.params.id;

    db.query('SELECT id_espacio FROM accesos WHERE id_acceso = ?', [idAcceso], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'El registro de acceso no existe.' });
        }
        
        const idEspacioALiberar = results[0].id_espacio;
        
        db.beginTransaction(err => {
            if (err) return res.status(500).json({ error: 'Error al iniciar la transacción.', details: err.message });
            
            // 1. Elimina el registro de 'entrada' de la tabla de accesos.
            db.query('DELETE FROM accesos WHERE id_acceso = ?', [idAcceso], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'No se pudo eliminar el acceso.', details: err.message }));
                
                // 2. Comprueba si el espacio tiene un permiso fijo antes de liberarlo.
                const checkPermisoQuery = "SELECT 1 FROM permisos WHERE id_espacio = ? AND estado_permiso = 'activo' LIMIT 1";
                db.query(checkPermisoQuery, [idEspacioALiberar], (err, permisoResults) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Error al verificar permisos.', details: err.message }));
                    
                    if (permisoResults.length > 0) {
                        // Si hay permiso, el espacio sigue ocupado.
                        db.commit(commitErr => {
                            if (commitErr) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la salida.', details: commitErr.message }));
                            res.json({ message: 'Salida de visitante registrada. El espacio permanece ocupado por permiso fijo.' });
                        });
                    } else {
                        // 3. Si no hay permiso, libera el espacio.
                        const espacioQuery = `UPDATE espacios SET estado = 'disponible', fecha_hora_ocupacion = NULL WHERE id_espacio = ?`;
                        db.query(espacioQuery, [idEspacioALiberar], (err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: 'No se pudo liberar el espacio.', details: err.message }));
                            
                            db.commit(commitErr => {
                                if (commitErr) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la salida.', details: commitErr.message }));
                                res.json({ message: 'Salida registrada y espacio liberado exitosamente.' });
                            });
                        });
                    }
                });
            });
        });
    });
});

// ==========================================================
// === RUTA PARA BUSCAR USUARIO POR PLACA (CONFIGURACIÓN) ===
// ==========================================================
app.get('/usuarios/buscar/:termino', (req, res) => {
    const termino = `%${req.params.termino}%`;

    // --- CONSULTA CORREGIDA USANDO UNION ---
    // Este método es más robusto y evita problemas con GROUP BY.
    // Primero busca por detalles del usuario, luego por placa, y une los resultados.
    const query = `
        (SELECT
            u.id_usuario, u.nombre, u.apellido, u.rol, u.codigo_utp,
            v.placa, v.marca, v.modelo
        FROM usuarios u
        LEFT JOIN vehiculos v ON u.id_usuario = v.id_usuario
        WHERE u.nombre LIKE ? OR u.apellido LIKE ? OR u.codigo_utp LIKE ?)
        
        UNION
        
        (SELECT
            u.id_usuario, u.nombre, u.apellido, u.rol, u.codigo_utp,
            v.placa, v.marca, v.modelo
        FROM usuarios u
        JOIN vehiculos v ON u.id_usuario = v.id_usuario
        WHERE v.placa LIKE ?);
    `;

    // Pasamos el 'termino' para cada '?' en la consulta.
    // 3 veces para la primera parte, 1 vez para la segunda.
    db.query(query, [termino, termino, termino, termino], (err, results) => {
        if (err) {
            console.error("Error en la búsqueda de usuarios:", err);
            // IMPORTANTE: Devolver un error en formato JSON
            return res.status(500).json({ 
                error: 'Error en la base de datos al buscar usuarios.', 
                details: err.message 
            });
        }
        // Devolver los resultados en formato JSON
        res.json(results);
    });
});

// ==========================================================
// === NUEVA RUTA PARA REGISTRO COMPLETO ====================
// ==========================================================
app.post('/registro-completo', (req, res) => {
    console.log('Recibida petición en /registro-completo');
    
    // Recibimos todos los datos del formulario
    const {
        nombre, apellido, codigo_utp, dni, rol, email, telefono, // Datos del Usuario
        placa, tipo_vehiculo, marca, modelo, color // Datos del Vehículo
    } = req.body;

    // Validación básica de que los datos esenciales llegaron
    if (!nombre || !codigo_utp || !dni || !rol || !placa) {
        return res.status(400).json({ error: 'Faltan datos esenciales para el registro.' });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: 'Error al iniciar la transacción.' });

        // Paso 1: Insertar en la tabla 'usuarios'
        const usuarioQuery = `
            INSERT INTO usuarios (nombre, apellido, codigo_utp, dni, rol, email, telefono, activo, fecha_registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
        `;
        const usuarioDatos = [nombre, apellido, codigo_utp, dni, rol, email, telefono];

        db.query(usuarioQuery, usuarioDatos, (err, usuarioResult) => {
            if (err) {
                console.error("Error al insertar usuario:", err);
                // Si el error es por un duplicado, enviamos un mensaje amigable
                if (err.code === 'ER_DUP_ENTRY') {
                    return db.rollback(() => res.status(409).json({ error: 'El código UTP o DNI ya se encuentra registrado.' }));
                }
                return db.rollback(() => res.status(500).json({ error: 'No se pudo registrar al usuario.' }));
            }

            const nuevoUsuarioId = usuarioResult.insertId;
            console.log(`Usuario creado con ID: ${nuevoUsuarioId}`);

            // Paso 2: Insertar en la tabla 'vehiculos' usando el ID del nuevo usuario
            const vehiculoQuery = `
                INSERT INTO vehiculos (id_usuario, placa, tipo_vehiculo, marca, modelo, color, activo)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            `;
            const vehiculoDatos = [nuevoUsuarioId, placa, tipo_vehiculo, marca, modelo, color];
            
            db.query(vehiculoQuery, vehiculoDatos, (err, vehiculoResult) => {
                if (err) {
                    console.error("Error al insertar vehículo:", err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return db.rollback(() => res.status(409).json({ error: 'La placa del vehículo ya se encuentra registrada.' }));
                    }
                    return db.rollback(() => res.status(500).json({ error: 'No se pudo registrar el vehículo.' }));
                }
                
                console.log(`Vehículo creado con ID: ${vehiculoResult.insertId}`);

                // Paso 3: Si todo fue exitoso, confirmar la transacción
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: 'Error al confirmar el registro.' }));
                    }
                    res.status(201).json({ message: 'Usuario y vehículo registrados exitosamente.' });
                });
            });
        });
    });
});

// ==========================================================
// === NUEVA RUTA PARA REPORTE GRÁFICO DE ZONA (HISTORIAL) ===
// ==========================================================
// Pega este bloque completo en tu archivo server.js

app.get('/reportes/ocupacion-diaria/:zona', (req, res) => {
    // El prefijo de la zona, por ej. 'A' se convierte en 'A-%' para la consulta
    const zonaPrefix = `${req.params.zona}-%`; 

    // Consulta para obtener el recuento de ingresos por día para la zona específica
    // en los últimos 30 días.
    const query = `
        SELECT
            DATE(a.fecha_hora) AS dia,
            COUNT(a.id_acceso) AS cantidad_ingresos
        FROM accesos a
        JOIN espacios e ON a.id_espacio = e.id_espacio
        WHERE
            e.ubicacion LIKE ?
            AND a.tipo_acceso = 'entrada'
            AND a.fecha_hora >= CURDATE() - INTERVAL 30 DAY
        GROUP BY
            dia
        ORDER BY
            dia ASC;
    `;

    db.query(query, [zonaPrefix], (err, results) => {
        if (err) {
            console.error('Error al generar reporte de ocupación diaria:', err);
            return res.status(500).json({ error: 'Error al generar reporte de ocupación diaria', details: err.message });
        }
        res.json(results);
    });
});


// --- INICIAR EL SERVIDOR ---
app.listen(port, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${port}`);
});

// --- RUTA DE SALUD (para Docker healthcheck) ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
