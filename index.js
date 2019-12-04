const server = require('./server')();
const {ENV} = require('./config');

const runServer = (error, address) => {
    if (error) {
        server.log.error(error);
        return server.close();
    } else {
        server.log.info(`running on port ${address}`);
    }
};
    
if (process.env.NODE_ENV === ENV.DEVELOPMENT)
    server.listen(server.config.port, '0.0.0.0', runServer);
else
    server.listen(server.config.port, runServer);
