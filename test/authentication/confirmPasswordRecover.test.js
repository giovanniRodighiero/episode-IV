const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');


const requestsDetails = {
    method: 'POST',
    url: '/api/v1/confirm-password-recover',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));


describe(`CONFIRM PASSWORD RECOVERY testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test.each([
        ['token', { password: 'password', confirmPassword: 'password' }],
        ['password', { confirmPassword: 'password', token: 'token' }],
        ['confirmPassword', { password: 'password', token: 'token' }]
    ])('it should fail for missing params (%s)',
        async (fieldName, body) => {
            expect.assertions(6);

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body, });
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

    test('it should fail for invalid token', async () => {
        expect.assertions(4);

        const body = { token: 'token', password: 'pass', confirmPassword: 'pass' };
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(400);
            expect(!!payload).toBe(true);
            expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            expect(payload.fieldName).toBe('token');
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }

    });

    test('it should fail for expired token', done => {
        expect.assertions(2);

        fastify.jwt.sign({ account: 'info+user@crispybacon.it' }, { expiresIn: 1 }, async (err, token) => {
            await sleep(2000);
            const body = { token, password: 'pass', confirmPassword: 'pass' };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
                done();
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
                done();        
            }

        });
    });

    describe('', () => {
        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for not existing user email', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info+wrong@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { token, password: 'pass', confirmPassword: 'pass' };
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(404);
                    expect(payload.code).toBe(errorTypes.NOT_FOUND);
                    done();
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();            
                }
    
            });
        });

        test('it should succeed for existing user email', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info+user@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { token, password: 'newPassword', confirmPassword: 'newPassword' };
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(200);
                    expect(payload.code).toBe('success');
                    done();
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();            
                }
    
            });
        });
    });
});