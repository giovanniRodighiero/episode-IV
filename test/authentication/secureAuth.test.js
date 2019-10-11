const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

function buildRequest (token) {
    return {
        method: 'get',
        url: '/api/v1/secure-auth',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    }
};
let fastify;

const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

async function fakeController (request, reply) {
    return { user: request.user };
};

const requestsDetails = buildRequest();
describe(`REGISTRATION testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        try {
            fastify = await buildFastify();
            
            // INJECTING FAKE CONTROLLER TO SIMPLIFY
            fastify.register(async fastify => {
                fastify.get(requestsDetails.url, {
                    preValidation: [ fastify.secureAuth ]
                }, fakeController);
                return;
            });

            await fastify.ready();
            await seedUsers(fastify.mongo.db);

        } catch (error) {
            console.log(error);
        }
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for missing header', async () => {
        expect.assertions(2);

        try {
            const requestsDetails = buildRequest();
            delete requestsDetails.headers.Authorization;

            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.field).toBe('token');
        } catch (error) {
            fastify.log.error('error', error);
            expect(error).toBeUndefined();
        }
    });
    
    test('it should fail for missing token', async () => {
        expect.assertions(2);

        try {
            const requestsDetails = buildRequest('');
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.field).toBe('token');
        } catch (error) {
            fastify.log.error('error', error);
            expect(error).toBeUndefined();
        }
    });
    
    test('it should fail for wrong token', async () => {
        expect.assertions(2);

        try {
            const requestsDetails = buildRequest('wrong token');
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.field).toBe('token');
        } catch (error) {
            fastify.log.error('error', error);
            expect(error).toBeUndefined();
        }
    });
    
    test('it should fail for expired token', async () => {
        expect.assertions(2);

        const token = fastify.jwt.sign({ email: 'info+user@crispybacon.it' }, { expiresIn: 1 });
        await sleep(2000);
        try {
            const requestsDetails = buildRequest(token);
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.field).toBe('token');
        } catch (error) {
            fastify.log.error('error', error);
            expect(error).toBeUndefined();
        }
    });

    test('it should fail for not found user', async () => {
        expect.assertions(2);

        const token = fastify.jwt.sign({ email: 'notfound@crispybacon.it' }, { expiresIn: 1 });
        await sleep(2000);
        try {
            const requestsDetails = buildRequest(token);
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.field).toBe('token');
        } catch (error) {
            fastify.log.error('error', error);
            expect(error).toBeUndefined();
        }
    });

    test('it should succeed for valid token', async () => {
        expect.assertions(2);

        const token = fastify.jwt.sign({ email: 'info+user@crispybacon.it' }, { expiresIn: '2 days' });

        try {
            const requestsDetails = buildRequest(token);
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(200);
            expect(payload.user.email).toBe('info+user@crispybacon.it');
        } catch (error) {
            fastify.log.error('error', error);
            expect(error).toBeUndefined();
        }
    });

});