const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/confirm-registration',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe(`CONFIRMATION testing ${requestsDetails.method} ${requestsDetails.url};`, () =>{

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test.each([
        ['token', {  }]
    ])('it should fail for missing params (%s)',
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

    test('it should fail for invalid token', async () => {
        expect.assertions(2);

        const body = { token: 'invalidtoken' };
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(400);
            expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();            
        }
    });

    test('it should fail for expired token', done => {
        expect.assertions(2);

        fastify.jwt.sign({ account: 'info+user@crispybacon.it' }, { expiresIn: 1 }, async (err, token) => {
            await sleep(2000);
            
            const body = { token };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
                done();
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();            
            }

        });
    });

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));

        test('it should fail for not existing user email', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info+wrong@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { token };
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
    
        test('it should fail for already active user account', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { token };
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(400);
                    expect(payload.code).toBe(errorTypes.ALREADY_ACTIVE);
                    done();
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();            
                }
    
            });
        });

        test('it should succeed for an existing, non active account', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info+user@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { token };
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