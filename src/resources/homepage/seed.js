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
        image: '',
        title: 'Homepage del sito',
        subtitle: 'Sottotitolo del sito lorem ipsum dolor acta est',
        description: 'Lorem ipsum dolor sit amet, consectetur adisci elit, sed do eiusmod tempor incint ut labore et dolore. lorem ipsum dolor sit amet, consectetur adisci elit, sed do eiusmod tempor incint ut labore et dolore. Lorem ipsum dolor sit amet, consectetur adisci elit, sed do eiusmod tempor incint ut labore et dolore'
    },

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