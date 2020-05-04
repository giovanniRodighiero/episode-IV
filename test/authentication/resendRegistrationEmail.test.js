const { boot, fastify } = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

function buildRequest (options) {
    return {
        method: 'POST',
        url: '/api/v1/resend-confirmation',
        headers: { 'Content-Type': 'application/json' },
        ...options
    }
};

const requestsDetails = buildRequest();
describe(`RESEND CONFIRMATION REGISTRATION testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        await boot();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });
    
    // TESTING MISSING PARAMS IN REQUEST BODY
    test.each([
        ['email', { payload: {} }]
    ])(
    'it should fail for missing params (%s)',
    async (fieldName, body) => {
        expect.assertions(6);

        try {
            const requestsDetails = buildRequest(body);
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

    test('it should fail validation for wrong email format', async () => {
        expect.assertions(6);

        const body = { payload: {
            email: 'mail',
            password: 'password',
            confirmPassword: 'password'
        }};

        try {
            const requestsDetails = buildRequest(body);
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(400);
            expect(!!payload).toBe(true);
            expect(payload.code).not.toBeUndefined();
            expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            expect(payload.fieldName).not.toBeUndefined();
            expect(payload.fieldName).toEqual('email');
        } catch (error) {
            fastify.log.error(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(async () => {
            await seedUsers(fastify.mongo.db);
            fastify.log.debug('seeding users done, no errors');
        });

        test('it should fail for not existing user email', async () => {
            expect.assertions(2);
    
            const body = { payload: { email: 'info+wrong@email.it' } };
            try {
                const requestsDetails = buildRequest(body);
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();            
            }
        });


        test('it should fail for already active account', async () => {
            expect.assertions(2);
    
            const body = { payload: { email: 'info@email.it' } };
            try {
                const requestsDetails = buildRequest(body);
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.ALREADY_ACTIVE);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();            
            }
        });

        test('it should succeed for active account', async () => {
            expect.assertions(2);
    
            const body = { payload: { email: 'info+user@email.it' } };
            try {
                const requestsDetails = buildRequest(body);

                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(200);
                expect(payload.code).toBe('success');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();            
            }
        });

    });
});
