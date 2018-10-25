// INDEXES SPECIFICATIONS
const indexes = [
    [ { email: 1 }, { unique: true } ],
    [ { accountConfirmed: 1 } ]
];



// SET UP THE USERS COLLECTION
async function ensureIndexes (fastify) {
    try {
        const Users = fastify.mongo.db.collection('users');

        // creates indexes
        for (const [ keyPatterns, options = null ] of indexes) {
            await Users.createIndex(keyPatterns, options)
        }

    } catch (error) {
        throw error;
    }
};

module.exports = {
    indexes,
    ensureIndexes
};