const fs = require('fs').promises;
const path = require('path');

const updateController = async function (request, reply) {
    const Settings = this.mongo.db.collection('settings');
    
    const { value: oldSettings } = await Settings.findOneAndUpdate({}, { $set: request.body });
    
    if (!!oldSettings.meta.image && request.body.meta.image !== oldSettings.meta.image) {
        const imagePath = oldSettings.meta.image.split(this.config.address)[1];
        try {
            await fs.unlink(path.join(__dirname, '../../../', imagePath));
        } catch (error) {
            console.log(error);
        }
        reply.code(200);
        return request.body;
    }
    
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