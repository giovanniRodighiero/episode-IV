const replaceOldImages = require('../../services/replaceOldImages');
const { SETTINGS } = require('./collection');
const { errorTypes, generateErrorSchema } = require('../errors/schema');

const updateController = async function (request, reply) {
    const Settings = this.mongo.db.collection(SETTINGS.collectionName);
    
    const { value: oldSettings } = await Settings.findOneAndUpdate({}, { $set: request.body });
    
    try {
        await replaceOldImages(request.body.meta.image, oldSettings.meta.image);
    } catch (error) {
        this.log.error('Error while replacing old images ', error);
    }

    reply.code(200);
    return request.body;
    
};

const updateSchema = {
    summary: 'Updates the general site\'s settings.',
    description: 'Updates the general site\'s settings.',
    tags: ['Settings'],

    body: SETTINGS.schemas.baseSettingsSchema,

    response: {
        200: SETTINGS.schemas.baseSettingsSchema,

        400: generateErrorSchema([errorTypes.VALIDATION_ERROR, errorTypes.MISSING_PARAM], 'Validation error')
    }
};

module.exports = {
    updateController,
    updateSchema
};