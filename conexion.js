const mysql = require('mysql2')

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_lrw'
}

const db = mysql.createConnection(dbConfig)


db.connect((err) => {
    if(err){
        console.error('Error al conectar a la base de datos: ', err)
        return
    }

    console.log('Conexión exitosa a la base de datos MySQL')
})


module.exports = db;



