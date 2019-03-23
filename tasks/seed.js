const MongoClient = require('mongodb').MongoClient;

const { seedUsers } = require('../src/resources/users/seed');
const { seedSettings } = require('../src/resources/settings/seed');

const allConfigs = require('../config');


const config = allConfigs[process.env.NODE_ENV];


MongoClient.connect(config.database.url, { useNewUrlParser: true }, async function(err, client) {
    console.log('connected');
    const db = client.db(config.database.name);
    try {
        
        await seedUsers(db);
        await seedSettings(db);
        client.close();
        
    } catch (error) {
        console.log(error)
    }
});

