const { SETTINGS } = require('../resources/settings/collection');

const settingsMiddleware = async function (request, reply, next) {
    const Settings = this.mongo.db.collection(SETTINGS.collectionName);

    const settings = await Settings.findOne({ });
    request.settings = settings;
    return;
};

module.exports = settingsMiddleware;