const { encrypt } = require('node-password-encrypter');

const { errorTypes } = require('../errors/schema');



const updateMePasswordController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { password } = request.body;
    const { _id } = request.user;

    try {
        const { salt, encryptedContent } = await encrypt({ content: password, keylen: 128, iterations: 1000 });
        await Users.updateOne({ _id }, { $set: { salt, password: encryptedContent } });
        
        reply.code(200);
        return { code: 'success' };
    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.INTERNAL_SERVER_ERROR };
    }
};

const updateMePasswordSchema = {
    summary: 'Updates the user\'s password',
    description: 'Given a valid access token of a confirmed account, it changes the current password',
    tags: ['Users'],

    body: {
        type: 'object',
        required: ['password', 'confirmPassword'],
        properties: {
            password: { type: 'string', transform: ['trim'] },
            confirmPassword: { const: { '$data': '1/password' } },
        },
        additionalProperties: false
    },

    response: {
        400: 'baseError#',

        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            }
        }
    }
};

module.exports = {
    updateMePasswordController,
    updateMePasswordSchema
};