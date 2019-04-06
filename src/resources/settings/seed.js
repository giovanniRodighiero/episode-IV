// SETTINGS INFO
const settings = ({ projectName, address }) => ({
    meta: {
        image: `${address}/public/images/uploads/placeholder.png`,
        title: `${projectName} - meta title`,
        description: `${projectName} - meta description`,

        ogUrl: `${projectName} - og url`,
        ogTitle: `${projectName} - og title`,
        ogDescription: `${projectName} - og description`,

        twitterUrl: `${projectName} - twitter url`,
        twitterTitle: `${projectName} - twitter title`,
        twitterDescription: `${projectName} - twitter description`,
    },
    lang: 'it'
});


// CLEARS AND THE SETTINGS COLLECTION
async function seedSettings (database, config) {
    const Settings = database.collection('settings');
    try {
        await Settings.deleteMany({});

        await Settings.insertOne(settings(config));

        console.log('seeding settings done, no errors');
        return true;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    settings,
    seedSettings
};