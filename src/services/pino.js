const config = require('../../config');

// https://github.com/ovhemert/pino-stackdriver#readme pino plugin for google stackdriver


// pino logger level = 'fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'
/*
Use trace for internal logging that has a potentially high throughput.
Use debug for eventual debugging sessions you might need, but remember to remove them after you are finished.
Use info for regular application workflow logs.
Use warn for expected and frequent error conditions (like user input validation).
Use error for expected but infrequent error conditions (like network failures, database timeouts).
Use fatal for unexpected error conditions.
*/

// require additional package pino-pretty
const prettyConfig = {
    colorize: true,
    translateTime: "yyyy:mm:dd HH:MM:ss", // https://www.npmjs.com/package/dateformat
    ignore: 'pid,hostname', // 'pid,hostname,reqId'
};

function buildOptions () {
    let options = {
        serializers: {
            res(res) {
                return {
                    statusCode: res.statusCode
                }
            },
            req(req) {
                if (req.url.includes('/documentations/'))
                    return {
                        url: req.url
                    };

                return {
                    method: req.method,
                    url: req.url,
                    path: req.path,
                    parameters: req.parameters,
                    // TODO: use pino.redact
                    // Including the body and headers in the log could be in violation
                    // of privacy laws, e.g. GDPR. You should use the "redact" option to
                    // remove sensitive fields. It could also leak authentication data in
                    // the logs.
                    body: req.body,
                    headers: req.headers,
                };
            },
            err(error) {
                return {
                    type: error.type,
                    message: error.message,
                    stack: error.stack,
                    raw: error
                }
            }
        }
    };

    switch (process.env.NODE_ENV) {
        case 'test-debug':
            options.level = 'debug';
            options.prettyPrint = prettyConfig;
            break;

        case 'test':
            options.level = 'warn';
            break;

        case 'development':
            options.level = 'debug';
            options.prettyPrint = prettyConfig;
            break;

        case 'staging':
            break;

        case 'production':
            break;
    }

    return options;
}

module.exports = buildOptions();
