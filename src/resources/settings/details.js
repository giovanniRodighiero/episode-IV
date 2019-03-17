const detailsController = async function (request, reply) {
    const Settings = this.mongo.db.collection('settings');

    const settings = await Settings.findOne({ });

    reply.code(200);
    return settings;
};

const detailsSchema = {
    summary: 'Returns the general site\'s settings.',
    description: 'Returns the general site\'s settings.',
    tags: ['Settings'],

    response: {
        200: 'settings#'
    }
};

module.exports = {
    detailsController,
    detailsSchema
};