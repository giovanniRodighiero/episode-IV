const { errorTypes } = require('../errors/schema');

const MALFORMED_JWT = 'JsonWebTokenError';
const EXPIRED_JWT = 'TokenExpiredError';

const confirmRegistrationController = function (request, reply) {

    this.jwt.verify(request.body.token, async (err, decoded) => {
        // TOKEN MALFORMED OR EXPIRED
        if (err) {
            reply.code(400);
            if (err.name === MALFORMED_JWT)
                reply.send({ code: errorTypes.VALIDATION_ERROR, field: 'token' });
            else if (err.name === EXPIRED_JWT) {
                reply.code(403);
                reply.send({ code: errorTypes.NOT_AUTHORIZED });
            }
            return;
        }

        const Users = this.mongo.db.collection('users');

        const { account: email } = decoded;
        const user = await Users.findOne({ email });
        // WRONG EMAIL
        if (!user) {
            reply.code(404);
            reply.send({ code: errorTypes.NOT_FOUND });
        } else {
            // ACCOUNT ALREADY ACTIVE
            if (user.accountConfirmed) {
                reply.code(400);
                reply.send({ code: errorTypes.ALREADY_ACTIVE });
            } else {
                // ALL FINE
                await Users.updateOne({ email }, { $set: { accountConfirmed: true }});
                reply.code(200);
                reply.send({ code: 'success' });
            }
        }
    });
    
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

        401: 'baseError#',

        404: 'baseError#'
    }
};

module.exports = {
    confirmRegistrationController,
    confirmRegistrationSchema
};