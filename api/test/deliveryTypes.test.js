process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAjv = require('chai-json-schema-ajv');
const { expect } = require('chai');

const server = require('../server');
const db = require('../db/index');
const deliveryTypesSchema = require('../schema/deliveryTypes.json');
const errorSchema = require('../schema/errorResponse.json');

chai.use(chaiHttp);
chai.use(chaiAjv);


describe('/deliveryTypes', () => {

  describe('GET /', () => {

    beforeEach(async () => {
      await db.create();
      await db.populate();
    });

    afterEach(async () => {
      await db.drop();
      server.close();
    });

    const exec = () => {
      return chai
        .request(server)
        .get('/deliveryTypes')
    };

    it('Should return all delivery types available', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).jsonSchema(deliveryTypesSchema);
    });

    it('Should return 404, if no deliveryTypes available)', async () => {
      await db.clean();
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).jsonSchema(errorSchema);
    });
  });
});