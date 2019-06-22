const { baseSettingsSchema } = require('../resources/settings/schema');

const mergeMetaTags = (settingsMeta, pageMeta) => {
    const meta = {};
    baseSettingsSchema.properties.meta.required.forEach(metaProperty => {
        meta[metaProperty] = !!pageMeta[metaProperty] ? pageMeta[metaProperty] : settingsMeta[metaProperty];
    });
    return meta;
};

module.exports = mergeMetaTags;