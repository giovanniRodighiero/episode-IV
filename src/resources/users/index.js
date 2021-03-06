// MIDDLEWARES
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');

const { ensureIndexes } = require('./collection');

// CONTROLLERS
const { meController, meSchema } = require('./me');
const { updateMeController, updateMeSchema } = require('./updateMe');
const { updateMePasswordController, updateMePasswordSchema } = require('./updateMePassword');
const { listController, listSchema } = require('./list');
const { creationController, creationSchema } = require('./creation');
const { updateController, updateSchema } = require('./update');
const { detailsController, detailsSchema } = require('./details');
const { deleteController, deleteSchema } = require('./delete');
const { invalidateTokensController, invalidateTokensSchema } = require('./invalidateTokens');

async function initUsers (fastify) {

    const { userRoles } = fastify.config;

    // DATABSE MIGRATION (indexes and stuff)
    fastify.register(ensureIndexes);

    fastify.post('/api/v1/users', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount, secureRole(userRoles.ADMIN) ],
        schema: creationSchema
    }, creationController);

    fastify.get('/api/v1/users', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount, secureRole(userRoles.ADMIN) ],
        schema: listSchema
    }, listController);

    fastify.get('/api/v1/users/me', {
        preValidation: fastify.secureAuth,
        schema: meSchema
    }, meController);

    fastify.put('/api/v1/users/me/profile', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount ],
        schema: updateMeSchema
    }, updateMeController);

    fastify.put('/api/v1/users/me/password', {
        preValidation: [fastify.secureAuth, secureConfirmedAccount],
        schema: updateMePasswordSchema
    }, updateMePasswordController);

    fastify.get('/api/v1/users/:id', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount, secureRole(userRoles.ADMIN) ],
        schema: detailsSchema
    }, detailsController);

    fastify.put('/api/v1/users/:id', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount, secureRole(userRoles.ADMIN) ],
        schema: updateSchema
    }, updateController);

    fastify.delete('/api/v1/users/:id', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount, secureRole(userRoles.ADMIN) ],
        schema: deleteSchema
    }, deleteController);

    fastify.post('/api/v1/users/auth-tokens', {
        preValidation: [ fastify.secureAuth, secureConfirmedAccount, secureRole(userRoles.SUPERADMIN) ],
        schema: invalidateTokensSchema
    }, invalidateTokensController);

};

module.exports = initUsers;