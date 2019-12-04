const initErrors = require('./errors');
const initUsers = require('./users');
const initAuthentication = require('./authentication');

async function initResources (fastify) {
    
    await initErrors(fastify);
    await initUsers(fastify);
    await initAuthentication(fastify);

    return true;
}

module.exports = initResources;
