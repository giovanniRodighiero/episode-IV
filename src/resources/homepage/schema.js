const { config } = require('../../../config');
const { baseSettingsSchema } = require('../settings/schema');

const { availableLangs } = config;

const baseHomepageSchema = {
    type: 'object',
    required: ['meta', 'hero'],
    properties: {
        meta: {
            ...baseSettingsSchema.properties.meta,
            required: []
        },

        hero: {
            type: 'object',
            required: ['title', 'subtitle', 'description'],
            properties: {
                imageDesktop: { type: 'string', description: 'The page image cover (Desktop)' },
                imageMobile: { type: 'string', description: 'The page image cover (Mobile)' },
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
                        required: ['title', 'description', 'image', 'position'],
                        properties: {
                            title: { type: 'string', description: 'Service name' },
                            description: { type: 'string', description: 'Service description' },
                            image: { type: 'string', description: 'Service image' },
                            position: { type: 'number', default: 0, description: 'The service position, used in sorting' }
                        }
                    }
                }
            }
        },

        cta: {
            type: 'object',
            required: ['link', 'title'],
            properties: {
                title: { type: 'string', description: 'Section title' },
                link: { type: 'string', description: 'CTA link' }
            }
        }

    },
};

const baseHomepageSchemaWithLangs = {
    type: 'object',
    required: [],
    properties: {}
};

availableLangs.forEach(lang => {
    baseHomepageSchemaWithLangs.required.push(lang);
    baseHomepageSchemaWithLangs.properties[lang] = baseHomepageSchema; 
});

module.exports = {
    baseHomepageSchemaWithLangs,
    baseHomepageSchema
};