const initErrors = require('./errors');
const initUsers = require('./users');
const initAuthentication = require('./authentication');
const initHomepage = require('./homepage');


async function initResources (fastify) {
    initErrors(fastify);
    await initUsers(fastify);
    initAuthentication(fastify);
    initHomepage(fastify);

    return true;
};


module.exports = initResources;