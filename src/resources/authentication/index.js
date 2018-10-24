const { loginController, loginSchema } = require('./login');
const { registrationController, registrationSchema } = require('./registration')
const { confirmRegistrationController, confirmRegistrationSchema } = require('./confirmRegistration');

function initAuthentication (fastify) {

    fastify.post('/api/v1/login', {
        schema: loginSchema
    }, loginController);

    fastify.post('/api/v1/registration', {
        schema: registrationSchema
    }, registrationController);
    
    fastify.post('/api/v1/confirm-registration', {
        schema: confirmRegistrationSchema
    }, confirmRegistrationController);

};

module.exports = initAuthentication;