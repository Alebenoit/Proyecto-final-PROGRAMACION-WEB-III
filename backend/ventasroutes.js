const express = require('express');
const router = express.Router();
const db = require('./conexion');

router.get('/productos/:codigo', (req, res) => {
    const { codigo } = req.params;

    const query = `
        SELECT codigo, nom_producto, pre_publico, existencias 
        FROM productos 
        WHERE codigo = ? OR nom_producto LIKE ? 
        LIMIT 1
    `;

    db.query(query, [codigo, `%${codigo}%`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al buscar el producto');
        }
        
        if (results.length === 0) {
            return res.json([]); 
        }
        
        res.json(results[0]); 
    });
});

router.get('/ventas', (req, res) => {
    const { inicio, fin } = req.query;
    
    if (!inicio || !fin) {
        return res.status(400).send('Las fechas son obligatorias');
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        return res.status(400).send('Fechas proporcionadas no válidas');
    }

    if (fechaInicio > fechaFin) {
        return res.status(400).send('La fecha de inicio debe ser menor a la fecha de fin');
    }

    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    const fechaFinStr = fechaFin.toISOString().split('T')[0];
    
    const query = 'SELECT * FROM ventas WHERE fecha_venta BETWEEN ? AND ?';
    
    db.query(query, [fechaInicioStr, fechaFinStr], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener las ventas');
        }
        res.json(results);
    });
});

router.post('/ventas', (req, res) => {
    const { venta } = req.body;
    
    if (!venta) {
        return res.status(400).send('No se ha recibido la venta');
    }

    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    const id_venta = Date.now().toString();
    const fecha_venta = `${anio}-${mes}-${dia}`;

    const bloquesVenta = venta.split('_'); 
    
    const productos = bloquesVenta[0]; 
    const total_venta = parseFloat(bloquesVenta[1]);
    const vendedor = bloquesVenta[2];

    if (isNaN(total_venta)) {
        return res.status(400).send('Total de venta no es válido');
    }

    const query = 'INSERT INTO ventas (id_venta, productos, total_venta, fecha_venta, seller_vendedor) VALUES (?, ?, ?, ?, ?)';

    const queryReal = 'INSERT INTO ventas (id_venta, productos, total_venta, fecha_venta, vendedor) VALUES (?, ?, ?, ?, ?)';
    
    db.query(queryReal, [id_venta, productos, total_venta, fecha_venta, vendedor], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al registrar la venta');
        }
        res.status(201).json({
            mensaje: 'Venta registrada exitosamente',
            id_venta
        });
    });
});

module.exports = router;









