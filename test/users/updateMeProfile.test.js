const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'PUT',
    url: '/api/v1/users/me/profile',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;
let token;
let tokenUser;

describe(`USER PROFILE UPDATE testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(done => {
        fastify.jwt.sign({ email: 'info@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
            token = accessToken;
            fastify.jwt.sign({ email: 'info+user@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                tokenUser = accessToken;
                done();
            });
        });
    });

    test('it should fail for wrong access token', async () => {
        expect.assertions(2);
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;
        const body = {
            email: 'info+usernew@crispybacon.it'
        };
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, body });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {
        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for non-confirmed account', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenUser;
            const body = {
                email: 'info+user@crispybacon.it'
            };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }

        });

        test('it should succeed for correct token and payload', async () => {
            expect.assertions(7);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const body = {
                email: 'info+new@crispybacon.it'
            };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(200);
                expect(payload.code).toBe('success');
                expect(payload.user).not.toBeUndefined();
                expect(payload.user.email).toBe(body.email);
                expect(payload.user.role).toBe(100);
                expect(payload.user.salt).toBeUndefined();
                expect(payload.user.password).toBeUndefined();
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }

        });
    });

});