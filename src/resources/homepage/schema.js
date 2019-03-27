const settingsSchema = require('../settings/schema');

const homepageSchema = {
    $id: 'homepage',
    type: 'object',
    required: ['meta', 'hero', 'services', 'cta'],
    properties: {
        meta: settingsSchema.properties.meta,

        hero: {
            type: 'object',
            required: ['title', 'subtitle', 'description'],
            properties: {
                title: { type: 'string', description: 'The page main title' },
                subtitle: { type: 'string', description: 'The page subtitle' },
                description: { type: 'string', description: 'The page description' },
            }
        },

        services: {
            type: 'object',
            required: ['title'],
            properties: {
                title: { type: 'string', description: 'Service block title' },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['title', 'description'],
                        properties: {
                            title: { type: 'string', description: 'Service name' },
                            description: { type: 'string', description: 'Service description' },
                        }
                    }
                }
            }
        },

        cta: {
            type: 'object',
            required: ['link'],
            properties: {
                link: { type: 'string', description: 'CTA link' }
            }
        }

    },
};

module.exports = homepageSchema;