
const { ENV, config } = require('./config');

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

const swaggerConfig = require('./src/services/swagger');
const pinoConfig = require('./src/services/pino')();
const extraLogs = require('./src/middlewares/extraLogs');

// SET UP LOGGER
const fastify = require('fastify')({
    logger: pinoConfig
});

fastify.log.info(`NODE_ENV set to ${process.env.NODE_ENV}`);

let isBooted = false;

// SERVER BOOT FUNCTION
function boot () {
    if (isBooted)
        return fastify;

    // SETUP AJV KEYWORDS
    const ajv = new Ajv({
        removeAdditional: true,
        useDefaults: true,
        coerceTypes: true,
        $data: true
    });
    require('ajv-keywords')(ajv, 'transform');

    // CORS HANDLING
    fastify.register(cors);

    // CATCH UNHANDLEDREJECTION
    process.on('unhandledRejection', function (error) {
        fastify.log.error(error);
    });

    // SET CUSTOM AJV INSTANCE FOR SCHEMA COMPILATION
    fastify.setSchemaCompiler(schema => ajv.compile(schema));

    // DATABASE CONNECTION (fastify.mongo / this.mongo = { db, ObjectId, client })
    fastify.register(fastifyMongoDb, {
        useNewUrlParser: true,
        forceClose: true,
        useUnifiedTopology: true,
        url: config.database.url
    });

    // JWT UTILITIES (fastify.jwt / this.jwt)
    fastify.register(require('fastify-jwt'), { secret: config.jwtSecret });

    // fastify.decorate('secureAuth', require('./src/middlewares/authentication'));

    // NODEMAILER CONFIG (fastify.nodemailer / this.nodemailer)
    // fastify.register(fastifyNodeMailer, config.mailer.nodemailerConf);

    // DOCUMENTATION PLUGIN
    fastify.register(fastifySwagger, swaggerConfig);

    // LOG BODY, PINO CANNOT DO IT
    // if (process.env.NODE_ENV !== ENV.PRODUCTION)
    //     extraLogs.init(fastify);

    // REGISTER ROUTES/CUSTOM PLUGINS
    // fastify.register(fastifyPlugin(require('./src/resources/errors'), { name: 'errors' }));
    // fastify.register(require('./src/resources/authentication'), { name: 'authentication' });
    // fastify.register(require('./src/resources/users'), { name: 'users' });
        
    isBooted = true;
    return fastify;
}

module.exports = boot();