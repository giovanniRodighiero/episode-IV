const indexes = [
    [ { code: 1 }, { unique: true } ]
];

const initPages = async function (fastify) {

    try {
        const Pages = fastify.mongo.db.collection('pages');

        // creates indexes
        for (const [ keyPatterns, options = null ] of indexes) {
            await Pages.createIndex(keyPatterns, options)
        }

        return true;

    } catch (error) {
        throw error;
    }

};

module.exports = initPages;