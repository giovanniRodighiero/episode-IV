const MongoClient = require('mongodb').MongoClient;

const { seedUsers } = require('../src/resources/users/seed');

const config = require('../config').config();

MongoClient.connect(config.database.url, { useNewUrlParser: true }, async function(error, client) {

    if (error) {
        console.log(error);
        return;
    }

    console.log('connected');
    const db = client.db(config.database.name);
    try {
        
        await seedUsers(db);

        client.close();
        
    } catch (error) {
        console.log(error)
    }
});

