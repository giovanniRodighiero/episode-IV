// timestamp (Boolean | Function) default true
// useLevelLabels default false

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

const defaultConfig = {
    level: 'debug',
    prettyPrint: { // require additional package
        colorize: true,
        // crlf: false, // default
        // levelFirst: true, // default false
        // messageKey: 'msg', // default
        translateTime: "yyyy:mm:dd HH:MM:ss", // https://www.npmjs.com/package/dateformat // TODO check timezone (set to +1, need a localtimestamp)
        ignore: 'pid,hostname',
    },

    serializers: { // SLOW DOWN PINO, ONLY ON DEV-TEST
        res(res) {
            return {
                statusCode: res.statusCode,
                // body: res.raw, // there is no body-payload on res, need hook onSend
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
                // Including the body and headers in the log could be in violation
                // of privacy laws, e.g. GDPR. You should use the "redact" option to
                // remove sensitive fields. It could also leak authentication data in
                // the logs.
                body: req.body,
                headers: req.headers,
            };
        },
        err(err) {
            return {
                type: err.type,
                message: err.message,
                stack: err.stack,
            }
        }
    }
};

const development = { ...defaultConfig };

const test = {
    ...defaultConfig,
    level: 'warn',
    prettyPrint: {
        ...defaultConfig.prettyPrint,
        ignore: 'pid,hostname,reqId',
    }
};

const staging = { ...defaultConfig, level: 'info'};


const production = { ...defaultConfig, level: 'info' };

module.exports = {
    development,
    test,
    staging,
    production
};