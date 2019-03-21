
const updateController = async function (request, reply) {
    const Settings = this.mongo.db.collection('settings');
    
    const newSettings = await Settings.findOneAndUpdate({}, { $set: request.body }, { returnOriginal: false } );
    
    reply.code(200);
    return newSettings.value;

};

const updateSchema = {
    summary: 'Updates the general site\'s settings.',
    description: 'Updates the general site\'s settings.',
    tags: ['Settings'],

    body: 'settings#',

    response: {
        200: 'settings#',

        400: 'baseError#'
    }
};

module.exports = {
    updateController,
    updateSchema
};