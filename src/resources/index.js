const initErrors = require('./errors');
const initUsers = require('./users');
const initAuthentication = require('./authentication');
const initSettings = require('./settings');


async function initResources (fastify) {
    initErrors(fastify);
    await initUsers(fastify);
    initAuthentication(fastify);
    initSettings(fastify);
    
    return true;
};


module.exports = initResources;