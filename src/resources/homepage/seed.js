const loremIpsum = require('lorem-ipsum').loremIpsum;

const { HOMEPAGE } = require('./collection');

const getHomepageSeed = lang => ({
    meta: {
        image: '',
        title: `[${lang}] homepage - meta title`,
        description: `[${lang}] homepage - meta description`,

        ogUrl: `[${lang}] homepage - og url`,
        ogTitle: `[${lang}] homepage - og title`,
        ogDescription: `[${lang}] homepage - og description`,

        twitterUrl: `[${lang}] homepage - twitter url`,
        twitterTitle: `[${lang}] homepage - twitter title`,
        twitterDescription: `[${lang}] homepage - twitter description`,
    },

    hero: {
        imageDesktop: 'https://source.unsplash.com/1600x900',
        imageMobile: 'https://source.unsplash.com/960x1600',
        title: `[${lang}] ` + loremIpsum({ count: 3, units: 'words' }),
        subtitle: `[${lang}]` + loremIpsum({ count: 10, units: 'words' }),
        description: `[${lang}]` + loremIpsum({ count: 3, units: 'sentences' })
    },

    services: {
        title: loremIpsum({ count: 5, units: 'words' }),
        items: [
            {
                title: loremIpsum({ count: 3, units: 'words' }),
                description: loremIpsum({ count: 3, units: 'sentences' }),
                image: 'https://source.unsplash.com/800x601',
                position: 0
            },
            {
                title: loremIpsum({ count: 3, units: 'words' }),
                description: loremIpsum({ count: 3, units: 'sentences' }),
                image: 'https://source.unsplash.com/800x602',
                position: 1
            },
            {
                title: loremIpsum({ count: 3, units: 'words' }),
                description: loremIpsum({ count: 3, units: 'sentences' }),
                image: 'https://source.unsplash.com/800x603',
                position: 2
            }
        ]
    },

    cta: {
        title: loremIpsum({ count: 5, units: 'words' }),
        link: '#'
    }
});

const homepageWithLangs = { code: HOMEPAGE.code };

// CLEARS AND SEED THE HOMEPAGE PAGE
async function seedHomepage (database, config) {
    const Pages = database.collection(HOMEPAGE.collectionName);
    
    // push the seed data for each lang
    const { availableLangs } = config;
    availableLangs.forEach(lang => homepageWithLangs[lang] = getHomepageSeed(lang));

    try {
        await Pages.deleteOne({ code: HOMEPAGE.code });

        await Pages.insertOne(homepageWithLangs);

        console.log('seeding homepage done, no errors');
        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    homepageWithLangs,
    seedHomepage
};