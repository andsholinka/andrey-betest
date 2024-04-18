const Request = require('supertest');
const Path = require('path');
const fs = require('fs');

const generalHelper = require('../../src/helpers/generalHelper');
const userPlugin = require('../../src/routes/user.routes');

let server;
let payload;

describe('User Controller', () => {

    beforeAll(() => {
        server = generalHelper.createTestServer('/', userPlugin);
    });

    afterAll(async () => {
        await server.close();
    });

    test('Create User', async () => {
        payload = {
            userName: 'andrey',
            accountNumber: 123,
            emailAddress: 'andrey@gmail.com',
            identityNumber: 123
        };

        await Request(server)
            .post('/api/users/')
            .send(payload)
            .then((response) => {
                expect(response.statusCode).toBe(200);
            });
    });
});