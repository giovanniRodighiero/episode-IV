const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('./collection');

const deleteController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { id } = request.params;

    let _id, userToDelete;
    
    try {

        _id = new this.mongo.ObjectId(id);

        // CHECK FOR SAME PERSON ID
        if (request.user._id.equals(_id)) {
            reply.code(403);
            return { code: errorTypes.NOT_AUTHORIZED };
        }

        userToDelete = await Users.findOne({ _id }, USERS.baseProjection);
        if (!userToDelete)
            throw new Error();

    } catch (error) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND };
    }

    // CHECK FOR EQUALS OR HIGHER ROLE
    if (userToDelete.role >= request.user.role) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }
    
    // PERFORME DELETE
    await Users.deleteOne({ _id });

    reply.code(204);
    return;
};

const deleteSchema = {
    summary: 'Delets a single user. [ROLE >= 80]',
    description: 'Given the unique id of an existing user, it deletes his profile.',
    tags: ['Users'],

    params: {
        id: { type: 'string', description: 'The mongo id of the user' }
    },

    response: {
        204: {
            description: 'User deleted successfully',
            type: 'null'
        },
        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation errors'),
        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found for the provided id')
    }
};

module.exports = {
    deleteController,
    deleteSchema
};