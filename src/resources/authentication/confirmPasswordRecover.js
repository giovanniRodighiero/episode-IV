const { encrypt } = require('node-password-encrypter');

const { errorTypes } = require('../errors/schema');

const MALFORMED_JWT = 'JsonWebTokenError';
const EXPIRED_JWT = 'TokenExpiredError';

const confirmPasswordRecoverController = function (request, reply) {
    const { token, password, confirmPassword } = request.body;

    this.jwt.verify(token, async (err, decoded) => {
        // TOKEN MALFORMED OR EXPIRED
        if (err) {
            console.log(err)
            reply.code(400);
            if (err.name === MALFORMED_JWT)
                reply.send({ code: errorTypes.VALIDATION_ERROR, fieldName: 'token' });
            else if (err.name === EXPIRED_JWT) {
                reply.code(403);
                reply.send({ code: errorTypes.NOT_AUTHORIZED });
            }
            return;
        }

        try {
            const Users = this.mongo.db.collection('users');

            const { account: email } = decoded;
            const user = await Users.findOne({ email });

            // WRONG EMAIL
            if (!user) {
                reply.code(404);
                reply.send({ code: errorTypes.NOT_FOUND });
            } else {
                // ALL FINE
                const { salt, encryptedContent } = await encrypt({ content: password, keylen: 128, iterations: 1000 });
                await Users.updateOne({ email }, { $set: {
                    salt,
                    password: encryptedContent
                }});
                reply.code(200);
                reply.send({ code: 'success' });
            }
        } catch (error) {
            console.log(error);
            reply.code(500);
            reply.send(error);
        }
    });
};

const confirmPasswordRecoverSchema = {
    summary: 'Recover and update a confirmed account password.',
    description: 'After a user has received a recover password email, he can set up a new password using the provided token.',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['password', 'confirmPassword', 'token'],
        properties: {
            token: { type: 'string' },
            password: { type: 'string' },
            confirmPassword: { const: { '$data': '1/password' } },
        },
        additionalProperties: false
    },

    response: {
        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            },
            additionalProperties: false
        },
        
        400: 'baseError#',

        403: 'baseError#',

        404: 'baseError#'
    }
};


module.exports = {
    confirmPasswordRecoverController,
    confirmPasswordRecoverSchema
};