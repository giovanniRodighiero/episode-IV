const { encrypt } = require('node-password-encrypter');

const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('./collection');

const updateMePasswordController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { password } = request.body;
    const { _id } = request.user;

    const { salt, encryptedContent } = await encrypt({ content: password, keylen: 128, iterations: 1000 });
    await Users.updateOne({ _id }, { $set: { salt, password: encryptedContent } });
    
    reply.code(200);
    return { code: 'success' };

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
            confirmPassword: { const: { '$data': '1/password' }, type: 'string' },
        },
        additionalProperties: false
    },

    response: {
        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation error'),

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