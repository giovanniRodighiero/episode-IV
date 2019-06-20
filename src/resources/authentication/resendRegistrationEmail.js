const { promisify } = require('util');

const { userRegistrationTemplate } = require('../../views/email');
const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('../users/collection');

let signJwt;

const resendRegistrationEmailController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);
    const { email } = request.body;

    const user = await Users.findOne({ email });
    if (!user) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND, fieldName: 'email' };
    }

    if (user.accountConfirmed) {
        reply.code(403);
        return { code: errorTypes.ALREADY_ACTIVE };
    }

    if (!signJwt)
        signJwt = promisify(this.jwt.sign);

    const token = await this.jwt.sign({ account: email }, { expiresIn: '2 days' });
    await this.nodemailer.sendMail({
        from: this.config.mailer.from,
        to: email,
        subject: 'Successful registration',
        html: userRegistrationTemplate({
            htmlTitle: 'Registration',
            activationLink: this.config.address + '/api/v1/confirmation/' + token
        })
    });
    
    reply.code(200);
    return { code: 'success' };
};

const resendRegistrationEmailSchema = {
    summary: 'Resend the account confirmation email',
    description: 'Resend the account confirmation email for a specified email address. It only works for a non-active account.',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email', transform: ['trim', 'toLowerCase'] }
        },
        additionalProperties: false,
        description: 'Email of the account to send the confirmation email.'
    },

    response: {

        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            }
        },

        400: generateErrorSchema([errorTypes.VALIDATION_ERROR, errorTypes.MISSING_PARAM], 'Validation error'),

        403: generateErrorSchema(errorTypes.ALREADY_ACTIVE, 'The user is already active'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found for the specified email address')

    }
};

module.exports = {
    resendRegistrationEmailController,
    resendRegistrationEmailSchema
};