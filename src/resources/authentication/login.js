const { compare } = require('node-password-encrypter');
const { promisify } = require('util');

const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('../users/collection');

let signJwt;

const loginController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { email, password } = request.body;

    // FETCH THE USER
    const user = await Users.findOne({ email }, { password: 1, email: 1, accountConfirmed: 1 });
    if (!user) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND, fieldName: 'email' };
    }

    // ACCOUNT NOT CONFIRMED
    if (!user.accountConfirmed) {
        reply.code(403);
        return { code: errorTypes.NOT_CONFIRMED };
    }

    // PASSWORD COMPARISON
    const passwordsEqual = await compare({
        content: password,
        encryptedContent: user.password,
        salt: user.salt,
        keylen: 128,
        iterations: 1000
    });
    if (!passwordsEqual) {
        reply.code(401);
        return { code: errorTypes.WRONG_PASSWORD };
    }

    if (!signJwt)
        signJwt = promisify(this.jwt.sign);

    // GENERATING NEW ACCESS TOKEN
    const token = await this.jwt.sign(
        {
            email: user.email,
            _id: user._id,
            role: user.role
        },
        {
            expiresIn: '60 days'
        });

    reply.code(200);
    return { token, user };
};

const loginSchema = {
    
    summary: 'Users login',
    description: 'Used to obtain an authentication token, which allows to perform successful requests to protected APIs',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email', transform: ['trim', 'toLowerCase'] },
            password: { type: 'string', transform: ['trim', 'toLowerCase'] }
        },
        additionalProperties: false
    },

    response: {
        200: {
            description: 'Successful login',
            type: 'object',
            required: ['token', 'user'],
            properties: {
                token: { type: 'string' },
                user: USERS.schemas.baseUserSchema
            }
        },

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation error'),

        401: generateErrorSchema([errorTypes.NOT_AUTHENTICATED, errorTypes.WRONG_PASSWORD], 'Not authenticated or wrong password'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found')
    }

};



module.exports = {
    loginController,
    loginSchema
};