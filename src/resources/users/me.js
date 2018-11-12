const meController = async function (request, reply) {
    reply.code(200);
    return request.user;
};

const meSchema = {
    summary: 'Returns the user profile',
    description: 'Given a valid access token, it returns the user profile',
    tags: ['Users'],
    response: {
        200: 'baseUser#'
    }
};

module.exports = {
    meController,
    meSchema
};