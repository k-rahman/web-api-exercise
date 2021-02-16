process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const chaiAjv = require("chai-json-schema-ajv");
const { expect, assert } = require("chai");

const server = require("../server");
const db = require("../db/index");
const users = require("../services/users");
const generateToken = require("../utils/token");
const userSchema = require("../schema/user.json");
const errorSchema = require("../schema/errorResponse.json");
const ajvSchema = require("../schema/ajvResponse.json");

chai.use(chaiHttp);
chai.use(chaiAjv);

describe("users", () => {
  let token;

  beforeEach(async () => {
    await db.create();
    await db.populate();
    const userInfo = await users.getUserById(1);
    token = await generateToken(userInfo);
  });

  afterEach(async () => {
    await db.drop();
    server.close();
  });

  // GET user
  describe("GET /me", () => {
    const exec = () => {
      return chai
        .request(server)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`);
    };

    it("Should return the current user information", async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).jsonSchema(userSchema);
    });

    it("Should return 404, if user doesn't exist (valid token, no user)", async () => {
      token = await generateToken(2);
      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).jsonSchema(errorSchema);
    });

    it("Should not pass validation, if userId is missing from the response body)", async () => {
      const res = await exec();

      delete res.body.userId;

      expect(res.body).to.not.be.jsonSchema(userSchema);
    });

    it("Should not pass validation, if firstname is missing from the response body)", async () => {
      const res = await exec();

      delete res.body.firstname;

      expect(res.body).to.not.be.jsonSchema(userSchema);
    });

    it("Should not pass validation, if lastname is missing from the response body)", async () => {
      const res = await exec();

      delete res.body.lastname;

      expect(res.body).to.not.be.jsonSchema(userSchema);
    });

    it("Should not pass validation, if email is missing from the response body)", async () => {
      const res = await exec();

      delete res.body.email;

      expect(res.body).to.not.be.jsonSchema(userSchema);
    });

    it("Should not pass validation, if phone is missing from the response body)", async () => {
      const res = await exec();

      delete res.body.phone;

      expect(res.body).to.not.be.jsonSchema(userSchema);
    });
  });

  describe("PUT /me", () => {
    let updatedUser;

    beforeEach(async () => {
      updatedUser = {
        firstname: "john",
        lastname: "smith",
        email: "john.smith@gmail.com",
        password: "12345",
        phone: "044-777-7777",
      };
    });

    const exec = () => {
      return chai
        .request(server)
        .put("/users/me")
        .send(updatedUser)
        .set("Authorization", `Bearer ${token}`);
    };

    // user was updated successfully
    it("Should return 204 with no content in the response body, if user was updated successfully", async () => {
      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 204);
      assert.isEmpty(res.body);
    });

    // user doesn't exists
    it("Should return 404, if user doesn't exists", async () => {
      token = await generateToken(2);
      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 404);
      assert.property(res, "body");
      assert.jsonSchema(res.body, errorSchema);
    });

    // email already exists
    it("Should return 400, if email already exists with different userId", async () => {
      const { insertId: userId } = await users.createUser(updatedUser);
      const userInfo = await users.getUserById(userId);
      token = await generateToken(userInfo);
      updatedUser.email = "karim@mail.com"; // this email is alrdy in db from db.populate();

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "body");
      assert.jsonSchema(res.body, errorSchema);
    });

    // firstname is missing
    it("Should return 400 and error message, if firstname is missing", async () => {
      delete updatedUser.firstname;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        "[\"should have required property 'firstname'\"]"
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // firstname isn't string
    it("Should return 400 and error message, if firstname isn't string", async () => {
      updatedUser.firstname = 1234;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(res.error, "text", '["should be string"]');
      assert.jsonSchema(res.body, ajvSchema);
    });

    // firstname is empty
    it("Should return 400 and error message, if firstname is empty", async () => {
      updatedUser.firstname = "";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 1 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // lastname is missing
    it("Should return 400 and error message, if lastname is missing", async () => {
      delete updatedUser.lastname;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        "[\"should have required property 'lastname'\"]"
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // lastname isn't string
    it("Should return 400 and error message, if lastname isn't string", async () => {
      updatedUser.lastname = 441234;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(res.error, "text", '["should be string"]');
      assert.jsonSchema(res.body, ajvSchema);
    });

    // lastname is empty
    it("Should return 400 and error message, if lastname is empty", async () => {
      updatedUser.lastname = "";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 1 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // email is missing
    it("Should return 400 and error message, if email is missing", async () => {
      delete updatedUser.email;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        "[\"should have required property 'email'\"]"
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // email isn't string
    it("Should return 400 and error message, if email isn't string", async () => {
      updatedUser.email = 1123;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(res.error, "text", '["should be string"]');
      assert.jsonSchema(res.body, ajvSchema);
    });

    // email is empty
    it("Should return 400 and error message, if email is empty", async () => {
      updatedUser.email = "";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 1 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // password is missing
    it("Should return 400 and error message, if password is missing", async () => {
      delete updatedUser.password;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        "[\"should have required property 'password'\"]"
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // password isn't string
    it("Should return 400 and error message, if password isn't string", async () => {
      updatedUser.password = 1234;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(res.error, "text", '["should be string"]');
      assert.jsonSchema(res.body, ajvSchema);
    });

    // password is empty
    it("Should return 400 and error message, if password is empty", async () => {
      updatedUser.password = "";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 5 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // password length not less than 5 characters
    it("Should return error message, if password is less than 5 characters", async () => {
      updatedUser.password = "1234";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 5 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // phone is missing
    it("Should return 400 and error message, if phone is missing", async () => {
      delete updatedUser.phone;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        "[\"should have required property 'phone'\"]"
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // phone isn't string
    it("Should return 400 and error message, if phone isn't string", async () => {
      updatedUser.phone = 044 - 777;

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(res.error, "text", '["should be string"]');
      assert.jsonSchema(res.body, ajvSchema);
    });

    // phone is empty
    it("Should return 400 and error message, if phone is empty", async () => {
      updatedUser.phone = "";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 12 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });

    // phone length is less than 12 characters
    it("Should return 400 and error message, if phone is less than 12 characters", async () => {
      updatedUser.phone = "044-777-777";

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 400);
      assert.property(res, "error");
      assert.property(res.error, "text");
      assert.propertyVal(
        res.error,
        "text",
        '["should NOT have fewer than 12 characters"]'
      );
      assert.jsonSchema(res.body, ajvSchema);
    });
  });

  describe("DELETE /me", () => {
    const exec = () => {
      return chai
        .request(server)
        .delete("/users/me")
        .set("Authorization", `Bearer ${token}`);
    };

    // user was deleted
    it("Should return 204, if user was deleted successfully", async () => {
      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 204);
    });

    // user doesn't exist
    it("Should return 404, if user doesn't exist (valid token but no user)", async () => {
      token = await generateToken(2);

      const res = await exec();

      assert.property(res, "status");
      assert.propertyVal(res, "status", 404);
      assert.property(res, "body");
      assert.jsonSchema(res.body, errorSchema);
    });
  });
});
