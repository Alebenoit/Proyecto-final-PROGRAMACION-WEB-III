const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const usuariosRoutes = require('./usuariosroutes')
const areasRoutes = require('./areasroutes')
const equiposRoutes = require('./equiposroutes')
const productosRoutes = require('./productosroutes')
const ventasRoutes = require('./ventasroutes')

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use('/api', usuariosRoutes)
app.use('/api', areasRoutes)
app.use('/api', equiposRoutes)
app.use('/api', productosRoutes)
app.use('/api', ventasRoutes)

const port = 3000
app.listen(port, () => {
    console.log(`Servidor ejecutandose en http://localhost:${port}`)
})











