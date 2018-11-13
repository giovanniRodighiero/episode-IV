const { errorTypes } = require('../resources/errors/schema');

const confirmedAccountMiddleware = function (request, reply, next) {
    if (!request.user.accountConfirmed) {
        reply.code(403);
        reply.send({ code: errorTypes.NOT_AUTHORIZED });
    } else {
        next();
    }
};

module.exports = confirmedAccountMiddleware;