const { loginController, loginSchema } = require('./login');
const { registrationController, registrationSchema } = require('./registration')

function initAuthentication (fastify) {

    fastify.post('/api/v1/login', {
        schema: loginSchema
    }, loginController);

    fastify.post('/api/v1/registration', {
        schema: registrationSchema
    }, registrationController);
    
};

module.exports = initAuthentication;