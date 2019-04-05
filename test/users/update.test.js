const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'PUT',
    url: '/api/v1/users/',
    headers: { 'Content-Type': 'application/json' }
};
let fastify, tokenSuperadmin, tokenAdmin, tokenUserConfirmed;

describe(`USER UPDATE testing ${requestsDetails.method} ${requestsDetails.url}:id;`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;
        const url = requestsDetails.url + 'fakeid';
        const body = { email: 'newmail@mail.it' };
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
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
            const url = requestsDetails.url + 'userid';
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an invalid mongo id', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const url = requestsDetails.url + 'userid';
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for a non existing account', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const url = requestsDetails.url + "5beaec4f13b92abf84302f26";
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for same person id', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenSuperadmin;
            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+admin@crispybacon.it' });
            const url = requestsDetails.url + _id.toString();
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for id of a user with higher role', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenAdmin;
            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+admin@crispybacon.it' });
            const url = requestsDetails.url + _id.toString();
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail updating a role higher than the user making the request', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenAdmin;
            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+userconfirmed@crispybacon.it' });
            const url = requestsDetails.url + _id.toString();
            const body = { role: fastify.config.userRoles.SUPERADMIN };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an already in use email', async () => {
            expect.assertions(2);
            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenAdmin;
            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+userconfirmed@crispybacon.it' });
            const url = requestsDetails.url + _id.toString();
            const body = { email: 'userfake3@crispybacon.it' };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(409);
                expect(payload.code).toBe(errorTypes.ALREADY_EXISTING);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });
        
        
        test('it should succeed for correct params', async () => {
            expect.assertions(2);
            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenAdmin;
            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+userconfirmed@crispybacon.it' });
            const url = requestsDetails.url + _id.toString();
            const body = { email: 'usernuovissimo@crispybacon.it' };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.email).toBe('usernuovissimo@crispybacon.it');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

    });
});