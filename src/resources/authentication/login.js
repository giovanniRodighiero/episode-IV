const { compare } = require('node-password-encrypter');
const { errorTypes } = require('../errors/schema');



const loginController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { email, password } = request.body;

    try {
        const user = await Users.findOne({ email }, { password: 1, email: 1, accountConfirmed: 1 });
        if (!user) {
            reply.code(404);
            return { code: errorTypes.NOT_FOUND };
        }

        if (!user.accountConfirmed) {
            reply.code(403);
            return { code: errorTypes.NOT_CONFIRMED };
        }

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

        // GENERATING NEW ACCESS TOKEN
        this.jwt.sign(
            {
                email: user.email,
                _id: user._id,
                role: user.role
            },
            {
                expiresIn: '60 days'
            },
        (err, token) => {
            if (err) {
                reply.code(500);
                return err;
            }

            reply.code(200);
            reply.send({ token, user });
        }); 

    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.INTERNAL_SERVER_ERROR };
    }
};

const loginSchema = {

    description: 'Used to obtain an authentication token, which allows to perform successful requests to protected APIs',
    tags: ['Authentication'],
    summary: 'Users login',

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
                user: 'baseUser#'
            }
        },

        400: 'baseError#',

        401: 'baseError#',

        404: 'baseError#'
    }

};



module.exports = {
    loginController,
    loginSchema
};