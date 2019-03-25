const { errorTypes } = require('../errors/schema');

const { baseProjection } = require('./collection');


const detailsController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { id } = request.params;

    // CHECK FOR VALID ID FORMAT
    if (!this.mongo.ObjectId.isValid(id)) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }

    const _id = new this.mongo.ObjectId(id);
    const user = await Users.findOne({ _id }, baseProjection);
    
    // CHECK FOR EXISTING USER
    if (!user) {
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
        400: 'baseError#',

        403: 'baseError#',

        404: 'baseError#',

        200: 'baseUser#'
    }

};

module.exports = {
    detailsController,
    detailsSchema
};