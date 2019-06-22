const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('./collection');

const updateController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    // CHECK FOR A ROLE UPDATE WITH A VALUE HIGHER THAN THE USER MAKING THE REQUEST
    if (request.body.role && request.body.role > request.user.role) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
    }
    
    // CHECK FOR VALID ID FORMAT
    if (!this.mongo.ObjectId.isValid(request.params.id)) {
        reply.code(404);
        return { code: errorTypes.NOT_FOUND, fieldName: 'id' };
    }

    const _id = new this.mongo.ObjectId(request.params.id);

    // CHECK FOR SAME PERSON ID
    if (request.user._id.equals(_id)) {
        reply.code(403);
        return { code: errorTypes.NOT_AUTHORIZED };
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
        return { code: errorTypes.NOT_AUTHORIZED, fieldName: 'role' };
    }

    // CHECK FOR NEW EMAIL ALREADY IN USE
    if (request.body.email) {
        const userWithProvidedEmail = await Users.findOne({ email: request.body.email }, USERS.baseProjection);
        if (!!userWithProvidedEmail) {
            reply.code(409);
            return { code: errorTypes.ALREADY_EXISTING, fieldName: 'email' };
        }
    }

    const { value } = await Users.findOneAndUpdate(
        { _id },
        { $set: request.body },
        { project: USERS.baseProjection, returnOriginal: false });
    reply.code(200);
    return value;

};

const updateSchema = {
    summary: 'Updates a user profile',
    description: 'Given a valid access token and a user id, it updates the specified user profile.',
    tags: ['Users'],

    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email', description: 'Email of the user to update' },
            role: { type: 'number', minimum: 70, description: 'New role to assign to the user' }
        }
    },

    response: {
        200: USERS.schemas.baseUserSchema,

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation errors'),

        403: generateErrorSchema(errorTypes.NOT_AUTHORIZED, 'Operation forbidden for the user role'),

        404: generateErrorSchema(errorTypes.NOT_FOUND, 'User not found for the specified id'),

        409: generateErrorSchema(errorTypes.ALREADY_EXISTING, 'Email address already in use')
    }
};

module.exports = {
    updateController,
    updateSchema
};