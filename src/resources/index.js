const initErrors = require('./errors');
const initUsers = require('./users');
const initAuthentication = require('./authentication');
const initSettings = require('./settings');
const initUploder = require('./uploader');
const initPages = require('./pages');
const initHomepage = require('./homepage');


async function initResources (fastify) {
    
    initErrors(fastify);
    initSettings(fastify);
    initUploder(fastify);
    await initUsers(fastify);
    initAuthentication(fastify);
    await initPages(fastify);
    initHomepage(fastify);

    return true;
};


module.exports = initResources;