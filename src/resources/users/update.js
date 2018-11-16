const { errorTypes } = require('../errors/schema');

const userProjection = {
    email: 1,
    role: 1,
    accountConfirmed: 1
};

const updateController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    
    // CHECK FOR VALID ID FORMAT
    if (!this.mongo.ObjectId.isValid(request.params.id)) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }

    const _id = new this.mongo.ObjectId(request.params.id);

    try {
        // CHECK FOR NON EXISTING USER
        const user = await Users.findOne({ _id }, {});
        if (!user) {
            reply.code(404);
            return { code: errorTypes.NOT_FOUND };
        }

        await Users.updateOne({ _id }, { $set: request.body });
        const newUser = await Users.fineOne({ _id }, userProjection);
        reply.code(200);
        return { code: 'success', data: newUser };

    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.INTERNAL_SERVER_ERROR };        
    }
};

const updateSchema = {
    summary: 'Updates a user profile',
    description: 'Given a valid access token and a user id, it updates the specified user profile.',
    tags: ['Users'],

    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
            role: { type: 'number', minimum: 70 }
        }
    },

    response: {
        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            }
        },

        400: 'baseError#',

        404: 'baseError#'
    }
};

module.exports = {
    updateController,
    updateSchema
};