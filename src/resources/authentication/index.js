const { loginController, loginSchema } = require('./login');

function initAuthentication (fastify) {

    fastify.post('/api/v1/login', {
        schema: loginSchema
    }, loginController);
};

module.exports = initAuthentication;