const fastify = require('fastify')();
const fastifyMongoDb = require('fastify-mongodb');
const jwt = require('fastify-jwt');
const fastifyNodeMailer = require('fastify-nodemailer');
const fastifySwagger = require('fastify-swagger');
const cors = require('fastify-cors');
const Ajv = require('ajv');
const path = require('path');
const fastifyStatic = require('fastify-static');

const resolve = path.resolve;


const allConfigs = require('./config');
const swaggerConfig = require('./src/services/swagger');

const initRoutes = require('./src/resources');


// SET UP CORRECT ENV VARIABLE WITH DEFAULT
if (!process.env.NODE_ENV || !['test', 'development', 'production'].includes(process.env.NODE_ENV))
process.env.NODE_ENV = 'development';
console.log('NODE_ENV set to ', process.env.NODE_ENV);


// SETUP AJV KEYWORDS
const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    $data: true
});
require('ajv-keywords')(ajv, 'transform');


// SERVER BOOT FUNCTION
async function buildFastify () {
    
    // FRONTEND HTML TEMPLATES
    fastify.register(require('point-of-view'), {
        engine: {
            ejs: require('ejs'),
        },
        templates: './src/views',
        options: {
            filename: resolve('./src/views')
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


    fastify.after(async err => {
        if (err) throw err;

        try {
            console.log('Connected to ' + fastify.config.database.url + '\n');

            // REST APIs REGISTRATION
            await initRoutes(fastify);

        } catch (error) { throw err; }
    });

    return fastify;
};

module.exports = buildFastify;