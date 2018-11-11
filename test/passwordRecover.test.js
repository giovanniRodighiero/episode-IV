const buildFastify = require('../server');
const { errorTypes } = require('../src/resources/errors/schema');
const { seedUsers } = require('../src/resources/users/seed');

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/password-recover',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

describe(`PASSWORD RECOVER testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test.each([
        ['email', {  }],
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

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));
    
        test('it should fail for not found email', async () => {
            expect.assertions(3);

            const body = {
                email: 'info+++@crispybacon.it'
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

        test('it should fail for not active account', async () => {
            expect.assertions(3);

            const body = {
                email: 'info+user@crispybacon.it'
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toEqual(403);
                expect(payload).not.toBeUndefined();
                expect(payload.code).toEqual(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for an existing confirmed account', async () => {
            expect.assertions(3);

            const body = {
                email: 'info@crispybacon.it'
            };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toEqual(200);
                expect(payload).not.toBeUndefined();
                expect(payload.code).toBe('success');
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

    });

});