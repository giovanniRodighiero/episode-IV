const secureAuth = require('../../middlewares/authentication');


const { baseUserSchema } = require('./schema');
const { ensureIndexes } = require('./collection');

const { meController, meSchema } = require('./me');

async function initUsers (fastify) {

    // LOADING SCHEMA
    fastify.addSchema(baseUserSchema);

    // DATABSE MIGRATION (indexes and stuff)
    await ensureIndexes(fastify);


    fastify.get('/api/v1/users/me', {
        beforeHandler: secureAuth,
        schema: meSchema
    }, meController);

    return true;
};

module.exports = initUsers;