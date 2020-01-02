const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, options) {
    return {
        method: 'POST',
        url: '/api/v1/users',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        ...options
    }
};

let fastify;
let token, userToken;

const requestsDetails = buildRequest('token');

describe(`USER CREATION testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        const requestsDetails = buildRequest(fakeToken, { payload: { email: 'email@mail.it', role: 70 } });

        try {
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(async () => {
            await seedUsers(fastify.mongo.db);
            fastify.log.debug('seeding users done, no errors');
        });

        beforeEach(done => {
            fastify.jwt.sign({ email: 'info+localadmin@email.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                token = accessToken;
                fastify.jwt.sign({ email: 'info+user@email.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    tokenUser = accessToken;
                    done();
                });
            });
        });

        test('it should fail for missing email', async () => {
            expect.assertions(6);
            const requestsDetails = buildRequest(token, { payload: { role: 70 } });

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(!!payload).toBe(true);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).not.toBeUndefined();
                expect(payload.fieldName).toBe('email');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });
    
        test('it should fail for non admin user', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(tokenUser, { payload: { email: 'email@mail.it', role: 70 } });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for already existing email address provided', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(token, { payload: { email: 'info@email.it', role: 70 } });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(409);
                expect(payload.code).toBe(errorTypes.ALREADY_EXISTING);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for too high role provided (local-admin)', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(token, { payload: { email: 'info+ok@email.it', role: 80 } });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for too high role provided (admin)', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(token, { payload: { role: 90, email: 'info+ok@email.it' } });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for correct permissions and parameters', async () => {
            expect.assertions(2);

            const requestsDetails = buildRequest(token, { payload: { email: 'info+new@email.it', role: 70 } });
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(201);
                expect(payload.code).toBe('success');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

    });
});
