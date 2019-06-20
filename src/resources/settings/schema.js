const baseSettingsSchema = {
    type: 'object',
    required: ['defaultLang'],
    properties: {
        defaultLang: { type: 'string', enum: ['it', 'en'], description: 'Default lang for the website' }
    },
    additionalProperties: false
};

module.exports = {
    baseSettingsSchema
};