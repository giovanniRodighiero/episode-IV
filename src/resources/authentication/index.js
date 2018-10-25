const { loginController, loginSchema } = require('./login');
const { registrationController, registrationSchema } = require('./registration')
const { confirmRegistrationController, confirmRegistrationSchema } = require('./confirmRegistration');
const { resendRegistrationEmailController, resendRegistrationEmailSchema } = require('./resendRegistrationEmail');
const { passwordRecoverController, passwordRecoverSchema } = require('./passwordRecover');

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

    fastify.post('/api/v1/password-recover', {
        schema: passwordRecoverSchema
    }, passwordRecoverController);

};

module.exports = initAuthentication;