const fastify = require('fastify')();
const fastifyMongoDb = require('fastify-mongodb');
const jwt = require('fastify-jwt');

const allConfigs = require('./config');

const initRoutes = require('./src/resources');
const { initErrors } = require('./src/services/errors');



// SET UP CORRECT ENV VARIABLE WITH DEFAULT
if (!process.env.NODE_ENV || !['test', 'development', 'production'].includes(process.env.NODE_ENV))
    process.env.NODE_ENV = 'development';
console.log('NODE_ENV set to ', process.env.NODE_ENV);



// SERVER BOOT FUNCTION
async function buildFastify () {



    // INJECT CONFIG VARIABLES TO THE MAIN INSTANCE
    // (inside a controller it's available under this.config)
    fastify.decorate('config', allConfigs[process.env.NODE_ENV]);

    // REGISTER JWT UTILITIES
    fastify.register(jwt, { secret: fastify.config.jwtSecret });

    // DATABASE CONNECTION
    // (inside a controller it's available under this.mongo.db, as well as this.mongo.ObjectId and this.mongo.client)
    fastify.register(fastifyMongoDb, {
        useNewUrlParser: true,
        forceClose: true,      
        url: fastify.config.database.url
    });


    fastify.after(async err => {
        if (err) throw err;

        try {
            console.log('connected')

            // REST APIs REGISTRATION
            await initRoutes(fastify);

            // INJECT CUSTOM ERRORS HANDLER
            initErrors(fastify);

        } catch (error) { throw err; }
    });

    return fastify;
};

module.exports = buildFastify;