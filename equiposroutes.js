const express = require('express');
const router = express.Router();
const db = require('./conexion');

router.get('/equipos', (req, res) => {
    db.query('SELECT * FROM equipos', (err, results) => {
        if(err){
            console.error('Error en GET /equipos:', err);
            return res.status(500).send('Error en la consulta');
        }
        res.json(results);
    });
});

router.post('/equipos/asignar', (req, res) => {
    const { num_serie, usuario } = req.body; 
    const responsable = usuario && usuario.trim() !== '' ? usuario : null;

    const query = 'UPDATE equipos SET responsable = ? WHERE num_serie = ?';
    db.query(query, [responsable, num_serie], (err, results) => {
        if(err){
            console.error('Error al asignar usuario:', err);
            return res.status(500).send('Error en la consulta');
        }
        res.status(200).send('Usuario asignado exitosamente');
    });
});

router.post('/equipos/reporte', (req, res) => {
    const { num_serie, falla } = req.body;
    if(!num_serie || !falla) return res.status(400).send('Datos incompletos');

    const fechaFormateada = new Date().toISOString().slice(0, 10);
    
    db.beginTransaction((err) => {
        if(err) return res.status(500).send('Error de inicio de transaccion');

        db.query('UPDATE equipos SET estado = "mantenimiento" WHERE num_serie = ?', [num_serie], (err) => {
            if(err) return db.rollback(() => res.status(500).send('Error al actualizar estado'));

            const id_historial = `REP-${Date.now()}`;
            
            const insertQuery = 'INSERT INTO historial_mantenimiento (id_historial, num_serie, fecha_reporte, falla) VALUES (?, ?, ?, ?)';
            
            db.query(insertQuery, [id_historial, num_serie, fechaFormateada, falla], (err) => {
                if(err) {
                    console.error("Error SQL:", err);
                    return db.rollback(() => res.status(500).send('Error al insertar historial'));
                }
                
                db.commit((err) => {
                    if(err) return db.rollback(() => res.status(500).send('Error al confirmar'));
                    res.status(200).send('Reporte registrado con éxito');
                });
            });
        });    
    });
});


router.get('/equipos/mantenimientos', (req, res) => {
    const query = 'SELECT * FROM historial_mantenimiento WHERE fecha_solucion IS NULL ORDER BY fecha_reporte ASC';
    db.query(query, (err, results) => {
        if(err) return res.status(500).send('Error en la consulta');
        res.json(results);
    });
});

router.post('/equipos/mantenimientos/update', (req, res) => {
    const { num_serie, id_historial, tecnico, solucion } = req.body;
    const fechaHoy = new Date().toISOString().slice(0, 10);
    
    db.beginTransaction((err) => {
        if(err) return res.status(500).send('Error');

        db.query('UPDATE equipos SET estado = "activo" WHERE num_serie = ?', [num_serie], (err) => {
            if(err) return db.rollback(() => res.status(500).send('Error al actualizar estado del equipo'));

            // CORREGIDO: Se agregó la 's' a historial_mantenimientos
            const queryUpd = 'UPDATE historial_mantenimiento SET fecha_solucion = ?, usuario_tecnico = ?, solucion = ? WHERE id_historial = ?';
            
            db.query(queryUpd, [fechaHoy, tecnico, solucion, id_historial], (err) => {
                if(err) {
                    console.error("Error SQL:", err);
                    return db.rollback(() => res.status(500).send('Error al actualizar historial'));
                }
                
                db.commit((err) => {
                    if(err) return db.rollback(() => res.status(500).send('Error al confirmar'));
                    res.status(200).send('Mantenimiento finalizado con éxito');
                });
            });
        });
    });
});

router.post('/equipos/mantenimientos/search', (req, res) => {
    
    const { filter } = req.body; 

    if(!filter){
        return res.status(400).send('Filtro requerido');
    }

    const query = `
        SELECT * FROM historial_mantenimiento 
        WHERE (id_historial LIKE ? OR num_serie LIKE ? OR usuario_tecnico LIKE ?)
        AND solucion IS NOT NULL
    `;
    
    const busqueda = `%${filter}%`;

    db.query(query, [busqueda, busqueda, busqueda], (err, results) => {
        if(err){
            console.error('Error en búsqueda:', err);
            return res.status(500).send('Error en la consulta');
        }
        res.json(results);
    });
});




router.post('/equipos', (req, res) => {
    const { num_serie, equipo, responsable, area, estado } = req.body;

    // Validación estricta en el servidor
    if (!num_serie || !num_serie.trim() || !equipo || !equipo.trim()) {
        return res.status(400).send('El Número de Serie y el Nombre del Equipo son obligatorios');
    }

    const respValue = responsable && responsable.trim() !== '' ? responsable : null;
    const areaValue = area && area.trim() !== '' ? area : null;
    const estadoValue = estado || 'Activo';

    const insertQuery = 'INSERT INTO equipos (num_serie, equipo, responsable, area, estado) VALUES (?, ?, ?, ?, ?)';
    
    db.query(insertQuery, [num_serie.trim(), equipo.trim(), respValue, areaValue, estadoValue], (err, results) => {
        if (err) {
            console.error('Error en POST /equipos:', err);

            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('El Número de Serie ya se encuentra registrado');
            }
            return res.status(500).send('Error al intentar guardar el equipo en la base de datos');
        }
        res.status(201).send('Equipo registrado exitosamente');
    });
});

module.exports = router;






