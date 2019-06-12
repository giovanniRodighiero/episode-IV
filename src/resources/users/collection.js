const schemas = require('./schema');

const baseProjection = {
    email: 1,
    role: 1,
    accountConfirmed: 1
};

// COLLECTION RELATED INFORMATIONS
const USERS = {
    collectionName: 'users',
    baseProjection,
    schemas
};

// INDEXES SPECIFICATIONS
const indexes = [
    [ { email: 1 }, { unique: true } ],
    [ { accountConfirmed: 1 } ]
];

// SET UP THE USERS COLLECTION
async function ensureIndexes (fastify) {
    try {
        const Users = fastify.mongo.db.collection(USERS.collectionName);

        // creates indexes
        for (const [ keyPatterns, options = null ] of indexes) {
            await Users.createIndex(keyPatterns, options);
        }

        return true;

    } catch (error) {
        throw error;
    }
};

module.exports = {
    indexes,
    ensureIndexes,
    baseProjection,
    USERS
};