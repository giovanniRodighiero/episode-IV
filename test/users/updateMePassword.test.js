const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, options) {
    return {
        method: 'PUT',
        url: `/api/v1/users/me/password`,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        ...options
    }
};
let fastify, token, tokenUser;

const requestsDetails = buildRequest('token');
describe(`USER PROFILE PASSWORD UPDATE testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();

        await seedUsers(fastify.mongo.db);
        fastify.log.debug('seeding users done, no errors');
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
        const body = { payload: {
            password: 'password',
            confirmPassword: 'password'
        }};
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

    test('it should fail for non confirmed account', async () => {
        expect.assertions(2);

        const body = { payload: {
            password: 'password',
            confirmPassword: 'password'
        }};
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

    describe('', () => {

    
        test.each([
            ['password', { payload: { confirmPassword: 'password' } }],
            ['confirmPassword', { payload: { password: 'password' } }],
        ])(
            'it should fail for missing params (%s)',
            async (fieldName, body) => {
                expect.assertions(6);

                const requestsDetails = buildRequest(token, body)

                try {
                    const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                    const payload = JSON.parse(_payload);
    
                    expect(statusCode).toBe(400);
                    expect(!!payload).toBe(true);
                    expect(payload.code).not.toBeUndefined();
                    expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                    expect(payload.fieldName).not.toBeUndefined();
                    expect(payload.fieldName).toBe(fieldName);
                } catch (error) {
                    fastify.log.error(error);
                    expect(error).toBeUndefined();
                }
        });

        test('it should fail validation for mismatching passwords', async () => {
            expect.assertions(4);
            
            const body = { payload: {
                password: 'password',
                confirmPassword: 'p'
            }};
            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
        
                expect(statusCode).toBe(400);
                expect(!!payload).toBe(true);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.PASSWORD_MISMATCH);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for valid token and parameters', async () => {
            expect.assertions(4);
            
            const body = { payload: {
                password: 'password',
                confirmPassword: 'password'
            }};
            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
        
                expect(statusCode).toBe(200);
                expect(!!payload).toBe(true);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe('success');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });
    
    });


});
