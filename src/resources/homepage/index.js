// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');
const secureRole = require('../../middlewares/role');
const settingsMiddleware = require('../../middlewares/settings');

const homepageSchema = require('./schema');
const { detailsController, detailsSchema } = require('./details');

function homepageController (request, response) {
    response.view('../views/homepage/index.ejs', { meta: request.settings.meta, lang: request.settings.lang });
}

function initHomepage (fastify) {
    const { userRoles } = fastify.config;

    fastify.addSchema(homepageSchema);

    fastify.get('/api/v1/pages/homepage', {
        preValidation: [ secureAuth, secureConfirmedAccount, secureRole(userRoles.USER)],
        schema: detailsSchema
    }, detailsController);

    fastify.get('/', {
        preHandler: settingsMiddleware
    }, homepageController);

};

module.exports = initHomepage;