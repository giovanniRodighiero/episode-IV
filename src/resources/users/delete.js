const { errorTypes } = require('../errors/schema');
const { baseProjection } = require('./collection');

const deleteController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { id } = request.params;

    // CHECK FOR VALID ID FORMAT
    if (!this.mongo.ObjectId.isValid(id)) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }
    
    const _id = new this.mongo.ObjectId(id);

    // CHECK FOR SAME PERSON ID
    if (request.user._id.equals(_id)) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }

    const userToDelete = await Users.findOne({ _id }, baseProjection);
    
    // CHECK FOR EXISTING USER
    if (!userToDelete) {
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
        400: 'baseError#',
        403: 'baseError#',
        404: 'baseError#',
    }
};

module.exports = {
    deleteController,
    deleteSchema
};