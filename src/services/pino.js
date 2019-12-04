const {ENV} = require('../../config');

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

// SERIALIZERS
function res(res) {
    return {
        statusCode: res.statusCode
    };
}

function req(req) {
    if (req.url.includes('/documentations/'))
        return { url: req.url };

    // print only useful headers
    let headers = JSON.parse(JSON.stringify(req.headers)); // deep copy
    delete headers['connection'];
    delete headers['access-control-request-method'];
    delete headers['content-length'];
    delete headers['pragma'];
    delete headers['cache-control'];
    delete headers['accept'];
    delete headers['content-type'];
    delete headers['sec-fetch-site'];
    delete headers['sec-fetch-mode'];
    delete headers['accept-encoding'];
    delete headers['accept-language'];

    return {
        method: req.method,
        url: req.url,
        path: req.path,
        parameters: req.parameters,

        // TODO: use pino.redact for esclude private infos
        // Including the body and headers in the log could be in violation
        // of privacy laws, e.g. GDPR. You should use the "redact" option to
        // remove sensitive fields. It could also leak authentication data in
        // the logs.

        body: req.body,
        headers: headers,
    };
}

function err(error) {
    return {
        type: error.type,
        message: error.message,
        stack: error.stack,
        raw: error
    };
}


function buildOptions (env= process.env.NODE_ENV) {
    let options = {
        serializers: {
            res,
            req,
            err
        }
    };

    switch (env) {
        case ENV.TEST_DEBUG:
            options.level = 'debug';
            options.prettyPrint = prettyConfig;
            break;

        case ENV.TEST:
            options.level = 'warn';
            break;

        case ENV.DEVELOPMENT:
            options.level = 'debug';
            options.prettyPrint = prettyConfig;
            break;

        case ENV.STAGING:
            break;

        case ENV.PRODUCTION:
            break;
    }

    return options;
}

module.exports = buildOptions;
