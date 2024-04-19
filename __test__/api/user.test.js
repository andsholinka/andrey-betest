const Request = require('supertest');
const Redis = require('ioredis-mock')
const redis = new Redis({})

jest.mock('ioredis', () => require('ioredis-mock'))

const db = require("../../src/models");
const User = db.user;

const mockDB = require('../../__fixtures__/db/user.json');

const app = require('../../index.js');

let payload;
let create;
let find;
let findById;
let findOne;
let findByIdAndUpdate;
let findByIdAndDelete;
let getKey;

describe('User', () => {

    beforeEach(async () => {
        payload = {
            "userName": "andrey",
            "accountNumber": 123456789,
            "emailAddress": "andrey@example.com",
            "identityNumber": 123456789
        }

        create = jest.spyOn(User, 'create');
        find = jest.spyOn(User, 'find');
        findById = jest.spyOn(User, 'findById');
        findOne = jest.spyOn(User, 'findOne');
        findByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate');
        findByIdAndDelete = jest.spyOn(User, 'findByIdAndDelete');

        getKey = jest.spyOn(redis, 'get');
    })

    test('it should return status response 200: [Sys Ping]', async () => {
        await Request(app)
            .get('/sys/ping')
            .expect(200)
    })

    test('it should return status response 500: [Get All User] Redis throws an error', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        find.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(500)

    })

    test('it should return status response 201: [Create User]', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        create.mockResolvedValue({});

        await Request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .expect(201)
            .then(res => {
                expect(res.body.status).toBe(201);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    });

    test('it should return status response 400: [Create User] Duplicate Data', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        create.mockRejectedValue({
            index: 0,
            code: 11000,
            keyPattern: {
                userName: 1
            },
            keyValue: {
                userName: 'andrey'
            },
            errmsg: 'E11000 duplicate key error collection: db_andrey_betest.users index: userName_1 dup key: { userName: "andrey" }'
        });

        await Request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
            })
    });

    test('it should return status response 400: [Create User] Missing Required Fields', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        create.mockResolvedValue({});

        await Request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.message).toBe('\"userName\" is required');
            })
    });

    test('it should return status response 401: [Create User] Unauthorized', async () => {

        create.mockResolvedValue({});

        await Request(app)
            .post('/api/users')
            .send(payload)
            .expect(401)
            .then(res => {
                expect(res.body.status).toBe(401);
                expect(res.body.message).toBe('Unauthorized!');
            })
    });

    test('it should return status response 401: [Create User] Invalid Token', async () => {

        const token = 'invalid-token';

        create.mockResolvedValue({});

        await Request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .then(res => {
                expect(res.body.status).toBe(401);
                expect(res.body.message).toBe('Failed to authenticate token.');
            })
    });

    test('it should return status response 200: [Get All User] From Redis', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        getKey.mockResolvedValue(JSON.stringify(mockDB));

        await Request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => {
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    })

    test('it should return status response 200: [Get All User] From DB', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        find.mockResolvedValue({});

        await Request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => {
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    })

    test('it should return status response 200: [Get User By Id]', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findById.mockResolvedValue({});

        await Request(app)
            .get('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => {
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    })

    test('it should return status response 404: [GET User By Id] User Not Found', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndUpdate.mockResolvedValue({});

        await Request(app)
            .get('/api/users/6620bcadd53cd63baf33b147xyz')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

    test('it should return status response 404: [GET User By Id] User Not Found', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findById.mockResolvedValue(null);

        await Request(app)
            .get('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

    test('it should return status response 500: [GET User By Id] Something went wrong', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findById.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .get('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(500)

    })

    test('it should return status response 200: [Get User By Account Number]', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findOne.mockResolvedValue({});

        await Request(app)
            .get('/api/users/account-number/123')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => {
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    })

    test('it should return status response 404: [GET User By Account Number] User Not Found', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findOne.mockResolvedValue(null);

        await Request(app)
            .get('/api/users/account-number/123')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

    test('it should return status response 500: [GET User By Account Number] Something went wrong', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findOne.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .get('/api/users/account-number/123')
            .set('Authorization', `Bearer ${token}`)
            .expect(500)

    })

    test('it should return status response 200: [Get User By Identity Number]', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findOne.mockResolvedValue({});

        await Request(app)
            .get('/api/users/identity-number/123')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => {
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    })

    test('it should return status response 404: [GET User By Identity Number] User Not Found', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findOne.mockResolvedValue(null);

        await Request(app)
            .get('/api/users/identity-number/123')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

    test('it should return status response 500: [GET User By Identity Number] Something went wrong', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findOne.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .get('/api/users/identity-number/123')
            .set('Authorization', `Bearer ${token}`)
            .expect(500)

    })

    test('it should return status response 200: [Update Data]', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndUpdate.mockResolvedValue(mockDB);

        await Request(app)
            .put('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .expect(200)
    });

    test('it should return status response 404: [Update Data] User Not Found', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndUpdate.mockResolvedValue(null);

        await Request(app)
            .put('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

    test('it should return status response 500: [Update Data] Something went wrong', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndUpdate.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .put('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(500)

    })

    test('it should return status response 200: [Delete Data]', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndDelete.mockResolvedValue(mockDB);

        await Request(app)
            .delete('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .expect(200)
    });

    test('it should return status response 404: [Delete Data] User Not Found', async () => {

        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndDelete.mockResolvedValue(null);

        await Request(app)
            .delete('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

    test('it should return status response 500: [Delete Data] Something went wrong', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJOYW1lIjoiYmFycmEiLCJhY2NvdW50TnVtYmVyIjoxMjMsImVtYWlsQWRkcmVzcyI6ImJhcnJhQGdtYWlsLmNvbSIsImlkZW50aXR5TnVtYmVyIjozNDUsImNyZWF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDQtMThUMDY6MjQ6NDUuMDg2WiIsImlkIjoiNjYyMGJjYWRkNTNjZDYzYmFmMzNiMTQ3In0sImlhdCI6MTcxMzQ4NDY0NywiZXhwIjoxNzEzNTI3ODQ3fQ.6Q3wClSQYxJTNxPfzMKoRiDjEDbu4ltlAV8WyHVpivk';

        findByIdAndDelete.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .delete('/api/users/6620bcadd53cd63baf33b147')
            .set('Authorization', `Bearer ${token}`)
            .expect(500)

    })

    test('it should return status response 200: [Generate Token]', async () => {

        findOne.mockResolvedValue({});

        await Request(app)
            .post('/api/users/generate-token')
            .send({
                emailAddress: "andrey@example.com",
            })
            .expect(200)
            .then(res => {
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Success');
                expect(res.body.data).toBeDefined();
            })
    });

    test('it should return status response 404: [Generate Token] User Not Found', async () => {

        findOne.mockResolvedValue(null);

        await Request(app)
            .post('/api/users/generate-token')
            .send({
                emailAddress: "uye@example.com",
            })
            .expect(404)
    });

    test('it should return status response 500: [Generate Token] Something went wrong', async () => {

        findOne.mockRejectedValue(new Error('Something went wrong'));

        await Request(app)
            .post('/api/users/generate-token')
            .send({
                emailAddress: "andrey@example.com",
            })
            .expect(500)

    })
});