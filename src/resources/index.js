const initErrors = require('./errors');
const initUsers = require('./users');
const initAuthentication = require('./authentication');



async function initResources (fastify) {
    initErrors(fastify);
    await initUsers(fastify);
    initAuthentication(fastify);

    return true;
};


module.exports = initResources;