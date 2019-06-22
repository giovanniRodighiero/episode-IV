const { promisify } = require('util');

const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { userRegistrationTemplate } = require('../../emailTemplates');
const { USERS } = require('./collection');

let signJwt;

const creationController = async function (request, reply) {
    if (!signJwt)
        signJwt = promisify(this.jwt.sign);

    const Users = this.mongo.db.collection(USERS.collectionName);
    const { email, role } = request.body;

    // CHECK FOR TOO HIGH ROLE
    if (role >= request.user.role) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR, fieldName: 'role' };
    }

    // CHECK FOR ALREADY EXISTING EMAIL
    const user = await Users.findOne({ email }, { email: 1 });
    if (user) {
        reply.code(409);
        return { code: errorTypes.ALREADY_EXISTING, fieldName: 'email' };
    }

    // ALL FINE SAVE + EMAIL
    await Users.insertOne({ email, role, accountConfirmed: false, privacyAccepted: false });
    try {
        const token = await signJwt({ account: email }, { expiresIn: '2 days' })
        await this.nodemailer.sendMail({
            from: this.config.mailer.from,
            to: email,
            subject: 'Account confirmation',
            html: userRegistrationTemplate({
                htmlTitle: 'Account confirmation',
                activationLink: `${this.config.address}/api/v1/confirmation/${token}`
            })
        });

        reply.code(201);
        reply.send({ code: 'success' });
    } catch (error) {
        this.log.error(error);
        reply.code(500);
        reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
    }

};

const creationSchema = {
    summary: 'Creates a non-confirmed user account',
    description: 'Creates a new user account with a role lower than the user who created it. A confirmation email will be sent to the provided address.',
    tags: ['Users'],

    body: {
        type: 'object',
        required: ['email', 'role'],
        properties: {
            email: { type: 'string', format: 'email', description: 'A confirmation email will be sent here.' },
            role: { type: 'number', minimum: 70, default: 70, description: 'User role' }
        },
        additionalProperties: false
    },

    response: {

        200: {
            description: 'User created successfully',
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string', description: 'Success code', default: 'success' }
            }
        },

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation errors'),

        409: generateErrorSchema(errorTypes.ALREADY_EXISTING, 'Email address already in use'),
    }
};

module.exports = {
    creationController,
    creationSchema
};