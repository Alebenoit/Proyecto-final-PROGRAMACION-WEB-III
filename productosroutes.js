const express = require('express')
const router = express.Router()
const db = require('./conexion')

router.get('/productos', (req, res) => {
    const query = 'SELECT * FROM productos'
    db.query(query, (err, results) => {
        if(err){
            return res.status(500).send('Error en la consulta')
        }

        res.json(results)
    })
})

router.get('/productos/:codigo', (req, res) => {
    const { codigo } = req.params;

    const query =
        'SELECT codigo, nom_producto, pre_publico FROM productos WHERE codigo = ?';

    db.query(query, [codigo], (err, results) => {
        if (err) {
            return res.status(500).send('Error al obtener el producto');
        }

        if (results.length === 0) {
            return res.status(404).json(null);
        }

        res.json(results[0]);
    });
});

router.post('/productos', (req, res) => {
    const { codigo, nom_producto, dase_producto, pre_publico, pre_proveedor, existencias } = req.body

    if(!codigo || !nom_producto || !dase_producto || !pre_publico || !pre_proveedor || !existencias){
        return res.status(400).send('Todos los campos son obligatorios')
    }

    const query = 'INSERT INTO productos (codigo, nom_producto, dase_producto, pre_publico, pre_proveedor, existencias) VALUES (?, ?, ?, ?, ?, ?)'

    db.query(query, [codigo, nom_producto, dase_producto, pre_publico, pre_proveedor, existencias], (err, results) => {
        if(err){
            console.error('Error al agregar el producto: ', err)
            return res.status(500).send('Error al agregar el producto')
        }

        res.status(201).send({
            codigo, nom_producto, dase_producto, pre_publico, pre_proveedor, existencias
        })
    })
})

router.put('/productos/:codigo', (req, res) => {
    const { codigo } = req.params
    const { nom_producto, dase_producto, pre_publico, pre_proveedor, existencias } = req.body

    const query = 'UPDATE productos SET nom_producto = ?, dase_producto = ?, pre_publico = ?, pre_proveedor = ?, existencias = ? WHERE codigo = ?'
    db.query(query, [nom_producto, dase_producto, pre_publico, pre_proveedor, existencias, codigo], (err, results) => {
        if(err){
            return res.status(500).send('Error al actualizar el producto')
        }

        res.send('Producto actualizado')

    })
})

router.delete('/productos/:codigo', (req, res) => {
    const { codigo } = req.params
    
    const query = 'DELETE FROM productos WHERE codigo = ?'
    db.query(query, [codigo], (err, results) => {
        if(err){
            return res.status(500).send('Error al eliminar el producto')
        }
        res.send('Producto eliminado')
    })

})

module.exports = router









