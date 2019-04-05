const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/resend-confirmation',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

describe(`RESEND CONFIRMATION REGISTRATION testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        try {
            fastify = await buildFastify();
            await fastify.ready();
        } catch (error) {
            console.log(error);
        }
    });

    afterAll(async () => {
        await fastify.close();
    });
    
    // TESTING MISSING PARAMS IN REQUEST BODY
    test.each([
        ['email', {  }]
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

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for not existing user email', async () => {
            expect.assertions(2);
    
            const body = { email: 'info+wrong@crispybacon.it' };
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(404);
                    expect(payload.code).toBe(errorTypes.NOT_FOUND);
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();            
                }
        });


        test('it should fail for already active account', async () => {
            expect.assertions(2);
    
            const body = { email: 'info@crispybacon.it' };
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(403);
                    expect(payload.code).toBe(errorTypes.ALREADY_ACTIVE);
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();            
                }
        });

        test('it should succeed for active account', async () => {
            expect.assertions(2);
    
            const body = { email: 'info+user@crispybacon.it' };
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(200);
                    expect(payload.code).toBe('success');
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();            
                }
        });

    });
});
