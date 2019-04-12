// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');
const settingsMiddleware = require('../../middlewares/settings');

// CONTROLLER
const homepageSchema = require('./schema');
const { detailsController, detailsSchema } = require('./details');
const { updateController, updateSchema } = require('./update');
const { frontendController } = require('./frontend');

function initHomepage (fastify) {
    const { userRoles } = fastify.config;

    fastify.addSchema(homepageSchema);

    fastify.get('/api/v1/pages/homepage', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(userRoles.USER) ],
        schema: detailsSchema
    }, detailsController);

    fastify.put('/api/v1/pages/homepage', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(userRoles.USER) ],
        schema: updateSchema
    }, updateController);

    fastify.get('/', {
        preHandler: settingsMiddleware
    }, frontendController);

};

module.exports = initHomepage;