const { errorTypes } = require('../errors/schema');


const PER_PAGE = 20;
const userProjection = {
    email: 1,
    role: 1,
    accountConfirmed: 1
};

const listController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');

    // PAGINATION OPTIONS
    const { perPage = PER_PAGE , page = 1 } = request.query;

    const [ totalCount, data ] = await Promise.all([
        Users.countDocuments({ role: { $lt: request.user.role } }),
        Users
            .find({ role: { $lt: request.user.role } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .project(userProjection)
            .toArray(),
    ]);

    const response = {
        totalCount,
        currentPage: page,
        data
    };

    // PAGINATION CALCS ...
    let availablePages = Math.floor(totalCount / perPage);
    if (totalCount % perPage !== 0)
        availablePages = availablePages + 1;
    response['availablePages'] = availablePages;

    if (page < availablePages)
        response.nextPage = page + 1;
    
    reply.code(200);
    return response;
};

const listSchema = {
    summary: 'Users list [ ROLE >= 80 ]',
    description: 'List of all users with a role lower than the user requesting it',
    tags: ['Users'],

    querystring: {
        perPage: {
            type: 'integer',
            minimum: 1,
            description: 'How many users per page',
            default: PER_PAGE
        },
        page: {
            type: 'number',
            minimum: 1,
            description: 'Which page',
            default: 1
        }
    },

    response: {
        200: {
            type: 'object',
            required: ['totalCount', 'availablePages', 'currentPage', 'data'],
            properties: {
                totalCount: { type: 'number' },
                availablePages: { type: 'number' },
                currentPage: { type: 'number' },
                nextPage: { type: 'number' },
                data: {
                    type: 'array',
                    uniqueItems: true,
                    items: 'baseUser#'
                }
            },
            description: 'List of all users with pagination and filters'
        },

        400: 'baseError#'
    }
};

module.exports = {
    listController,
    listSchema
};