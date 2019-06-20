const schemas = require('./schema');

// COLLECTION RELATED INFORMATIONS
const SETTINGS = {
    collectionName: 'settings',
    schemas
};

// INDEXES SPECIFICATIONS
const indexes = [];

// SET UP THE USERS COLLECTION
async function ensureIndexes (fastify) {
    try {
        const Settings = fastify.mongo.db.collection(SETTINGS.collectionName);

        // creates indexes
        for (const [ keyPatterns, options = null ] of indexes) {
            await Settings.createIndex(keyPatterns, options);
        }

        return true;

    } catch (error) {
        throw error;
    }
};

module.exports = {
    indexes,
    ensureIndexes,
    SETTINGS
};