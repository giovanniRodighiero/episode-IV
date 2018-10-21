// test('it should fail validation for mismatching passwords', async () => {
//     expect.assertions(4);

//     try {
//         const body = {
//             email: 'mail@mail.it',
//             password: 'password',
//             confirmPassword: 'p'
//         };
//         const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
//         const payload = JSON.parse(_payload);

//         expect(statusCode).toBe(400);
//         expect(!!payload).toBe(true);
//         expect(payload.code).not.toBeUndefined();
//         expect(payload.code).toBe(errorTypes.PASSWORD_MISMATCH);
//     } catch (error) {
//         console.log(error);
//         expect(error).toBeUndefined();
//     }
// });