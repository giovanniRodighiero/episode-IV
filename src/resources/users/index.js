// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');

const { baseUserSchema } = require('./schema');
const { ensureIndexes } = require('./collection');

// CONTROLLERS
const { meController, meSchema } = require('./me');
const { updateMeController, updateMeSchema } = require('./updateMe');
const { updateMePasswordController, updateMePasswordSchema } = require('./updateMePassword');


async function initUsers (fastify) {

    // LOADING SCHEMA
    fastify.addSchema(baseUserSchema);

    // DATABSE MIGRATION (indexes and stuff)
    await ensureIndexes(fastify);


    fastify.get('/api/v1/users/me', {
        beforeHandler: secureAuth,
        schema: meSchema
    }, meController);

    fastify.put('/api/v1/users/me/profile', {
        beforeHandler: [secureAuth, secureConfirmedAccount],
        schema: updateMeSchema
    }, updateMeController);

    fastify.put('/api/v1/users/me/password', {
        beforeHandler: [secureAuth, secureConfirmedAccount],
        schema: updateMePasswordSchema
    }, updateMePasswordController);

    return true;
};

module.exports = initUsers;