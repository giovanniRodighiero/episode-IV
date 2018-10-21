const bootServer = require('./server');



const runServer = server => error => {
    if (error) {
        console.log(error);
        server.close();
    } else {
        console.log('running on port ' + server.config.port);
    }
}


bootServer()
    .then(server => server.ready(error => {
            if (error) {
                console.log(error);
                return;
            }

            const { port } = server.config;

            if (process.env.NODE_ENV === 'development')
                server.listen(port, '0.0.0.0', runServer(server));
            else
                server.listen(port, runServer(server));

        })
    )
    .catch(error => console.log(error));

