const settingsSchema = {
    $id: 'settings',
    type: 'object',
    required: ['meta'],
    properties: {
        meta: {
            type: 'object',
            required: ['title', 'description', 'ogUrl', 'ogTitle', 'ogDescription', 'twitterUrl', 'twitterTitle', 'twitterDescription'],
            properties: {
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

module.exports = settingsSchema;