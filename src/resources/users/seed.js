const { encrypt } = require('node-password-encrypter');

// USERS DATA SEED
const users = [
    {
        email: 'info@email.it',
        password: 'password',
        role: 100,
        accountConfirmed: true,
        privacyAccepted: true
    },
    {
        email: 'info+admin@email.it',
        password: 'password',
        role: 90,
        accountConfirmed: true,
        privacyAccepted: true
    },
    {
        email: 'info+localadmin@email.it',
        password: 'password',
        role: 80,
        accountConfirmed: true,
        privacyAccepted: true
    },
    {
        email: 'info+userconfirmed@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: true,
        privacyAccepted: true
    },
    {
        email: 'info+user@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: false,
        privacyAccepted: true
    },
    {
        email: 'userfake1@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: false,
        privacyAccepted: true
    },
    {
        email: 'userfake2@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: false,
        privacyAccepted: true
    },
    {
        email: 'userfake3@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: false,
        privacyAccepted: true
    },
    {
        email: 'userfake4@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: false,
        privacyAccepted: true
    },
    {
        email: 'userfake5@email.it',
        password: 'password',
        role: 70,
        accountConfirmed: false,
        privacyAccepted: true
    },
];


// CLEARS AND SEEDS THE USERS COLLECTION
async function seedUsers (database) {
    const Users = database.collection('users');
    try {
        await Users.deleteMany({});

        for (const user of users) {
            const { salt, encryptedContent: password } = await encrypt({ content: user.password, keylen: 128, iterations: 1000 });
            await Users.insertOne({ ...user, salt, password });
        }

        return true;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    users,
    seedUsers
}
