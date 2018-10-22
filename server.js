const fastify = require('fastify')();
const fastifyMongoDb = require('fastify-mongodb');
const jwt = require('fastify-jwt');
const fastifyNodeMailer = require('fastify-nodemailer');
const Ajv = require('ajv');


const allConfigs = require('./config');

const initRoutes = require('./src/resources');
const { initErrors } = require('./src/services/errors');



// SET UP CORRECT ENV VARIABLE WITH DEFAULT
if (!process.env.NODE_ENV || !['test', 'development', 'production'].includes(process.env.NODE_ENV))
    process.env.NODE_ENV = 'development';
console.log('NODE_ENV set to ', process.env.NODE_ENV);


const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    $data: true
});


// SERVER BOOT FUNCTION
async function buildFastify () {

    // SET CUSTOM AJV INSTANCE FOR SCHEMA COMPILATION
    fastify.setSchemaCompiler(schema => ajv.compile(schema));

    // INJECT CONFIG VARIABLES TO THE MAIN INSTANCE (fastify.config / this.config)
    fastify.decorate('config', allConfigs[process.env.NODE_ENV]);

    // JWT UTILITIES (fastify.jwt / this.jwt)
    fastify.register(jwt, { secret: fastify.config.jwtSecret });

    // NODEMAILER CONFIG (fastify.nodemailer / this.nodemailer)
    fastify.register(fastifyNodeMailer, fastify.config.mailer.nodemailerConf);

    // DATABASE CONNECTION (fastify.mongo / this.mongo => db, ObjectId, client)
    fastify.register(fastifyMongoDb, {
        useNewUrlParser: true,
        forceClose: true,      
        url: fastify.config.database.url
    });


    fastify.after(async err => {
        if (err) throw err;

        try {
            console.log('Connected to ' + fastify.config.database.url + '\n');

            // REST APIs REGISTRATION
            await initRoutes(fastify);

            // CUSTOM ERRORS HANDLER REGISTRATION
            initErrors(fastify);

        } catch (error) { throw err; }
    });

    return fastify;
};

module.exports = buildFastify;