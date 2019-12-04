const { errorTypes } = require('../resources/errors/schema');

const roleMiddleware = minRole => function (request, reply, next) {
    if (request.user.role >= minRole) {
        request.log.debug(`Account role is allowed`);
        return next();
    }

    // Role not high enough
    request.log.debug(`Account role not allowed`);
    reply.code(403);
    reply.send({ code: errorTypes.NOT_AUTHORIZED });
};

module.exports = roleMiddleware;
