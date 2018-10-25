const { encrypt } = require('node-password-encrypter');

// USERS DATA SEED
const users = [
    {
        email: 'info@crispybacon.it',
        password: 'password',
        role: 100,
        accountConfirmed: true
    },
    {
        email: 'info+user@crispybacon.it',
        password: 'password',
        role: 70,
        accountConfirmed: false
    }
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
        console.log('seeding users done, no errors');
        return true;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    users,
    seedUsers
}