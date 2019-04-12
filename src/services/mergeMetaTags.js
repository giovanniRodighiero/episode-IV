const settingsSchema = require('../resources/settings/schema');

const mergeMetaTags = (settingsMeta, pageMeta) => {
    const meta = {};
    settingsSchema.properties.meta.required.forEach(metaProperty => {
        meta[metaProperty] = !!pageMeta[metaProperty] ? pageMeta[metaProperty] : settingsMeta[metaProperty];
    });
    return meta;
};

module.exports = mergeMetaTags;