const replaceOldImages = require('../../services/replaceOldImages');

const updateController = async function (request, reply) {
    const Settings = this.mongo.db.collection('settings');
    
    const { value: oldSettings } = await Settings.findOneAndUpdate({}, { $set: request.body });
    
    try {
        await replaceOldImages(request.body.meta.image, oldSettings.meta.image);
    } catch (error) {
        console.log(error);
    }

    reply.code(200);
    return request.body;
    
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