const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'PUT',
    url: '/api/v1/users/',
    headers: { 'Content-Type': 'application/json' }
};
let fastify, token, tokenUser, tokenUserConfirmed;

describe(`USER UPDATE testing ${requestsDetails.method} ${requestsDetails.url}:id;`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;
        const url = requestsDetails.url + 'fakeid';
        const body = { email: 'newmail@mail.it' };
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(done => {
            const opts = { expiresIn: '2 day' };
            seedUsers(fastify.mongo.db).then( _ => {
                fastify.jwt.sign({ email: 'info@crispybacon.it' }, opts, (err, accessToken) => {
                    token = accessToken;
                    fastify.jwt.sign({ email: 'info+user@crispybacon.it' }, opts, (err, accessToken) => {
                        tokenUser = accessToken;
                        fastify.jwt.sign({ email: 'info+userconfirmed@crispybacon.it' }, opts, (err, accessTokenConfirmed) => {
                            tokenUserConfirmed = accessTokenConfirmed;
                            done();
                        });
                    });
                });
            });
        });

        test('it should fail for non confirmed account', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenUser;
            const url = requestsDetails.url + 'userid'
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an account with a role too low (< 80)', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenUserConfirmed;
            const url = requestsDetails.url + 'userid';
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an invalid mongo id', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const url = requestsDetails.url + 'userid';
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for a non existing account', async () => {
            expect.assertions(2);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const url = requestsDetails.url + "5beaec4f13b92abf84302f26";
            const body = { email: 'newmail@mail.it' };
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

    });
});