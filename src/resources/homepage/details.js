const { errorTypes } = require('../errors/schema');

const detailsController = async function (request, reply) {
    const Pages = this.mongo.db.collection('pages');

    const homepage = await Pages.findOne({ code: 'homepage' });

    if (!homepage) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND };
    }

    reply.code(200);
    return homepage;
};

const detailsSchema = {
    summary: 'Returns the homepage informations',
    description: 'Returns the homepage informations',
    tags: ['Pages'],

    response: {
        200: 'homepage#',

        404: 'baseError#'
    }
};

module.exports = {
    detailsController,
    detailsSchema
};