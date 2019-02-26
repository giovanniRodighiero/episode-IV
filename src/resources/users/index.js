// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');

const { baseUserSchema } = require('./schema');
const { ensureIndexes } = require('./collection');

// CONTROLLERS
const { meController, meSchema } = require('./me');
const { updateMeController, updateMeSchema } = require('./updateMe');
const { updateMePasswordController, updateMePasswordSchema } = require('./updateMePassword');
const { listController, listSchema } = require('./list');
const { creationController, creationSchema } = require('./creation');
const { updateController, updateSchema } = require('./update');
const { detailsController, detailsSchema } = require('./details');


async function initUsers (fastify) {

    // LOADING SCHEMA
    fastify.addSchema(baseUserSchema);

    // DATABSE MIGRATION (indexes and stuff)
    await ensureIndexes(fastify);

    fastify.post('/api/v1/users', {
        preValidation: [secureAuth, secureConfirmedAccount, secureRole(80)],
        schema: creationSchema
    }, creationController);

    fastify.get('/api/v1/users', {
        preValidation: [secureAuth, secureConfirmedAccount, secureRole(80)],
        schema: listSchema
    }, listController);

    fastify.get('/api/v1/users/me', {
        preValidation: secureAuth,
        schema: meSchema
    }, meController);

    fastify.put('/api/v1/users/me/profile', {
        preValidation: [secureAuth, secureConfirmedAccount],
        schema: updateMeSchema
    }, updateMeController);

    fastify.put('/api/v1/users/me/password', {
        preValidation: [secureAuth, secureConfirmedAccount],
        schema: updateMePasswordSchema
    }, updateMePasswordController);

    fastify.get('/api/v1/users/:id', {
        preValidation: [secureAuth, secureConfirmedAccount, secureRole(80)],
        schema: detailsSchema
    }, detailsController);

    fastify.put('/api/v1/users/:id', {
        preValidation: [secureAuth, secureConfirmedAccount, secureRole(80)],
        schema: updateSchema
    }, updateController);

    return true;
};

module.exports = initUsers;