const { errorTypes } = require('../errors/schema');

const updateMeController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');

    const { email, _id } = request.user;
    try {
        // CHECK FOR ALREADY EXISTING EMAIL
        if (request.body.email && request.body.email !== email) {
            let user = await Users.findOne({ email: request.body.email }, { email: 1 });
            if (user) {
                reply.code(409);
                return { code: errorTypes.ALREADY_EXISTING };
            }
        }

        await Users.updateOne({ email }, { $set: request.body });
        user = await Users.findOne({ _id }, { email: 1, role: 1 });
        reply.code(200);
        return { code: 'success', user };
    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.NOT_AUTHENTICATED };
    }
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