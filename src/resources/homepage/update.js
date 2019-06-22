const replaceOldImages = require('../../services/replaceOldImages');
const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { HOMEPAGE } = require('./collection');

const updateController = async function (request, reply) {
    const Pages = this.mongo.db.collection(HOMEPAGE.collectionName);

    const { value: oldHomepage } = await Pages.findOneAndUpdate({ code: HOMEPAGE.code }, { $set: request.body });

    try {
        await replaceOldImages(request.body.meta.image, oldHomepage.meta.image);
        await replaceOldImages(request.body.hero.imageDesktop, oldHomepage.hero.imageDesktop);
        await replaceOldImages(request.body.hero.imageMobile, oldHomepage.hero.imageMobile);
    } catch (error) {
        this.log.error('error replacing one of the images', error);
    }

    reply.code(200);
    return request.body;
};

const updateSchema = {
    summary: 'Updates the homepage informations.',
    description: 'Updates the homepage informations',
    tags: ['Homepage'],

    body: HOMEPAGE.schemas.baseHomepageSchema,

    response: {
        200: HOMEPAGE.schemas.baseHomepageSchema,

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation error')
    }
};

module.exports = {
    updateController,
    updateSchema
};