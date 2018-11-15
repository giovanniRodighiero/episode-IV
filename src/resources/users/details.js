const { errorTypes } = require('../errors/schema');

const userProjection = {
    email: 1,
    role: 1,
    accountConfirmed: 1
};

const detailsController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { id } = request.params;

    // CHECK FOR VALID ID FORMAT
    if (!this.mongo.ObjectId.isValid(id)) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }

    const _id = new this.mongo.ObjectId(id);
    try {
        const user = await Users.findOne({ _id }, userProjection);
        // CHECK FOR EXISTING USER
        if (!user) {
            reply.code(404);
            return { code: errorTypes.NOT_FOUND };
        }

        reply.code(200);
        return user;

    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.INTERNAL_SERVER_ERROR };
    }
};

const detailsSchema = {
    summary: 'Returns a single user',
    description: 'Given the unique id of an existing user, it returns his profile',
    tags: ['Users'],

    params: {
        id: { type: 'string', description: 'The mongo id of the user' }
    },

    response: {
        400: 'baseError#',

        404: 'baseError#',

        200: 'baseUser#'
    }

};

module.exports = {
    detailsController,
    detailsSchema
};