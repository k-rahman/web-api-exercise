process.env.NODE_ENV = 'test';

const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const chaitAjv = require('chai-json-schema-ajv');

const server = require('../server');
const db = require('../db/index');
const users = require('../services/users');
const userIdSchema = require('../schema/userId.json');
const ajvSchema = require('../schema/ajvResponse.json');
const errorSchema = require('../schema/errorResponse.json');

chai.use(chaiHttp);
chai.use(chaitAjv);


describe('/register', () => {

  beforeEach(async () => {
    await db.create();
  });

  afterEach(async () => {
    server.close();
    await db.drop();
  });

  describe('POST /', () => {
    let user;

    beforeEach(() => {
      user = {
        firstname: "John",
        lastname: "Smith",
        email: "john.smith@mail.com",
        password: "johnsmithpassword",
        phone: "044-777-7777"
      };
    });

    const exec = () => {
      return chai
        .request(server)
        .post('/register')
        .send(user)
    };

    it('Should return 201 and userId, if user register successfully', async () => {
      const res = await exec();

      expect(res.status).to.equal(201);
      expect(res.body).to.be.jsonSchema(userIdSchema);
    });

    it('Should return 400, if email already exists', async () => {
      await users.createUser(user);

      const res = await exec();

      expect(res).to.has.property('status');
      expect(res.status).to.equal(400);
      expect(res).to.has.property('body');
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 400, if firstname is missing', async () => {
      delete user.firstname;
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('should return 400 and error message, if firstname is empty', async () => {
      user.firstname = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.error).to.has.property('text');
      expect(res.error.text).to.not.be.empty;
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if firstname is less than 1 character', async () => {
      user.firstname = '';
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if lastname is missing', async () => {
      delete user.lastname;
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('should return 400 and error message, if lastname is empty', async () => {
      user.lastname = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.error).to.has.property('text');
      expect(res.error.text).to.not.be.empty;
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if lastname is less than 1 character', async () => {
      user.lastname = '';
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if email is missing', async () => {
      delete user.email;
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('should return 400 and error message, if email is empty', async () => {
      user.email = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.error).to.has.property('text');
      expect(res.error.text).to.not.be.empty;
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if email is less than 1 character', async () => {
      user.email = '';
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if password is missing', async () => {
      delete user.password;
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('should return 400 and error message, if password is empty', async () => {
      user.password = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.error).to.has.property('text');
      expect(res.error.text).to.not.be.empty;
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if password is less than 5 characters', async () => {
      user.password = '1234';
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if phone is missing', async () => {
      delete user.phone;
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('should return 400 and error message, if phone is empty', async () => {
      user.phone = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.error).to.has.property('text');
      expect(res.error.text).to.not.be.empty;
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if phone is less than 12 characters', async () => {
      user.phone = '044-777';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });


  });
});