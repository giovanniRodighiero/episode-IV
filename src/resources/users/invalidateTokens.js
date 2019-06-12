const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('./collection');

const invalidateTokensController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { ObjectId } = this.mongo;
    const { users } = request.body;

    const ids = [];

    try {
        users.forEach( user => {
            // AVOIDING AUTO-LOGOUT :)
            if (request.user._id.toString() !== user)
                ids.push(new ObjectId(user));
        });
    } catch (error) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR, fieldName: 'users' };
    }

    await Users.updateMany({ _id: { $in: ids } }, { $set: { tokenMinValidity: Date.now() } });

    return { code: 'success' };

};

const invalidateTokensSchema = {
    summary: 'Invalidates a specific or a list of access tokens',
    description: 'Given a list of valid user ids, it invalidates all the access token issued before the moment of execution. In case of the id of the person making the request, the id is ignored.',
    tags: ['Users'],

    body: {
        type: 'object',
        required: ['users'],
        properties: {
            users: {
                type: 'array', description: 'An array of users id',
                uniqueItems: true,
                items: { type: 'string' }
            }
        }
    },

    response: {
        200: {
            description: 'Tokens invalidated successfully',
            type: 'object',
            properties: {
                code: { type: 'string' }
            }
        },

        400: generateErrorSchema([errorTypes.VALIDATION_ERROR, errorTypes.MISSING_PARAM], 'Missing params or invalid user id specified')
    }
};

module.exports = {
    invalidateTokensController,
    invalidateTokensSchema
};