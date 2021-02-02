process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAjv = require('chai-json-schema-ajv');
const { expect } = require('chai');

const server = require('../server');
const db = require('../db/index');
const itemsService = require('../services/items');
const users = require('../services/users');
const generateToken = require('../utils/token');
const { ajv } = require('../middleware/validate'); // use same instance of ajv with chai
const itemsSchema = require('../schema/items.json');
const itemSchema = require('../schema/item.json');
const ajvSchema = require('../schema/ajvResponse.json');
const itemIdSchema = require('../schema/itemId.json');
const errorSchema = require('../schema/errorResponse.json');

chai.use(chaiHttp);
chai.use(chaiAjv.create({ ajv, verbose: true }));



describe('/items', () => {

  beforeEach(async () => {
    await db.create();
    await db.populate();
  });

  afterEach(async () => {
    server.close();
    await db.drop();
  });

  // GET all items
  describe('GET /', () => {
    let path;

    beforeEach(async () => {
      path = '/items';
    });

    const exec = async () => {
      return await chai
        .request(server)
        .get(path)
    };

    it('Should return all items', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.jsonSchema(itemsSchema);
    });

    it('Should return 404, if items table is empty', async () => {
      await db.clean();
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 404, if no item met the query string criteria', async () => {
      path = '/items?category=2'; // item with category=2 doesn't exist

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 500, if database throw an error (in case of bad query)', async () => {
      // mock function
      itemsService.getItems = async () => {
        await db.query('SELECT * FROM item');
      }

      const res = await exec();

      expect(res.status).to.equal(500);
    });
  });

  // GET item by id
  describe('GET /:itemId', () => {

    let path;

    const exec = async () => {
      return await chai
        .request(server)
        .get(path);
    };

    it('Should return item with the given id', async () => {
      path = '/items/1';


      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.jsonSchema(itemSchema);
    });

    it('Should return 404, if item doesn\'t exist', async () => {
      path = '/items/2';

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 500, if database throw an error (in case of bad query)', async () => {
      // mock function
      itemsService.getItemById = async () => {
        await db.query('SELECT * FROM items WHERE id =', 1);
      }

      const res = await exec();

      expect(res.status).to.equal(500);
    });
  });

  // POST new item
  describe('POST /', () => {

    let newItem;
    let token;

    beforeEach(async () => {
      token = await generateToken(1);
      newItem = {
        title: 'used BMW',
        description: 'Very good conditoin 1999 BMW',
        price: "910",
        country: 'Finland',
        city: 'Oulu',
        images: [
          'BMW.jpg'
        ],
        categoryId: '1',
        deliveryTypeId: '1',
      };
    });

    const exec = async () => {
      return await chai
        .request(server)
        .post('/items')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)

    };

    it('Should return 201 and itemId object, if item was created successfully', async () => {
      const res = await exec();

      expect(res.status).to.equal(201);
      expect(res.body).to.be.jsonSchema(itemIdSchema);
    });

    it('Should return 401, if user\'s token is invalid or missing', async () => {
      token = '';
      const res = await exec();

      expect(res.status).to.equal(401);
    });

    it('Should return 400, if title is missing', async () => {
      delete newItem.title;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if title is less than 5 characters', async () => {
      newItem = { ...newItem, title: '1234' };

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if description is missing', async () => {
      delete newItem.description;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if description is less than 5 characters', async () => {
      newItem = { ...newItem, description: '1234' }

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if price is missing', async () => {
      delete newItem.price;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if price is not in \d*(\.?\d+)', async () => {
      newItem.price = "abcd";

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if country is missing', async () => {
      delete newItem.country;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if country is less than 1 character', async () => {
      newItem.country = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if city is missing', async () => {
      delete newItem.city;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if city is less than 1 character', async () => {
      newItem.city = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if images is missing', async () => {
      delete newItem.images;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if images is less than one image', async () => {
      newItem.images = [];

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if categoryId is missing', async () => {
      delete newItem.categoryId;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if deliveryTypeId is missing', async () => {
      delete newItem.deliveryTypeId;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });
  });

  // PUT item
  describe('PUT /:itemId', () => {

    let item;
    let path;
    let token;

    beforeEach(async () => {
      path = '/items/1';
      token = await generateToken(1);
      item = {
        title: 'used BMW',
        description: 'Very good conditoin 1999 BMW',
        price: "910",
        country: 'Finland',
        city: 'Oulu',
        images: [
          'BMW.jpg'
        ],
        categoryId: '1',
        deliveryTypeId: '1',
      };
    });

    const exec = () => {
      return chai
        .request(server)
        .put(path)
        .set('Authorization', `Bearer ${token}`)
        .send(item)

    };

    const user = {
      firstname: "John",
      lastname: "Smith",
      email: "john.smith@mail.com",
      password: "johnsmithpassword",
      phone: "044-777-7777"
    };

    it('Should return 204, if item is updated successfully', async () => {
      const res = await exec();

      expect(res.status).to.equal(204);
      expect(res.body).to.be.empty;
    });

    it('Should return 400, if title is missing', async () => {
      delete item.title;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if title is less than 5 characters', async () => {
      item = { ...item, title: '1234' };

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if description is missing', async () => {
      delete item.description;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if description is less than 5 characters', async () => {
      item = { ...item, description: '1234' }

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if price is missing', async () => {
      delete item.price;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if price is not in \d*(\.?\d+)', async () => {
      item.price = "abcd";

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if country is missing', async () => {
      delete item.country;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if country is less than 1 character', async () => {
      item.country = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if city is missing', async () => {
      delete item.city;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if city is less than 1 character', async () => {
      item.city = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if images is missing', async () => {
      delete item.images;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if images is less than one image', async () => {
      item.images = [];

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if categoryId is missing', async () => {
      delete item.categoryId;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 400, if deliveryTypeId is missing', async () => {
      delete item.deliveryTypeId;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it('Should return 401, if token is missing/invalid', async () => {
      token = '';
      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 403, if item doesn\' belong to the user', async () => {
      const { insertId: userId } = await users.createUser(user);
      token = await generateToken(userId);
      const res = await exec();

      expect(res.status).to.equal(403);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 404, if item doesn\'t exist', async () => {
      path = '/items/2';

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);

    });

    it('Should return 404, if user doesn\'t exist (valid token but no user)', async () => {
      token = await generateToken(2);
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });
  });

  describe('DELETE /:itemId', () => {
    let token;
    let path;

    beforeEach(async () => {
      path = '/items/1';
      token = await generateToken(1);
    });

    const exec = () => {
      return chai
        .request(server)
        .delete(path)
        .set('Authorization', `Bearer ${token}`);
    };

    const user = {
      firstname: "John",
      lastname: "Smith",
      email: "john.smith@mail.com",
      password: "johnsmithpassword",
      phone: "044-777-7777"
    };

    it('Should return 204, if item is deleted successfully', async () => {
      const res = await exec();

      expect(res.status).to.equal(204);
    });

    it('Should return 404, if item doesn\'t exist', async () => {
      path = '/items/2';

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it('Should return 403, if item doesn\' belong to the user', async () => {
      const { insertId: userId } = await users.createUser(user);
      token = await generateToken(userId);
      const res = await exec();

      expect(res.status).to.equal(403);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });
  });
});