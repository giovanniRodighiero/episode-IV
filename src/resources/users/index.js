const { baseUserSchema } = require('./schema');
const { ensureIndexes } = require('./collection');

async function initUsers (fastify) {

    // LOADING SCHEMA
    fastify.addSchema(baseUserSchema);

    // DATABSE MIGRATION (indexes and stuff)
    await ensureIndexes(fastify);

    return true;
};

module.exports = initUsers;