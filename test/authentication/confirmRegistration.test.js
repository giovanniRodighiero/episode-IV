const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

function buildRequest (options) {
    return {
        method: 'POST',
        url: '/api/v1/confirm-registration',
        headers: { 'Content-Type': 'application/json' },
        ...options
    }
};
let fastify;

const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

const requestsDetails = buildRequest();
describe(`CONFIRMATION testing ${requestsDetails.method} ${requestsDetails.url};`, () =>{

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test.each([
        ['token', { payload: {} }]
    ])('it should fail for missing params (%s)',
        async (fieldName, body) => {
            expect.assertions(6);

            const requestsDetails = buildRequest(body);

            try {
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
        }
    );

    test('it should fail for invalid token', async () => {
        expect.assertions(2);

        const body = { payload: { token: 'invalidtoken' } };
        const requestsDetails = buildRequest(body);

        try {
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);
            expect(statusCode).toBe(400);
            expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
        } catch (error) {
            fastify.log.error(error);
            expect(error).toBeUndefined();            
        }
    });

    test('it should fail for expired token', done => {
        expect.assertions(2);

        fastify.jwt.sign({ account: 'info+user@email.it' }, { expiresIn: 1 }, async (err, token) => {
            await sleep(2000);
            
            const body = { payload: { token } };
            const requestsDetails = buildRequest(body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
                done();
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();            
            }

        });
    });

    describe('', () => {

        beforeAll(async () => {
            await seedUsers(fastify.mongo.db);
            fastify.log.debug('seeding users done, no errors');
        });

        test('it should fail for not existing user email', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info+wrong@email.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { payload: { token } };
                const requestsDetails = buildRequest(body);

                try {
                    const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(404);
                    expect(payload.code).toBe(errorTypes.NOT_FOUND);
                    done();
                } catch (error) {
                    fastify.log.error(error);
                    expect(error).toBeUndefined();            
                }
    
            });
        });
    
        test('it should fail for already active user account', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info@email.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { payload: { token } };
                const requestsDetails = buildRequest(body);

                try {
                    const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(400);
                    expect(payload.code).toBe(errorTypes.ALREADY_ACTIVE);
                    done();
                } catch (error) {
                    fastify.log.error(error);
                    expect(error).toBeUndefined();            
                }
    
            });
        });

        test('it should succeed for an existing, non active account', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ account: 'info+user@email.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                const body = { payload: { token } };
                const requestsDetails = buildRequest(body);

                try {
                    const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(200);
                    expect(payload.code).toBe('success');
                    done();
                } catch (error) {
                    fastify.log.error(error);
                    expect(error).toBeUndefined();            
                }
    
            });
        });
    });

});
