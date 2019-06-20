// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');

// CONTROLLERS
const { detailsController, detailsSchema } = require('./details');
const { updateController, updateSchema } = require('./update');

async function initSettings (fastify) {

    const { userRoles } = fastify.config;

    fastify.get('/api/v1/settings', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(userRoles.SUPERADMIN) ],
        schema: detailsSchema
    }, detailsController);
  
    fastify.put('/api/v1/settings', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(userRoles.SUPERADMIN) ],
        schema: updateSchema
    }, updateController);
};

module.exports = initSettings;