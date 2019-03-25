const { errorTypes } = require('../errors/schema');
const { baseProjection } = require('./collection');

const updateController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    
    // CHECK FOR VALID ID FORMAT
    if (!this.mongo.ObjectId.isValid(request.params.id)) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }

    const _id = new this.mongo.ObjectId(request.params.id);

    // CHECK FOR SAME PERSON ID
    if (request.user._id.equals(_id)) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }

    // CHECK FOR A ROLE UPDATE WITH A VALUE HIGHER THAN THE USER MAKING THE REQUEST
    if (request.body.role && request.body.role > request.user.role) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }

    const user = await Users.findOne({ _id }, { role: 1 });
    
    // CHECK FOR NON EXISTING USER
    if (!user) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND };
    }

    // CHECK FOR EQUALS OR HIGHER ROLE
    if (user.role >= request.user.role) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }

    // CHECK FOR NEW EMAIL ALREADY IN USE
    if (request.body.email) {
        const userWithProvidedEmail = await Users.findOne({ email: request.body.email }, baseProjection);
        if (!!userWithProvidedEmail) {
            reply.code(409);
            return { code: errorTypes.ALREADY_EXISTING };
        }
    }

    const { value: newUser } = await Users.findAndUpdateOne({ _id }, { $set: request.body }, { project: baseProjection });
    reply.code(200);
    return { code: 'success', data: newUser };

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

        403: 'baseError#',

        404: 'baseError#'
    }
};

module.exports = {
    updateController,
    updateSchema
};