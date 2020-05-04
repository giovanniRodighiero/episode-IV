if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'development';

if (!process.env.TZ)
    process.env.TZ = 'Europe/Rome';
    
const { fastify, boot } = require('./server');

const runServer = error => error ? fastify.close() : null;

boot()
    .then(_ => {
        if (process.env.NODE_ENV === 'development')
            fastify.listen(fastify.config.port, '0.0.0.0', runServer);
        else
            fastify.listen(astify.config.port, runServer);
    })
    .catch(error => console.log(error))