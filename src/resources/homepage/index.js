const settingsMiddleware = require('../../middlewares/settings');

function homepageController (request, response) {
    response.view('../views/homepage/index.ejs', { meta: request.settings.meta, lang: request.settings.lang });
}

function initHomepage (fastify) {

    fastify.get('/', {
        preHandler: settingsMiddleware
    }, homepageController);

};

module.exports = initHomepage;