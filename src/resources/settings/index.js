// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');

const settingsSchema = require('./schema');
const { detailsController, detailsSchema } = require('./details');

const initSettings = fastify => {

    fastify.addSchema(settingsSchema);

    fastify.get('/api/v1/settings', {
        beforeHandler: [ secureAuth, secureConfirmedAccount, secureRole(fastify.config.userRoles.SUPERADMIN) ],
        schema: detailsSchema
    }, detailsController);
    
};

module.exports = initSettings;