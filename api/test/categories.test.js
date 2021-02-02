process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAjv = require('chai-json-schema-ajv');
const { expect } = require('chai');

const server = require('../server');
const db = require('../db/index');
const categoriesSchema = require('../schema/categories.json');
const errorSchema = require('../schema/errorResponse.json');

chai.use(chaiHttp);
chai.use(chaiAjv);


describe('/categories', () => {

  beforeEach(async () => {
    await db.create();
    await db.populate();
  });

  afterEach(async () => {
    await db.drop();
    server.close();
  });

  describe('GET /', () => {

    const exec = () => {
      return chai
        .request(server)
        .get('/categories')
    };

    it('Should return all categoires available', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).jsonSchema(categoriesSchema);
    });

    it('Should return 404, if no categories available', async () => {
      await db.clean();
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).jsonSchema(errorSchema);
    });
  });
});