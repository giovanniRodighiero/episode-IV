// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');

const settingsSchema = require('./schema');
const { detailsController, detailsSchema } = require('./details');
const { updateController, updateSchema } = require('./update');

const initSettings = fastify => {

    fastify.addSchema(settingsSchema);

    fastify.get('/api/v1/settings', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(fastify.config.userRoles.SUPERADMIN) ],
        schema: detailsSchema
    }, detailsController);
  
    fastify.put('/api/v1/settings', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(fastify.config.userRoles.SUPERADMIN) ],
        schema: updateSchema
    }, updateController);
};

module.exports = initSettings;