const { errorTypes } = require('../errors/schema');
const { baseProjection } = require('./collection');

const updateMeController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');

    const { email } = request.user;

    // CHECK FOR ALREADY EXISTING EMAIL
    if (request.body.email && request.body.email !== email) {
        let user = await Users.findOne({ email: request.body.email }, { email: 1 });
        if (user) {
            reply.code(409);
            return { code: errorTypes.ALREADY_EXISTING };
        }
    }

    const { value: user } = await Users.findOneAndUpdate(
        { email },
        { $set: request.body },
        { project: baseProjection, returnOriginal: false }
    );
    reply.code(200);
    return { code: 'success', user };

};

const updateMeSchema = {
    summary: 'Updates the user profile informations',
    description: 'Given a valid access token, updates the associated user profile informations',
    tags: ['Users'],

    body: {
        type: 'object',
        properties: {
            email: { type: 'string', description: 'User email, also used in login' }
        }
    },

    response: {
        200: {
            type: 'object',
            required: ['code', 'user'],
            properties: {
                code: { type: 'string' },
                user: 'baseUser#'
            }
        },

        409: 'baseError#',
    }

};

module.exports = {
    updateMeController,
    updateMeSchema
};