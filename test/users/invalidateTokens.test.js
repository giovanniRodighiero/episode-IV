const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/users/auth-tokens',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;
let tokenSuperadmin, tokenAdmin, tokenUserConfirmed;

describe(`USER TOKEN BLACKLIST testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;
        const body = { foo: 'bar' };
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(done => {
            const opts = { expiresIn: '2 day' };
            seedUsers(fastify.mongo.db).then( _ => {
                fastify.jwt.sign({ email: 'info+admin@crispybacon.it' }, opts, (err, accessToken) => {
                    tokenSuperadmin = accessToken;
                    fastify.jwt.sign({ email: 'info+localadmin@crispybacon.it' }, opts, (err, accessToken) => {
                        tokenAdmin = accessToken;
                        fastify.jwt.sign({ email: 'info+userconfirmed@crispybacon.it' }, opts, (err, accessTokenConfirmed) => {
                            tokenUserConfirmed = accessTokenConfirmed;
                            done();
                        });
                    });
                });
            });
        });

        test('it should fail for an account with a role too low (< 80)', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenUserConfirmed;
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for missing ids list', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).toBe('users');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for duplicate items in the ids list', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const body = { users: [ 'abc', 'def', 'abc' ]};
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
                expect(payload.fieldName).toBe('users');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for wrong id format', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const body = { users: [ 'abc', 'def', 'ghi' ]};
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
                expect(payload.fieldName).toBe('users');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succed for correct params', async () => {
            expect.assertions(7);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const emails = ['userfake1@crispybacon.it', 'userfake2@crispybacon.it', 'userfake3@crispybacon.it'];
            const results = await fastify.mongo.db.collection('users').find({ email: { $in: emails } }).toArray();
            const users = results.map( user => user._id.toString());
            const body = { users };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                // const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                const users = await fastify.mongo.db.collection('users').find({ email: { $in: emails } }).toArray();
                for (const user of users) {
                    expect(user.tokenMinValidity).not.toBeUndefined();
                    expect(Date.now() - user.tokenMinValidity).toBeLessThan(100);
                } 

            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succed for correct params, ignoring the personal token when provided', async () => {
            expect.assertions(6);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const emails = ['info+admin@crispybacon.it', 'userfake2@crispybacon.it', 'userfake3@crispybacon.it'];
            const results = await fastify.mongo.db.collection('users').find({ email: { $in: emails } }).toArray();
            const users = results.map( user => user._id.toString());
            const body = { users };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                // const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                const users = await fastify.mongo.db.collection('users').find({ email: { $in: emails } }).toArray();
                for (const user of users) {
                    if (user.email === 'info+admin@crispybacon.it') {
                        expect(user.tokenMinValidity).toBeUndefined();
                    } else {
                        expect(user.tokenMinValidity).not.toBeUndefined();
                        expect(Date.now() - user.tokenMinValidity).toBeLessThan(100);
                    }
                } 

            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

    });
});