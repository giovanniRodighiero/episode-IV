const replaceOldImages = require('../../services/replaceOldImages');
const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { HOMEPAGE } = require('./collection');

const updateController = async function (request, reply) {
    const Pages = this.mongo.db.collection(HOMEPAGE.collectionName);

    const { value: oldHomepage } = await Pages.findOneAndUpdate({ code: HOMEPAGE.code }, { $set: request.body });

    for (const lang of this.config.availableLangs) {
        try {
            await replaceOldImages(request.body[lang].meta.image, oldHomepage[lang].meta.image);
            await replaceOldImages(request.body[lang].hero.imageDesktop, oldHomepage[lang].hero.imageDesktop);
            await replaceOldImages(request.body[lang].hero.imageMobile, oldHomepage[lang].hero.imageMobile);
        } catch (error) {
            this.log.error('error replacing one of the images', error);
        }
    }

    reply.code(200);
    return request.body;
};

const updateSchema = {
    summary: 'Updates the homepage informations.',
    description: 'Updates the homepage informations',
    tags: ['Homepage'],

    body: HOMEPAGE.schemas.baseHomepageSchemaWithLangs,

    response: {
        200: HOMEPAGE.schemas.baseHomepageSchemaWithLangs,

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation error')
    }
};

module.exports = {
    updateController,
    updateSchema
};