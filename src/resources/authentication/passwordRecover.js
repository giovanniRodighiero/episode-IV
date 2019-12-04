const { promisify } = require('util');

const { userRegistrationTemplate } = require('../../emailTemplates');
const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('../users/collection');


let signJwt;

const passwordRecoverController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { email } = request.body;

    const user = await Users.findOne({ email });
    // USER NOT FOUND
    if (!user) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND };
    }

    // USER ACCOUNT NOT CONFIRMED
    if (!user.accountConfirmed) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }

    if (!signJwt)
        signJwt = promisify(this.jwt.sign);

    // SIGN JWT
    const token = await signJwt({ account: email }, { expiresIn: '2 days' });

    // SEND RECOVER EMAIL
    await this.nodemailer.sendMail({
        from: this.config.mailer.from,
        to: email,
        subject: 'Password recovery',
        html: userRegistrationTemplate({
            htmlTitle: 'Password Recovery',
            activationLink: `${this.config.address}/api/v1/recovery/${token}`
        })
    });

    reply.code(200);
    return { code: 'success' };


};

const passwordRecoverSchema = {
    summary: 'Send an email with the password recovery link',
    description: 'Send an email with the password recovery link for a confirmed user account.',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email', transform: ['trim', 'toLowerCase'], description: 'User email' }
        },
        additionalProperties: false
    },

    response: {
        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            }
        },

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation error'),

        403: generateErrorSchema(errorTypes.NOT_AUTHORIZED, 'Account not confirmed'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found')
    }
};

module.exports = {
    passwordRecoverController,
    passwordRecoverSchema
};