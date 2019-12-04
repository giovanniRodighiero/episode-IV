
const {ENV} = require('./config');

// SET UP CORRECT ENV VARIABLE WITH DEFAULT
if (!process.env.NODE_ENV || !ENV.AVAILABLE.includes(process.env.NODE_ENV))
    process.env.NODE_ENV = ENV.DEFAULT;

const fastifyMongoDb = require('fastify-mongodb');
const fastifyPlugin = require('fastify-plugin');
const jwt = require('fastify-jwt');
const fastifyNodeMailer = require('fastify-nodemailer');
const fastifySwagger = require('fastify-swagger');
const cors = require('fastify-cors');
const Ajv = require('ajv');

const config = require('./config').config();
const swaggerConfig = require('./src/services/swagger');
const pinoConfig = require('./src/services/pino')();
const extraLogs = require('./src/middlewares/extraLogs');

// SET UP LOGGER
const fastify = require('fastify')({
    logger: pinoConfig
});

fastify.log.info(`NODE_ENV set to ${process.env.NODE_ENV}`);

// SETUP AJV KEYWORDS
const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    $data: true
});
require('ajv-keywords')(ajv, 'transform');


// SERVER BOOT FUNCTION
 function buildFastify () {
    // CATCH UNHANDLEDREJECTION
    process.on('unhandledRejection', function (error) {
        fastify.log.error(error);
    });

    // SET CUSTOM AJV INSTANCE FOR SCHEMA COMPILATION
    fastify.setSchemaCompiler(schema => ajv.compile(schema));

    // INJECT CONFIG VARIABLES TO THE MAIN INSTANCE (fastify.config / this.config)
    fastify.decorate('config', config);

    // CORS HANDLING
    fastify.register(cors);

    // JWT UTILITIES (fastify.jwt / this.jwt)
    fastify.register(fastifyPlugin(async function (fastify) {
        fastify.register(jwt, {
            secret: fastify.config.jwtSecret,
            // messages: {
            //     noAuthorizationInHeaderMessage: errorTypes.NOT_AUTHENTICATED,
            //     badRequestErrorMessage: errorTypes.NOT_AUTHENTICATED,
            //     authorizationTokenInvalid: _ => errorTypes.NOT_AUTHENTICATED,
            //     authorizationTokenExpiredMessage: errorTypes.NOT_AUTHENTICATED
            // }
        });
        fastify.decorate('secureAuth', require('./src/middlewares/authentication'));
    }));

    // NODEMAILER CONFIG (fastify.nodemailer / this.nodemailer)
    fastify.register(fastifyNodeMailer, fastify.config.mailer.nodemailerConf);

    // DOCUMENTATION PLUGIN
    fastify.register(fastifySwagger, swaggerConfig);

    // DATABASE CONNECTION (fastify.mongo / this.mongo = { db, ObjectId, client })
    fastify.register(fastifyMongoDb, {
        useNewUrlParser: true,
        forceClose: true,      
        url: fastify.config.database.url
    });

     // LOG BODY, PINO CANNOT DO IT
     if (process.env.NODE_ENV !== ENV.PRODUCTION)
         extraLogs.init(fastify);

    // REGISTER ROUTES/CUSTOM PLUGINS
    fastify.register(fastifyPlugin(require('./src/resources/errors'), { name: 'errors' }));
    fastify.register(require('./src/resources/users'), { name: 'users' });
    fastify.register(require('./src/resources/authentication'), { name: 'authentication' });

    return fastify;
}

module.exports = buildFastify;
