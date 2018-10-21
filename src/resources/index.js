const initUsers = require('./users');
const initAuthentication = require('./authentication');




async function initResources (fastify) {
    await initUsers(fastify);
    initAuthentication(fastify);

    return true;
};


module.exports = initResources;