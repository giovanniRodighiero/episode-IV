const mergeMetaTags = require('../../services/mergeMetaTags');

const frontendController = async function (request, reply) {
    const Pages = this.mongo.db.collection('pages');

    const homepage = await Pages.findOne({ code: 'homepage' });

    const meta = mergeMetaTags(request.settings.meta, homepage.meta);

    homepage.meta = meta;
    reply.view('../views/homepage/index.ejs', {
        ...homepage,
        lang: request.settings.lang,
        templateName: 'homepage'
    });
};

module.exports = {
    frontendController
};