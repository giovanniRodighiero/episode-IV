function homepageController (request, response) {
    response.view('../views/homepage/index.ejs', { meta: {title: 'homepage ciaone' } })
}

function initHomepage (fastify) {

    fastify.get('/', homepageController);

};

module.exports = initHomepage;