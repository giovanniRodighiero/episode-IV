const MongoClient = require('mongodb').MongoClient;

const { seedUsers } = require('../src/resources/users/seed');
const { seedSettings } = require('../src/resources/settings/seed');
const { seedHomepage } = require('../src/resources/homepage/seed');

const allConfigs = require('../config');

const config = allConfigs[process.env.NODE_ENV];


MongoClient.connect(config.database.url, { useNewUrlParser: true }, async function(error, client) {

    if (error) {
        console.log(error);
        return;
    }

    console.log('connected');
    const db = client.db(config.database.name);
    try {

        await seedUsers(db);
        await seedSettings(db, config);
        await seedHomepage(db);

        client.close();
        
    } catch (error) {
        console.log(error)
    }
    
});

