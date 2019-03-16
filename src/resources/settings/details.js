const detailsController = async function (request, reply) {
    const Settings = this.mongo.db.collection('settings');

    const settings = await Settings.findOne({ });

    reply.code(200);
    return settings;
};

const detailsSchema = {
    summary: 'Returns a single user.',
    description: 'Given the unique id of an existing user, it returns his profile.',
    tags: ['Settings'],

    response: {
        200: 'settings#'
    }
};

module.exports = {
    detailsController,
    detailsSchema
};