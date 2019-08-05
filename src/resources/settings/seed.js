const { SETTINGS } = require('./collection');

// SETTINGS INFO
const getSettingsSeed = ({ projectName, address, lang }) => ({
    meta: {
        image: `${address}/public/images/uploads/placeholder.png`,
        title: `[${lang}] ${projectName} - meta title`,
        description: `[${lang}] ${projectName} - meta description`,

        ogUrl: `${projectName} - og url`,
        ogTitle: `[${lang}] ${projectName} - og title`,
        ogDescription: `[${lang}] ${projectName} - og description`,

        twitterUrl: `${projectName} - twitter url`,
        twitterTitle: `[${lang}] ${projectName} - twitter title`,
        twitterDescription: `[${lang}] ${projectName} - twitter description`,
    }
});

const settingsWithLangs = {  };

// CLEARS AND SEED THE SETTINGS COLLECTION
async function seedSettings (database, config) {
    const Settings = database.collection(SETTINGS.collectionName);

    // push the seed data for each lang
    const { availableLangs } = config;
    availableLangs.forEach(lang => settingsWithLangs[lang] = getSettingsSeed({ ...config, lang }));

    try {
        await Settings.deleteMany({});

        await Settings.insertOne(settingsWithLangs);

        console.log('seeding settings done, no errors');
        return true;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    settingsWithLangs,
    seedSettings
};