const MongoClient = require('mongodb').MongoClient;

const allConfigs = require('../config');

const exportUsers = require('../src/resources/users/export');

const config = allConfigs[process.env.NODE_ENV];


MongoClient.connect(config.database.url, { useNewUrlParser: true }, async function(err, client) {
    console.log('connected');
    const db = client.db(config.database.name);

    try {
        const filename = await exportUsers(db, config);
        console.log(filename);
        client.close();
        
    } catch (error) {
        console.log(error);
    }
});

