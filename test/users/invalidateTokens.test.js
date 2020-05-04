const { boot, fastify } = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { USERS } = require('../../src/resources/users/collection');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, options) {
    return {
        method: 'POST',
        url: '/api/v1/users/auth-tokens',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        ...options
    }
};

let tokenSuperadmin, tokenAdmin, tokenUserConfirmed, Users;

const requestsDetails = buildRequest('token');
describe(`USER TOKEN BLACKLIST testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        await boot();
        await fastify.ready();

        Users = fastify.mongo.db.collection(USERS.collectionName);
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        const requestsDetails = buildRequest(fakeToken, { payload: { foo: 'bar' } });

        try {
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            fastify.log.error(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(done => {
            const opts = { expiresIn: '2 day' };
            seedUsers(fastify.mongo.db).then( _ => {
                fastify.log.debug('seeding users done, no errors');

                fastify.jwt.sign({ email: 'info+admin@email.it' }, opts, (err, accessToken) => {
                    tokenSuperadmin = accessToken;
                    fastify.jwt.sign({ email: 'info+localadmin@email.it' }, opts, (err, accessToken) => {
                        tokenAdmin = accessToken;
                        fastify.jwt.sign({ email: 'info+userconfirmed@email.it' }, opts, (err, accessTokenConfirmed) => {
                            tokenUserConfirmed = accessTokenConfirmed;
                            done();
                        });
                    });
                });
            });
        });

        test('it should fail for an account with a role too low (< 80)', async () => {
            expect.assertions(2);

            const requestsDetails = buildRequest(tokenUserConfirmed, { payload: { email: 'newmail@mail.it' } });

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for missing ids list', async () => {
            expect.assertions(3);

            const requestsDetails = buildRequest(tokenSuperadmin, { payload: { email: 'newmail@mail.it' } });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).toBe('users');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for duplicate items in the ids list', async () => {
            expect.assertions(3);

            const requestsDetails = buildRequest(tokenSuperadmin, { payload: { users: [ 'abc', 'def', 'abc' ]} });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
                expect(payload.fieldName).toBe('users');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for wrong id format', async () => {
            expect.assertions(3);

            const requestsDetails = buildRequest(tokenSuperadmin, { payload: { users: [ 'abc', 'def', 'ghi' ]} });

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
                expect(payload.fieldName).toBe('users');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succed for correct params', async () => {
            expect.assertions(7);

            const emails = ['userfake1@email.it', 'userfake2@email.it', 'userfake3@email.it'];
            const results = await Users.find({ email: { $in: emails } }).toArray();
            const users = results.map( user => user._id.toString());

            const requestsDetails = buildRequest(tokenSuperadmin, { payload: { users } });
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                // const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                const users = await Users.find({ email: { $in: emails } }).toArray();
                for (const user of users) {
                    expect(user.tokenMinValidity).not.toBeUndefined();
                    expect(Date.now() - user.tokenMinValidity).toBeLessThan(100);
                }

            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succed for correct params, ignoring the personal token when provided', async () => {
            expect.assertions(6);

            const emails = ['info+admin@email.it', 'userfake2@email.it', 'userfake3@email.it'];
            const results = await Users.find({ email: { $in: emails } }).toArray();
            const users = results.map( user => user._id.toString());

            const requestsDetails = buildRequest(tokenSuperadmin, { payload: { users } });
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                // const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                const users = await Users.find({ email: { $in: emails } }).toArray();
                for (const user of users) {
                    if (user.email === 'info+admin@email.it') {
                        expect(user.tokenMinValidity).toBeUndefined();
                    } else {
                        expect(user.tokenMinValidity).not.toBeUndefined();
                        expect(Date.now() - user.tokenMinValidity).toBeLessThan(100);
                    }
                }

            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

    });
});
