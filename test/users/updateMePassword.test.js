const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'PUT',
    url: '/api/v1/users/me/password',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;
let token;
let tokenUser;

describe(`USER PROFILE PASSWORD UPDATE testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
        
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
            password: 'password',
            confirmPassword: 'password'
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

    test('it should fail for non confirmed account', async () => {
        expect.assertions(2);
        requestsDetails.headers['Authorization'] = 'Bearer ' + tokenUser;
        const body = {
            password: 'password',
            confirmPassword: 'password'
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

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));
    
        test.each([
            ['password', { confirmPassword: 'password' }],
            ['confirmPassword', { password: 'password' }],
        ])(
            'it should fail for missing params (%s)',
            async (fieldName, body) => {
                expect.assertions(6);
                requestsDetails.headers['Authorization'] = 'Bearer ' + token;
                
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
    
                    expect(statusCode).toBe(400);
                    expect(!!payload).toBe(true);
                    expect(payload.code).not.toBeUndefined();
                    expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                    expect(payload.fieldName).not.toBeUndefined();
                    expect(payload.fieldName).toBe(fieldName);
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();
                }
        });

        test('it should fail validation for mismatching passwords', async () => {
            expect.assertions(4);
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            
            const body = {
                password: 'password',
                confirmPassword: 'p'
            };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
        
                expect(statusCode).toBe(400);
                expect(!!payload).toBe(true);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.PASSWORD_MISMATCH);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for valid token and parameters', async () => {
            expect.assertions(4);
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            
            const body = {
                password: 'password',
                confirmPassword: 'password'
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
        
                expect(statusCode).toBe(200);
                expect(!!payload).toBe(true);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe('success');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });
    
    });


});