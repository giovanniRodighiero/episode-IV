const fastifyMongoDb = require('fastify-mongodb');
const fastifyPlugin = require('fastify-plugin');
const jwt = require('fastify-jwt');
const fastifyNodeMailer = require('fastify-nodemailer');
const fastifySwagger = require('fastify-swagger');
const cors = require('fastify-cors');
const Ajv = require('ajv');
const path = require('path');
const fastifyStatic = require('fastify-static');
const multipart = require('fastify-multipart');

const resolve = path.resolve;

const allConfigs = require('./config');
const swaggerConfig = require('./src/services/swagger');
const pinoConfig = require('./src/services/pino');


const ALLOWED_ENVIRONMENT = Object.keys(allConfigs);

// SET UP CORRECT ENV VARIABLE WITH DEFAULT
if (!process.env.NODE_ENV || !ALLOWED_ENVIRONMENT.includes(process.env.NODE_ENV))
process.env.NODE_ENV = 'development';
console.log('NODE_ENV set to ', process.env.NODE_ENV);

// SET UP LOGGER
const fastify = require('fastify')({
    logger: pinoConfig[process.env.NODE_ENV]
});

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

    // MULTIPART TO HANDLE FILE UPLOAD
    fastify.register(multipart);
    
    // FRONTEND HTML TEMPLATES
    fastify.register(require('point-of-view'), {
        engine: {
            ejs: require('ejs'),
        },
        templates: './src/frontend/views',
        options: {
            filename: resolve('./src/frontend/views')
        }
    });

    // PUBLIC FILE SERVING
    fastify.register(fastifyStatic, {
        root: path.join(__dirname, 'public'),
        prefix: '/public/',
    });

    // SET CUSTOM AJV INSTANCE FOR SCHEMA COMPILATION
    fastify.setSchemaCompiler(schema => ajv.compile(schema));

    // INJECT CONFIG VARIABLES TO THE MAIN INSTANCE (fastify.config / this.config)
    fastify.decorate('config', allConfigs[process.env.NODE_ENV]);

    // CORS HANDLING
    fastify.register(cors);

    // JWT UTILITIES (fastify.jwt / this.jwt)
    fastify.register(jwt, { secret: fastify.config.jwtSecret });

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

    // REGISTER ROUTES/CUSTOM PLUGINS
    
    // misc
    fastify.register(fastifyPlugin(require('./src/resources/errors'), { name: 'errors' }));
    fastify.register(require('./src/resources/users'), { name: 'users' });
    fastify.register(require('./src/resources/authentication'), { name: 'authentication' });
    fastify.register(require('./src/resources/settings'), { name: 'settings' });
    fastify.register(require('./src/resources/uploader'), { name: 'uploader' });

    // cms
    fastify.register(require('./src/resources/pages'), { name: 'pages' } );
    fastify.register(require('./src/resources/homepage'), { name: 'homepage' } );

    return fastify;
};

module.exports = buildFastify;