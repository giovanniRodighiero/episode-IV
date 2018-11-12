const config = {
    exposeRoute: process.env.NODE_ENV !== 'production',
    routePrefix: '/documentations',
    swagger: {
        info: {
            title: 'Base project - API',
            description: 'API documentation for Base project',
            version: '0.0.1'
        },
        host: 'localhost',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
            { name: 'Authentication', description: 'Authentication flow APIs (registration, login, ecc...)' },
            { name: 'Users', description: 'Users related API, personal profile and generic CRUD.' },
            // { name: 'protected', description: 'Protected API, need a valid access token' }
        ]
    }
};

module.exports = config;