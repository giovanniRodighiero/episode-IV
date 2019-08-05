const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { HOMEPAGE } = require('./collection');

const detailsController = async function (request, reply) {
    const Pages = this.mongo.db.collection(HOMEPAGE.collectionName);

    const homepage = await Pages.findOne({ code: HOMEPAGE.code });

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
        200: HOMEPAGE.schemas.baseHomepageSchemaWithLangs,

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'Page not found')
    }
};

module.exports = {
    detailsController,
    detailsSchema
};