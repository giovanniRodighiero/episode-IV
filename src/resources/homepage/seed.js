const loremIpsum = require('lorem-ipsum').loremIpsum;

const homepage = {
    code: 'homepage',

    meta: {
        image: '',
        title: `homepage - meta title`,
        description: `homepage - meta description`,

        ogUrl: `homepage - og url`,
        ogTitle: `homepage - og title`,
        ogDescription: `homepage - og description`,

        twitterUrl: `homepage - twitter url`,
        twitterTitle: `homepage - twitter title`,
        twitterDescription: `homepage - twitter description`,
    },

    hero: {
        imageDesktop: 'https://source.unsplash.com/1600x900',
        imageMobile: 'https://source.unsplash.com/960x1600',
        title: loremIpsum({ count: 3, units: 'words' }),
        subtitle: loremIpsum({ count: 10, units: 'words' }),
        description: loremIpsum({ count: 3, units: 'sentences' })
    },

    services: {
        title: loremIpsum({ count: 5, units: 'words' }),
        items: [
            {
                title: loremIpsum({ count: 3, units: 'words' }),
                description: loremIpsum({ count: 3, units: 'sentences' }),
                image: 'https://source.unsplash.com/800x601'
            },
            {
                title: loremIpsum({ count: 3, units: 'words' }),
                description: loremIpsum({ count: 3, units: 'sentences' }),
                image: 'https://source.unsplash.com/800x602'
            },
            {
                title: loremIpsum({ count: 3, units: 'words' }),
                description: loremIpsum({ count: 3, units: 'sentences' }),
                image: 'https://source.unsplash.com/800x603'
            }
        ]
    },

    cta: {
        title: loremIpsum({ count: 5, units: 'words' }),
        link: '#'
    }
};


// CLEARS AND SEED THE HOMEPAGE PAGE
async function seedHomepage (database, config) {
    const Pages = database.collection('pages');

    try {
        await Pages.deleteOne({ code: 'homepage' });

        await Pages.insertOne(homepage);

        console.log('seeding homepage done, no errors');
        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    homepage,
    seedHomepage
};