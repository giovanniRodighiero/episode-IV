const { errorTypes, generateErrorSchema } = require('../errors/schema');

const { USERS } = require('./collection');


const detailsController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);
    const { id } = request.params;

    let _id, user;

    try {
        _id = new this.mongo.ObjectId(id);
        user = await Users.findOne({ _id }, USERS.baseProjection);
        if (!user)
            throw new Error();
    } catch (error) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND };
    }

    // CHECK FOR HIGHER ROLE
    if (user.role >= request.user.role) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }

    reply.code(200);
    return user;
};

const detailsSchema = {
    summary: 'Returns a single user.',
    description: 'Given the unique id of an existing user, it returns his profile.',
    tags: ['Users'],

    params: {
        id: { type: 'string', description: 'The mongo id of the user' }
    },

    response: {
        200: USERS.schemas.baseUserSchema,

        403: generateErrorSchema([errorTypes.NOT_AUTHORIZED], 'Operation not allowed for the current user.'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found for the provided id.')
    }

};

module.exports = {
    detailsController,
    detailsSchema
};