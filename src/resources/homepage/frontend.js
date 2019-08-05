const mergeMetaTags = require('../../services/mergeMetaTags');
const { HOMEPAGE } = require('./collection');

const frontendController = async function (request, reply) {
    const Pages = this.mongo.db.collection(HOMEPAGE.collectionName);

    // project only the requested lang
    const lang = request.params.lang || 'it';
    const projection = { [lang]: 1 };
    console.log('lang', lang)

    const homepage = await Pages.findOne({ code: HOMEPAGE.code }, { projection });

    const meta = mergeMetaTags(request.settings.meta, homepage[lang].meta);

    homepage.meta = meta;
    reply.view('../../frontend/views/homepage/index.ejs', {
        ...homepage[lang],
        lang: request.settings.lang,
        templateName: 'homepage'
    });
};

const frontendSchema = {
    params: {
        type: 'object',
        properties: {
            lang: { type: 'string', default: 'it' },
        }
    }
}

module.exports = {
    frontendController,
    frontendSchema
};