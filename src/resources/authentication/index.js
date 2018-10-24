const { loginController, loginSchema } = require('./login');
const { registrationController, registrationSchema } = require('./registration')
const { confirmRegistrationController, confirmRegistrationSchema } = require('./confirmRegistration');
const { resendRegistrationEmailController, resendRegistrationEmailSchema } = require('./resendRegistrationEmail');

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

    fastify.post('/api/v1/resend-confirmation', {
        schema: resendRegistrationEmailSchema
    }, resendRegistrationEmailController);

};

module.exports = initAuthentication;