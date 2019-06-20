const { SETTINGS } = require('./collection');

// SETTINGS INFO
const settings = projectName => ({
    defaultLang: 'it'
});


// CLEARS AND THE SETTINGS COLLECTION
async function seedSettings (database, config) {
    const Settings = database.collection(SETTINGS.collectionName);
    try {
        await Settings.deleteMany({});

        await Settings.insertOne(settings(config.projectName));

        console.log('seeding settings done, no errors');
        return true;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    settings,
    seedSettings
};