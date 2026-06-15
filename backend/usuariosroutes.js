const express = require('express');
const router = express.Router();
const db = require('./conexion');
const bcrypt = require('bcrypt');

router.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).send('Campos requeridos');
    }

    db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (err, results) => {
        if (err) return res.status(500).send('Error en la consulta');
        if (results.length === 0) return res.status(401).send('Usuario no encontrado');

        const user = results[0];

        const coincide = await bcrypt.compare(contraseña, user.contraseña);

        if (!coincide) {
            return res.status(401).send('Contraseña incorrecta');
        }

        res.status(200).send({
            usuario: {
                usuario: user.usuario,
                nombre: user.nombre,
                area: user.area,
                estado: user.estado
            }
        });
    });
});
router.get('/usuarios', (req, res) => {
    const query = 'SELECT usuario, nombre, area, correo, estado FROM usuarios';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en la consulta');
        }
        res.json(results);
    });
});

router.post('/usuarios', async (req, res) => {
    const { usuario, contraseña, nombre, area, correo, estado } = req.body;

    if (!usuario || !contraseña || !nombre || !area || !correo) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(contraseña, saltRounds);

        const query = 'INSERT INTO usuarios (usuario, contraseña, nombre, area, correo, estado) VALUES (?, ?, ?, ?, ?, ?)';

        db.query(query, [usuario, passwordHash, nombre, area, correo, estado || 'activo'], (err) => {
            if (err) return res.status(500).send('Error al agregar');
            res.status(200).send('Usuario creado');
        });

    } catch (error) {
        res.status(500).send('Error al encriptar contraseña');
    }
});
router.put('/usuarios/:usuario', async (req, res) => {
    const { usuario } = req.params;
    const { nombre, contraseña, area, correo, estado } = req.body;

    try {
        let passwordHash = contraseña;

        if (contraseña) {
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(contraseña, saltRounds);
        }

        const query = `
            UPDATE usuarios 
            SET nombre = ?, contraseña = ?, area = ?, correo = ?, estado = ?
            WHERE usuario = ?
        `;

        db.query(query, [nombre, passwordHash, area, correo, estado, usuario], (err) => {
            if (err) return res.status(500).send('Error al actualizar');
            res.send('Usuario actualizado');
        });

    } catch (error) {
        res.status(500).send('Error al actualizar contraseña');
    }
});

router.delete('/usuarios/:usuario', (req, res) => {
    const { usuario } = req.params;
    db.query('DELETE FROM usuarios WHERE usuario = ?', [usuario], (err) => {
        if (err) return res.status(500).send('Error al eliminar');
        res.send('Usuario eliminado');
    });
});

module.exports = router;










