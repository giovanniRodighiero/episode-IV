const { errorTypes } = require('../resources/errors/schema');

const settingsMiddleware = function (request, reply, next) {
    const Settings = this.mongo.db.collection('settings');

    Settings.findOne({ })
        .then(settings => {
            request.settings = settings;
            next();
        })
        .catch(error => {
            console.log(error);
            reply.status(500);
            reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
        });
};

module.exports = settingsMiddleware;