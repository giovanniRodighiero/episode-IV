const { boot, fastify } = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

function buildRequest (options) {
    return {
        method: 'POST',
        url: '/api/v1/registration',
        headers: { 'Content-Type': 'application/json' },
        ...options
    }
};

const requestsDetails = buildRequest();
describe(`REGISTRATION testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        await boot();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });
    
    // TESTING MISSING PARAMS IN REQUEST BODY
    test.each([
        ['email', { payload: { password: 'password', confirmPassword: 'password', privacyAccepted: true } }],
        ['password', { payload: { email: 'mail@mail.it', confirmPassword: 'password', privacyAccepted: true } }],
        ['confirmPassword', { payload: { email: 'mail@mail.it', password: 'password', privacyAccepted: true } }],
        ['privacyAccepted', { payload: { email: 'mail@mail.it', password: 'password', confirmPassword: 'password' } }]
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

    test('it should fail validation for mismatching passwords', async () => {
        expect.assertions(4);
        
        const body = { payload: {
            email: 'mail@mail.it',
            password: 'password',
            confirmPassword: 'p'
        }};

        try {
            const requestsDetails = buildRequest(body);
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

    describe('', () => {

        beforeAll(async () => {
            await seedUsers(fastify.mongo.db);
            fastify.log.debug('seeding users done, no errors');
        });

        test('it should fail for already existing email address', async () => {
            expect.assertions(3);
            
            const body = { payload: {
                email: 'info@email.it',
                password: 'password',
                confirmPassword: 'password',
                privacyAccepted: true
            }};

            try {
                const requestsDetails = buildRequest(body);
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(409);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.ALREADY_EXISTING);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for non accepted privacy', async () => {
            expect.assertions(3);
            
            const body = { payload: {
                email: 'info@email.it',
                password: 'password',
                confirmPassword: 'password',
                privacyAccepted: false
            }};

            try {
                const requestsDetails = buildRequest(body);
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for correct params', async () => {
            expect.assertions(3);
            const body = {
                payload: {
                    email: 'giovanni.rodighiero@email.it',
                    password: 'password',
                    confirmPassword: 'password',
                    privacyAccepted: true
                }
            };

            try {
                const requestsDetails = buildRequest(body);
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(201);
                expect(payload).not.toBeUndefined();
                expect(payload.code).toBe('success');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

    });
});
