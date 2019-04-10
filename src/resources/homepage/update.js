const replaceOldImages = require('../../services/replaceOldImages');

const updateController = async function (request, reply) {
    const Pages = this.mongo.db.collection('pages');

    const { value: oldHomepage } = await Pages.findOneAndUpdate({ code: 'homepage' }, { $set: request.body });

    try {
        await replaceOldImages(request.body.meta.image, oldHomepage.meta.image);
        await replaceOldImages(request.body.hero.imageDesktop, oldHomepage.hero.imageDesktop);
        await replaceOldImages(request.body.hero.imageMobile, oldHomepage.hero.imageMobile);
    } catch (error) {
        console.log(error);
    }

    reply.code(200);
    return request.body;
};

const updateSchema = {
    summary: 'Updates the homepage informations.',
    description: 'Updates the homepage informations',
    tags: ['Homepage'],

    body: 'homepage#',

    response: {
        200: 'homepage#',

        400: 'baseError#'
    }
};

module.exports = {
    updateController,
    updateSchema
};