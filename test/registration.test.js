const buildFastify = require('../server');
const { errorTypes } = require('../src/services/errors');
const { seedUsers } = require('../src/resources/users/seed');

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/registration',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

describe('REGISTRATION testing', () => {

    beforeAll(async () => {
        try {
            fastify = await buildFastify();
            await fastify.ready();
        } catch (error) {
            console.log(error);
        }
    });

    // TESTING MISSING PARAMS IN REQUEST BODY
    test.each([
        ['email', { password: 'password', confirmPassword: 'password', privacyAccepted: true }],
        ['password', { email: 'mail@mail.it', confirmPassword: 'password', privacyAccepted: true }],
        ['confirmPassword', { email: 'mail@mail.it', password: 'password', privacyAccepted: true }],
        ['privacyAccepted', { email: 'mail@mail.it', password: 'password', confirmPassword: 'password' }]
    ])(
    'it should fail for missing params (%s)',
    async (fieldName, body) => {
        expect.assertions(6);
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

    test('it should fail validation for wrong email format', async () => {
        expect.assertions(6);

        const body = {
            email: 'mail',
            password: 'password',
            confirmPassword: 'password'
        };

        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(400);
            expect(!!payload).toBe(true);
            expect(payload.code).not.toBeUndefined();
            expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            expect(payload.fieldName).not.toBeUndefined();
            expect(payload.fieldName).toEqual('email');
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    test('it should fail validation for mismatching passwords', async () => {
        expect.assertions(4);
        
        const body = {
            email: 'mail@mail.it',
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

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for already existing email address', async () => {
            expect.assertions(3);
            
            const body = {
                email: 'info@crispybacon.it',
                password: 'password',
                confirmPassword: 'password',
                privacyAccepted: true
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(409);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.ALREADY_EXISTING);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for non accpeted privacy', async () => {
            expect.assertions(3);
            
            const body = {
                email: 'info@crispybacon.it',
                password: 'password',
                confirmPassword: 'password',
                privacyAccepted: false
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for correct params', async () => {
            expect.assertions(3);
            const body = {
                email: 'giovanni.rodighiero@crispybacon.it',
                password: 'password',
                confirmPassword: 'password',
                privacyAccepted: true
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(201);
                expect(payload).not.toBeUndefined();
                expect(payload.code).toBe('success');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

    });
});
