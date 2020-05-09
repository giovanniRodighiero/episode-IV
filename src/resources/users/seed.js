const { encrypt } = require('node-password-encrypter');
const Faker = require('faker');

const { USERS } = require('./collection');
const { AUTH } = require('../authentication/collection');

const EMAILS = {
    projectOwner: 'email+owner@email.com',
    superadmin: 'email+superadmin@email.com',
    admin: 'email+admin@email.com',
    user: 'email+user@email.com',
};
const PASSWORD = 'password';


async function seedSingleSuperAdmin (Users, overrideUser) {
    const plainUser = {
        createdAt: new Date(),
        role: USERS.roles.SUPERADMIN,
        password: PASSWORD,
        email: EMAILS.superadmin,
        firstName: Faker.name.firstName(),
        lastName: Faker.name.lastName(),
        token: '',
        status: USERS.statuses.CONFIRMED,
        ...overrideUser
    }
    try {
        const { salt, password } = await USERS.hashPassword(plainUser.password);
        const { hashedToken, plainToken } = AUTH.newStatefulToken();

        const { upsertedId } = await Users.updateOne(
            { email: plainUser.email },
            { $set: {
                ...plainUser,
                password,
                salt,
                token: hashedToken,
            }
        }, { upsert: true });

        plainUser.token = plainToken;
        plainUser._id = upsertedId ? upsertedId._id : null;

        return plainUser;
    } catch (error) {
        throw error;
    }
};



async function seedSingleAdmin (Users, overrideUser) {
    const plainUser = {
        createdAt: new Date(),
        role: USERS.roles.ADMIN,
        password: PASSWORD,
        email: EMAILS.superadmin,
        firstName: Faker.name.firstName(),
        lastName: Faker.name.lastName(),
        token: '',
        status: USERS.statuses.CONFIRMED,
        ...overrideUser
    }
    try {
        const { salt, password } = await USERS.hashPassword(plainUser.password);
        const { hashedToken, plainToken } = AUTH.newStatefulToken();

        const { upsertedId } = await Users.updateOne(
            { email: plainUser.email },
            { $set: {
                ...plainUser,
                password,
                salt,
                token: hashedToken,
            }
        }, { upsert: true });

        plainUser.token = plainToken;
        plainUser._id = upsertedId ? upsertedId._id : null;

        return plainUser;
    } catch (error) {
        throw error;
    }
};



async function seedSingleUser (Users, overrideUser) {
    const plainUser = {
        createdAt: new Date(),
        role: USERS.roles.USER,
        password: PASSWORD,
        email: EMAILS.superadmin,
        firstName: Faker.name.firstName(),
        lastName: Faker.name.lastName(),
        token: '',
        status: USERS.statuses.CONFIRMED,
        ...overrideUser
    }
    try {
        const { salt, password } = await USERS.hashPassword(plainUser.password);
        const { hashedToken, plainToken } = AUTH.newStatefulToken();

        const { upsertedId } = await Users.updateOne(
            { email: plainUser.email },
            { $set: {
                ...plainUser,
                password,
                salt,
                token: hashedToken,
            }
        }, { upsert: true });

        plainUser.token = plainToken;
        plainUser._id = upsertedId ? upsertedId._id : null;

        return plainUser;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    seedSingleSuperAdmin,
    seedSingleAdmin,
    seedSingleUser
}
