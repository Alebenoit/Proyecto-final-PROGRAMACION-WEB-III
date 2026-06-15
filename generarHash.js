const bcrypt = require('bcrypt');

const generar = async () => {
    const hash = await bcrypt.hash('Admin12345', 10);
    console.log(hash);
};


generar();


