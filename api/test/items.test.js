process.env.NODE_ENV = "test";

var fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const chaiAjv = require("chai-json-schema-ajv");
const { expect } = require("chai");

const server = require("../server");
const db = require("../db/index");
const itemsService = require("../services/items");
const users = require("../services/users");
const generateToken = require("../utils/token");
const { ajv } = require("../middleware/validate"); // use same instance of ajv with chai
const itemsSchema = require("../schema/items.json");
const itemSchema = require("../schema/item.json");
const ajvSchema = require("../schema/ajvResponse.json");
const itemIdSchema = require("../schema/itemId.json");
const errorSchema = require("../schema/errorResponse.json");

chai.use(chaiHttp);
chai.use(chaiAjv.create({ ajv, verbose: true }));

describe("/items", () => {
  beforeEach(async () => {
    await db.create();
    await db.populate();
  });

  afterEach(async () => {
    server.close();
    await db.drop();
  });

  // GET all items
  describe("GET /", () => {
    let path;

    beforeEach(async () => {
      path = "/items";
    });

    const exec = async () => {
      return await chai.request(server).get(path);
    };

    it("Should return all items", async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.jsonSchema(itemsSchema);
    });

    it("Should return items, if they match the query string criteria", async () => {
      path = "/items?category=1&country=Finland";

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.jsonSchema(itemsSchema);
    });

    it("Should return 404, if items don't match the query string criteria", async () => {
      path = "/items?category=11&date=2019-02-02";

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 404, if items table is empty", async () => {
      await db.clean();
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 404, if no item met the query string criteria", async () => {
      path = "/items?category=2"; // item with category=2 doesn't exist

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 500, if database throw an error (in case of bad query)", async () => {
      // mock function
      itemsService.getItems = async () => {
        await db.query("SELECT * FROM item");
      };

      const res = await exec();

      expect(res.status).to.equal(500);
    });
  });

  // GET item by id
  describe("GET /:itemId", () => {
    let path;

    const exec = async () => {
      return await chai.request(server).get(path);
    };

    it("Should return item with the given id", async () => {
      path = "/items/1";

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.jsonSchema(itemSchema);
    });

    it("Should return 404, if item doesn't exist", async () => {
      path = "/items/2";

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 500, if database throw an error (in case of bad query)", async () => {
      // mock function
      itemsService.getItemById = async () => {
        await db.query("SELECT * FROM items WHERE id =", 1);
      };

      const res = await exec();

      expect(res.status).to.equal(500);
    });
  });

  // POST new item
  describe("POST /", () => {
    let newItem;
    let token;
    let userInfo;

    beforeEach(async () => {
      userInfo = await users.getUserById(1);
      token = await generateToken(userInfo);
    });

    const exec = (images = "images") => {
      return chai
        .request(server)
        .post("/items")
        .set("Authorization", `Bearer ${token}`)
        .field("title", "used BMW")
        .field("description", "Very good condition 1999 BMW")
        .field("price", "910")
        .field("country", "Finland")
        .field("city", "Oulu")
        .field("categoryId", "1")
        .field("deliveryTypeId", "1")
        .attach(
          images,
          fs.readFileSync(__dirname + "/assets/wosho-symbol.jpg"),
          "symbol.jpg"
        );
    };

    it("Should return 201 and itemId object, if item was created successfully", async () => {
      const res = await exec();

      expect(res.status).to.equal(201);
      expect(res.body).to.be.jsonSchema(itemIdSchema);
    });

    it("Should return 401, if user's token is invalid or missing", async () => {
      token = "";
      const res = await exec();

      expect(res.status).to.equal(401);
    });

    it("Should return 400, if title is missing", async () => {
      const res = await exec().field("title", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if title is less than 5 characters", async () => {
      const res = await exec().field("title", "1234");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if description is missing", async () => {
      const res = await exec().field("description", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if description is less than 5 characters", async () => {
      const res = await exec().field("description", "1234");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if price is missing", async () => {
      const res = await exec().field("price", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if price is not in d*(.?d+)", async () => {
      const res = await exec().field("price", "abcd");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if country is missing", async () => {
      const res = await exec().field("country", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if country is less than 1 character", async () => {
      const res = await exec().field("country", " ");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if city is missing", async () => {
      const res = await exec().field("city", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if city is less than 1 character", async () => {
      const res = await exec().field("city", " ");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if images is missing", async () => {
      const res = await exec("img");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if images is less than one image", async () => {
      const res = await exec("img");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if categoryId is missing", async () => {
      const res = await exec().field("categoryId", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if deliveryTypeId is missing", async () => {
      const res = await exec().field("deliveryTypeId", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });
  });

  // PUT item
  describe("PUT /:itemId", () => {
    let path;
    let token;
    let userInfo;

    beforeEach(async () => {
      path = "/items/1";

      userInfo = await users.getUserById(1);
      token = await generateToken(userInfo);
    });

    const exec = (images = "images") => {
      return chai
        .request(server)
        .put(path)
        .set("Authorization", `Bearer ${token}`)
        .field("title", "used BMW")
        .field("description", "Very good condition 1999 BMW")
        .field("price", "910")
        .field("country", "Finland")
        .field("city", "Oulu")
        .field("categoryId", "1")
        .field("deliveryTypeId", "1")
        .attach(
          images,
          fs.readFileSync(__dirname + "/assets/wosho-symbol.jpg"),
          "symbol.jpg"
        );
    };

    const user = {
      firstname: "John",
      lastname: "Smith",
      email: "john.smith@mail.com",
      password: "johnsmithpassword",
      phone: "044-777-7777",
    };

    it("Should return 204, if item is updated successfully", async () => {
      const res = await exec();

      expect(res.status).to.equal(204);
      expect(res.body).to.be.empty;
    });

    it("Should return 400, if title is missing", async () => {
      const res = await exec().field("title", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if title is less than 5 characters", async () => {
      const res = await exec().field("title", "1234");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if description is missing", async () => {
      const res = await exec().field("description", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if description is less than 5 characters", async () => {
      const res = await exec().field("description", "1234");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if price is missing", async () => {
      const res = await exec().field("price", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if price is not in d*(.?d+)", async () => {
      const res = await exec().field("price", "abd");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if country is missing", async () => {
      const res = await exec().field("country", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if country is less than 1 character", async () => {
      const res = await exec().field("country", " ");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if city is missing", async () => {
      const res = await exec().field("city", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if city is less than 1 character", async () => {
      const res = await exec().field("city", " ");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if images is missing", async () => {
      const res = await exec("img");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if images is less than one image", async () => {
      const res = await exec("image");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if categoryId is missing", async () => {
      const res = await exec().field("categoryId", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 400, if deliveryTypeId is missing", async () => {
      const res = await exec().field("categoryId", "");

      expect(res.status).to.equal(400);
      expect(res.body).to.be.jsonSchema(ajvSchema);
    });

    it("Should return 401, if token is missing/invalid", async () => {
      token = "";
      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 403, if item doesn' belong to the user", async () => {
      const { insertId: userId } = await users.createUser(user);
      userInfo = await users.getUserById(userId);
      token = await generateToken(userInfo);

      const res = await exec();

      expect(res.status).to.equal(403);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 404, if item doesn't exist", async () => {
      path = "/items/2";

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 404, if user doesn't exist (valid token but no user)", async () => {
      token = await generateToken(user);
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });
  });

  describe("DELETE /:itemId", () => {
    let token;
    let path;

    beforeEach(async () => {
      path = "/items/1";

      const userInfo = await users.getUserById(1);
      token = await generateToken(userInfo);
    });

    const exec = () => {
      return chai
        .request(server)
        .delete(path)
        .set("Authorization", `Bearer ${token}`);
    };

    const user = {
      firstname: "John",
      lastname: "Smith",
      email: "john.smith@mail.com",
      password: "johnsmithpassword",
      phone: "044-777-7777",
    };

    it("Should return 204, if item is deleted successfully", async () => {
      const res = await exec();

      expect(res.status).to.equal(204);
    });

    it("Should return 404, if item doesn't exist", async () => {
      path = "/items/2";

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 403, if item doesn' belong to the user", async () => {
      const { insertId: userId } = await users.createUser(user);
      const userInfo = await users.getUserById(userId);
      token = await generateToken(userInfo);
      const res = await exec();

      expect(res.status).to.equal(403);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });
  });
});
