
const init = function (fastify) {
    fastify.addHook('onSend', function (request, reply, payload, next) {
        if (request.raw.url.includes('/documentations/'))
            return next();

        if (request.raw.url.includes('/public/')) {
            fastify.log.debug('Serving Static file: ', payload.filename);
            return next();
        }

        if (payload)
            fastify.log.debug('Response body: ', payload);

        next();
    });

    fastify.addHook('preHandler', function (request, reply, next) {
        if (!request.raw.url.includes('/documentations/') && request.body)
            fastify.log.debug('Request body: ', request.body);

        next();
    });
};

module.exports = {
    init
};
