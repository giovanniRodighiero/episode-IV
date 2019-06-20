const { encrypt } = require('node-password-encrypter');

const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('../users/collection');

const MALFORMED_JWT = 'JsonWebTokenError';
const EXPIRED_JWT = 'TokenExpiredError';



const confirmPasswordRecoverController = async function (request, reply) {
    const { token, password } = request.body;
    
    let decoded;
    try {
        // using sync implementation https://github.com/auth0/node-jsonwebtoken/issues/111
        decoded = this.jwt.verify(token);
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
    
    // ALL FINE
    const { salt, encryptedContent } = await encrypt({ content: password, keylen: 128, iterations: 1000 });
    await Users.updateOne({ email }, { $set: { salt, password: encryptedContent } });
    reply.code(200);
    return { code: 'success' };
        
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
        
        400: generateErrorSchema([errorTypes.VALIDATION_ERROR, errorTypes.MISSING_PARAM, errorTypes.PASSWORD_MISMATCH], 'Validation errors'),

        403: generateErrorSchema(errorTypes.NOT_AUTHORIZED, 'Operation not authorized or the link is expired'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found for the specified email')
    }
};


module.exports = {
    confirmPasswordRecoverController,
    confirmPasswordRecoverSchema
};