const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('./collection');

const updateMeController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { email } = request.user;

    // CHECK FOR ALREADY EXISTING EMAIL
    if (request.body.email && request.body.email !== email) {
        const user = await Users.findOne({ email: request.body.email }, { email: 1 });
        if (user) {
            reply.code(409);
            return { code: errorTypes.ALREADY_EXISTING, fieldName: 'email' };
        }
    }

    const { value } = await Users.findOneAndUpdate(
        { email },
        { $set: request.body },
        { projection: USERS.baseProjection, returnOriginal: false }
    );

    reply.code(200);
    return { code: 'success', user: value };

};

const updateMeSchema = {
    summary: 'Updates the user profile informations',
    description: 'Given a valid access token, updates the associated user profile informations',
    tags: ['Users'],

    body: {
        type: 'object',
        properties: {
            email: { type: 'string', description: 'User email, also used in login' }
        },
        removeAdditionals: true
    },

    response: {
        200: {
            type: 'object',
            required: ['code', 'user'],
            properties: {
                code: { type: 'string' },
                user: USERS.schemas.baseUserSchema
            }
        },

        409: generateErrorSchema(errorTypes.ALREADY_EXISTING, 'Email address already in use'),
    }

};

module.exports = {
    updateMeController,
    updateMeSchema
};