const { errorTypes, generateErrorSchema } = require('../errors/schema');

const { USERS } = require('../users/collection');

const MALFORMED_JWT = 'JsonWebTokenError';
const EXPIRED_JWT = 'TokenExpiredError';

const confirmRegistrationController = async function (request, reply) {

    let decoded;
    try {
        // using sync implementation https://github.com/auth0/node-jsonwebtoken/issues/111
        decoded = this.jwt.verify(request.body.token);
    } catch (error) {
        // TOKEN MALFORMED OR EXPIRED
        reply.code(400);
        if (error.name === MALFORMED_JWT)
            return { code: errorTypes.VALIDATION_ERROR, fieldName: 'token' };

        if (error.name === EXPIRED_JWT) {
            reply.code(403);
            return { code: errorTypes.NOT_AUTHORIZED };
        }
        request.log.error(error);
        throw error;
    }

    const Users = this.mongo.db.collection(USERS.collectionName);
    
    const { account: email } = decoded;
    const user = await Users.findOne({ email });

    // WRONG EMAIL
    if (!user) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND, fieldName: 'email' };
    }

    // ACCOUNT ALREADY ACTIVE
    if (user.accountConfirmed) {
        reply.code(400);
        return { code: errorTypes.ALREADY_ACTIVE };
    }
    
    // ALL FINE
    await Users.updateOne({ email }, { $set: { accountConfirmed: true }});
    reply.code(200);
    return { code: 'success' };

};

const confirmRegistrationSchema = {
    description: 'It is used in order to confirm and activate an existing user account.',
    summary: 'Confirm and activate a user account',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string', description: 'The confirmation token of the user' }
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

        400: generateErrorSchema([errorTypes.VALIDATION_ERROR, errorTypes.MISSING_PARAM, errorTypes.ALREADY_ACTIVE], 'Validation errors'),

        403: generateErrorSchema(errorTypes.NOT_AUTHORIZED, 'Operation not authorized or the link is expired'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found for the specified email')

    }
};

module.exports = {
    confirmRegistrationController,
    confirmRegistrationSchema
};