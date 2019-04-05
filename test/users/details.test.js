const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'GET',
    url: '/api/v1/users/',
    headers: { 'Content-Type': 'application/json' }
};
let fastify, token, tokenAdmin, tokenUserConfirmed;


describe(`USER DETAILS testing ${requestsDetails.method} ${requestsDetails.url}:id;`, () => {

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
        const url = requestsDetails.url + 'userid';
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
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
            seedUsers(fastify.mongo.db).then(_ =>{
                fastify.jwt.sign({ email: 'info@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    token = accessToken;
                    fastify.jwt.sign({ email: 'info+localadmin@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                        tokenAdmin = accessToken;
                        fastify.jwt.sign({ email: 'info+userconfirmed@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessTokenConfirmed) => {
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
            const url = requestsDetails.url + 'userid'
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail wrong id format', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const url = requestsDetails.url + 'userid'
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
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

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const url = requestsDetails.url + "5beaec4f13b92abf84302f26"
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an id of a user with higher role', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenAdmin;
            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info@crispybacon.it' });
            const url = requestsDetails.url + _id.toString();
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }

        });

        test('it should succeed for correct permissions and id', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenAdmin;
            const { _id, email } = await fastify.mongo.db.collection('users').findOne({ email: 'info+userconfirmed@crispybacon.it'  }, { email: 1 });
            const url = requestsDetails.url + _id.toString();
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(200);
                expect(payload.email).toBe(email);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });
    });

});