const fastify = require('../../server');
const { config } = require('../../config');

const { seedSingleSuperAdmin, seedSingleAdmin, seedSingleUser } = require('../../src/resources/users/seed');
const { USERS } = require('../../src/resources/users/collection');
const { AUTH } = require('../../src/resources/authentication/collection');

const Users = _ => fastify.mongo.db.collection(USERS.collectionName);

beforeAll(async () => {
    await fastify.ready();
});

afterAll(async () => {
    await Users().deleteMany({ });
    await fastify.close();
});


describe('TESTING USER SEED', () => {

    afterEach(async () => await Users().deleteMany({ }))

    describe('SuperAdmin', () => {
        
        test('it should succeed for default options', async () => {
            expect.assertions(11);
            const insertedUser = await seedSingleSuperAdmin(Users());

            const user = await Users().findOne({ _id: insertedUser._id });

            expect(user).not.toBeNull();
            expect(insertedUser).toBeDefined();
            expect(insertedUser.firstName).toBe(user.firstName);
            expect(insertedUser.lastName).toBe(user.lastName);
            expect(insertedUser.email).toBe(user.email);
            expect(insertedUser.status).toBe(user.status);
            expect(insertedUser.role).toBe(USERS.roles.SUPERADMIN);
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
            expect(insertedUser.createdAt.getTime()).toBe(user.createdAt.getTime());
            expect(USERS.comparePasswords(insertedUser.password, user.password, user.salt)).toBeTruthy();
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
        });


        test('it should succeed for override options', async () => {
            expect.assertions(14);
            const options = { email : 'g@g.it', firstName: 'giovanni', lastName: 'rod' };
            const insertedUser = await seedSingleSuperAdmin(Users(), options);

            const user = await Users().findOne({ _id: insertedUser._id });

            expect(user).not.toBeNull();
            expect(insertedUser).toBeDefined();
            expect(insertedUser.firstName).toBe(options.firstName);
            expect(user.firstName).toBe(options.firstName);
            expect(insertedUser.lastName).toBe(options.lastName);
            expect(user.lastName).toBe(options.lastName);
            expect(insertedUser.email).toBe(options.email);
            expect(user.email).toBe(options.email);
            expect(insertedUser.status).toBe(user.status);
            expect(insertedUser.role).toBe(USERS.roles.SUPERADMIN);
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
            expect(insertedUser.createdAt.getTime()).toBe(user.createdAt.getTime());
            expect(USERS.comparePasswords(insertedUser.password, user.password, user.salt)).toBeTruthy();
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
        });

    });
    
    
    
    describe('Admin', () => {
        
        test('it should succeed for default options', async () => {
            expect.assertions(11);
            const insertedUser = await seedSingleAdmin(Users());

            const user = await Users().findOne({ _id: insertedUser._id });

            expect(user).not.toBeNull();
            expect(insertedUser).toBeDefined();
            expect(insertedUser.firstName).toBe(user.firstName);
            expect(insertedUser.lastName).toBe(user.lastName);
            expect(insertedUser.email).toBe(user.email);
            expect(insertedUser.status).toBe(user.status);
            expect(insertedUser.role).toBe(USERS.roles.ADMIN);
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
            expect(insertedUser.createdAt.getTime()).toBe(user.createdAt.getTime());
            expect(USERS.comparePasswords(insertedUser.password, user.password, user.salt)).toBeTruthy();
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
        });


        test('it should succeed for override options', async () => {
            expect.assertions(14);
            const options = { email : 'g@g.it', firstName: 'giovanni', lastName: 'rod' };
            const insertedUser = await seedSingleAdmin(Users(), options);

            const user = await Users().findOne({ _id: insertedUser._id });

            expect(user).not.toBeNull();
            expect(insertedUser).toBeDefined();
            expect(insertedUser.firstName).toBe(options.firstName);
            expect(user.firstName).toBe(options.firstName);
            expect(insertedUser.lastName).toBe(options.lastName);
            expect(user.lastName).toBe(options.lastName);
            expect(insertedUser.email).toBe(options.email);
            expect(user.email).toBe(options.email);
            expect(insertedUser.status).toBe(user.status);
            expect(insertedUser.role).toBe(USERS.roles.ADMIN);
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
            expect(insertedUser.createdAt.getTime()).toBe(user.createdAt.getTime());
            expect(USERS.comparePasswords(insertedUser.password, user.password, user.salt)).toBeTruthy();
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
        });

    });



    describe('User', () => {
        
        test('it should succeed for default options', async () => {
            expect.assertions(11);
            const insertedUser = await seedSingleUser(Users());

            const user = await Users().findOne({ _id: insertedUser._id });

            expect(user).not.toBeNull();
            expect(insertedUser).toBeDefined();
            expect(insertedUser.firstName).toBe(user.firstName);
            expect(insertedUser.lastName).toBe(user.lastName);
            expect(insertedUser.email).toBe(user.email);
            expect(insertedUser.status).toBe(user.status);
            expect(insertedUser.role).toBe(USERS.roles.USER);
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
            expect(insertedUser.createdAt.getTime()).toBe(user.createdAt.getTime());
            expect(USERS.comparePasswords(insertedUser.password, user.password, user.salt)).toBeTruthy();
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
        });


        test('it should succeed for override options', async () => {
            expect.assertions(14);
            const options = { email : 'g@g.it', firstName: 'giovanni', lastName: 'rod' };
            const insertedUser = await seedSingleUser(Users(), options);

            const user = await Users().findOne({ _id: insertedUser._id });

            expect(user).not.toBeNull();
            expect(insertedUser).toBeDefined();
            expect(insertedUser.firstName).toBe(options.firstName);
            expect(user.firstName).toBe(options.firstName);
            expect(insertedUser.lastName).toBe(options.lastName);
            expect(user.lastName).toBe(options.lastName);
            expect(insertedUser.email).toBe(options.email);
            expect(user.email).toBe(options.email);
            expect(insertedUser.status).toBe(user.status);
            expect(insertedUser.role).toBe(USERS.roles.USER);
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
            expect(insertedUser.createdAt.getTime()).toBe(user.createdAt.getTime());
            expect(USERS.comparePasswords(insertedUser.password, user.password, user.salt)).toBeTruthy();
            expect(AUTH.hashToken(insertedUser.token)).toBe(user.token);
        });

    });

});