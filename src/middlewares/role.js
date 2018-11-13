const { errorTypes } = require('../resources/errors/schema');

const roleMiddleware = minRole => function (request, reply, next) {
    if (request.user.role >= minRole)
        next();
    else {
        reply.code(403);
        reply.send({ code: errorTypes.NOT_AUTHORIZED });
    }
};

module.exports = roleMiddleware;