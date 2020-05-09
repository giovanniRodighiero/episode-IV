const { encrypt, compare } = require('node-password-encrypter');

const schemas = require('./schema');

const baseProjection = {
    email: 1,
    role: 1,
    accountConfirmed: 1
};

// INDEXES SPECIFICATIONS
const indexes = [
    [ { email: 1 }, { unique: true } ],
    [ { accountConfirmed: 1 } ]
];

const roles = {
    PROJECT_OWNER: 100,
    SUPERADMIN: 90,
    ADMIN: 80,
    USER: 70
};

const statuses = {
    CONFIRMED: 'confirmed',
    PENDING: 'pending'
};

// SET UP THE USERS COLLECTION
async function ensureIndexes (fastify) {
    try {
        const Users = fastify.mongo.db.collection(USERS.collectionName);

        // creates indexes
        for (const [ keyPatterns, options = null ] of indexes) {
            await Users.createIndex(keyPatterns, options);
        }

        return true;

    } catch (error) {
        throw error;
    }
};


async function hashPassword (plainPassword) {
    try {
        const { salt, encryptedContent: password } = await encrypt({ content: plainPassword, keylen: 128, iterations: 1000 });
        return { salt, password };
    } catch (error) {
        throw error;
    }
};

async function comparePasswords (plainPassword, encyptedPassword, salt) {
    try {
        const passwordsEqual = await compare({
            content: plainPassword,
            encryptedContent: encyptedPassword,
            salt,
            keylen: 128,
            iterations: 1000
        });
        return passwordsEqual
    } catch (error) {
        throw error;
    }
}

// COLLECTION RELATED INFORMATIONS
const USERS = {
    collectionName: 'users',
    baseProjection,
    schemas,
    roles,
    statuses,
    hashPassword,
    comparePasswords
};

module.exports = {
    indexes,
    ensureIndexes,
    baseProjection,
    USERS
};