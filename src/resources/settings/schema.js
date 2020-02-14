const { config } = require('../../../config');

const { availableLangs } = config;

const baseSettingsSchema = {
    type: 'object',
    required: ['meta'],
    properties: {
        meta: {
            type: 'object',
            required: ['image', 'title', 'description', 'ogUrl', 'ogTitle', 'ogDescription', 'twitterUrl', 'twitterTitle', 'twitterDescription'],
            properties: {
                image: { type: 'string', description: 'Site image preview' },
                title: { type: 'string', description: 'Site meta title' },
                description: { type: 'string', description: 'Site meta description' },

                ogUrl: { type: 'string', description: 'Site open graph url' },
                ogTitle: { type: 'string', description: 'Site open graph title' },
                ogDescription: { type: 'string', description: 'Site open graph description' },

                twitterUrl: { type: 'string', description: 'Twitter url' },
                twitterTitle: { type: 'string', description: 'Twitter title' },
                twitterDescription: { type: 'string', description: 'Twitter description' },
            }
        }
    },
    additionalProperties: false
};

const baseSettingsSchemaWithLangs = {
    type: 'object',
    required: [],
    properties: {}
};

availableLangs.forEach(lang => {
    baseSettingsSchemaWithLangs.required.push(lang);
    baseSettingsSchemaWithLangs.properties[lang] = baseSettingsSchema; 
});

module.exports = {
    baseSettingsSchema,
    baseSettingsSchemaWithLangs
};