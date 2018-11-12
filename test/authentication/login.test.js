const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/login',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

describe(`LOGIN testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    // TESTING MISSING PARAMS IN REQUEST BODY
    test.each([
            ['email', { password: 'password' }],
            ['password', { email: 'mail@mail.it' }]
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
        }
    );

    test('it should fail validation for wrong email format', async () => {
        expect.assertions(6);

        const body = {
            email: 'mail',
            password: 'password',
            confirmPassword: 'p'
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

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for not found email', async () => {
            expect.assertions(3);

            const body = {
                email: 'info+++@crispybacon.it',
                password: 'password'
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toEqual(404);
                expect(payload).not.toBeUndefined();
                expect(payload.code).toEqual(errorTypes.NOT_FOUND);
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for wrong password', async () => {
            expect.assertions(3);

            const body = {
                email: 'info@crispybacon.it',
                password: 'pass'
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toEqual(401);
                expect(payload.code).not.toBeUndefined();
                expect(payload.code).toEqual(errorTypes.WRONG_PASSWORD);
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for correct email and password', async () => {
            expect.assertions(11);

            const body = {
                email: 'info@crispybacon.it',
                password: 'password'
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toEqual(200);
                expect(payload.token).not.toBeUndefined();
                expect(typeof payload.token).toBe('string');
                expect(payload.user).not.toBeUndefined();
                expect(typeof payload.user).toBe('object');
                expect(payload.user.email).not.toBeUndefined();
                expect(payload.user.email).toBe(body.email);
                expect(payload.user.role).not.toBeUndefined();
                expect(payload.user.role).toBe(100);
                expect(payload.user.password).toBeUndefined();
                expect(payload.user.salt).toBeUndefined();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        })

    });

});