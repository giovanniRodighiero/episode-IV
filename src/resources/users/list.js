const PER_PAGE = 20;

const { USERS } = require('./collection');

const listController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    // PAGINATION OPTIONS
    const { perPage = PER_PAGE , page, sort, sortDir } = request.query;

    const [ totalCount, data ] = await Promise.all([
        Users.countDocuments({ role: { $lt: request.user.role } }),
        Users
            .find({ role: { $lt: request.user.role } })
            .sort({ [sort]: sortDir })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .project(USERS.baseProjection)
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
        },
        sort: {
            type: 'string',
            enum: ['email', 'role', 'accountConfirmed'],
            description: 'Sorting field',
            default: 'email'
        },
        sortDir: {
            type: 'number',
            enum: [-1, 1],
            description: 'Sorting direction',
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
                    items: USERS.schemas.baseUserSchema
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