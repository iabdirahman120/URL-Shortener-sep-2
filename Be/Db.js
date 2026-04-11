const {Pool} = require('pg'); //henter Pool klasse fra pg pakke. Pool håndterer flere databse forbindelser på en gang

require('dotenv').config(); //indlæser .env filen så man kan burge database oplysninger

const pool = new Pool({ //opretter en ny database forbindelse med mine oplysninger
    host: process.env.DB_HOST, //henter dattabse adressen fra env
    port: process.env.DB_PORT, //henter database port fra env
    database: process.env.DB_NAME, //henter databse navn fra env
    user: process.env.DB_USER, //henter database brugernavn fra env
    password: process.env.DB_PASSWORD, //henter password fra env
});

module.exports = pool; //eksporterer pool så andre filer kan importere og bruge til kommuikere med databse