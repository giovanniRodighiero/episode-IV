const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, options) {
    return {
        method: 'PUT',
        url: `/api/v1/users/me/profile`,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        ...options
    }
};
let fastify, token, tokenUser;

const requestsDetails = buildRequest('token');
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

        const body = { payload: { email: 'info+usernew@crispybacon.it' } };
        const requestsDetails = buildRequest(fakeToken, body);

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
        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for non-confirmed account', async () => {
            expect.assertions(2);

            const body = { payload: { email: 'info+user@crispybacon.it' } };
            const requestsDetails = buildRequest(tokenUser, body);

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

        test('it should succeed for correct token and payload', async () => {
            expect.assertions(7);

            const body = { payload: { email: 'info+new@crispybacon.it' } };
            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.code).toBe('success');
                expect(payload.user).not.toBeUndefined();
                expect(payload.user.email).toBe(body.payload.email);
                expect(payload.user.role).toBe(100);
                expect(payload.user.salt).toBeUndefined();
                expect(payload.user.password).toBeUndefined();
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }

        });
    });

});