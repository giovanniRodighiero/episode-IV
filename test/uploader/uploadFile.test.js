const Formdata = require('form-data')
const fs = require('fs');
const path = require('path');

const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { seedSettings } = require('../../src/resources/settings/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'POST',
    url: '/api/v1/uploader',
    headers: {}
};
let fastify, token, tokenUser;

describe(`SETTINGS DETAILS testing ${requestsDetails.method} ${requestsDetails.url}`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;

        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));

        beforeEach(done => {
            fastify.jwt.sign({ email: 'info+localadmin@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                token = accessToken;
                fastify.jwt.sign({ email: 'info+user@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    tokenUser = accessToken;
                    done();
                });
            });
        });
       
        test('it should succed for correct file', async () => {
            expect.assertions(5);

            const body = new Formdata();
            body.append('file', fs.createReadStream(path.join(__dirname, './placeholder.png')));
            
            requestsDetails.headers =  body.getHeaders();
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.url).not.toBeNull();
                expect(payload.url).not.toBeUndefined();
                const imagePath = payload.url.split(fastify.config.address)[1];
                const file = fs.readFileSync(path.join(__dirname, '../../', imagePath));
                expect(file).not.toBeNull();
                expect(file).not.toBeUndefined();
                fs.unlinkSync(path.join(__dirname, '../../', imagePath));
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

    });
});