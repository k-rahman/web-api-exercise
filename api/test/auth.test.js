process.env.NODE_ENV = "test";

const chai = require("chai");
const { expect } = require("chai");
const chaiHttp = require("chai-http");
const chaitAjv = require("chai-json-schema-ajv");

const server = require("../server");
const db = require("../db/index");
const users = require("../services/users");
const generateToken = require("../utils/token");
const errorSchema = require("../schema/errorResponse.json");

chai.use(chaiHttp);
chai.use(chaitAjv);

describe("/auth", () => {
  let token;
  let usernamePassword;
  let user;

  beforeEach(async () => {
    await db.create();
  });

  afterEach(async () => {
    await db.drop();
    server.close();
  });

  describe("POST /", () => {
    beforeEach(async () => {
      user = {
        firstname: "John",
        lastname: "Smith",
        email: "john.smith@mail.com",
        password: "johnsmithpassword",
        phone: "044-777-7777",
      };

      const { insertId: userId } = await users.createUser(user);
      const userInfo = await users.getUserById(userId);
      token = await generateToken(userInfo);
    });

    const exec = () => {
      usernamePassword = new Buffer.from(
        `${user.email}:${user.password}`
      ).toString("base64");
      return chai
        .request(server)
        .post("/auth")
        .set("Authorization", `Basic ${usernamePassword}`);
    };

    it("Should return 200 and token, if email and password are valid", async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body.token).to.equal(token);
    });

    it("Should return 401, if invalid username", async () => {
      user.email = "karim@hotmail";

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 401, if invalid password", async () => {
      user.password = "12345";

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });

    it("Should return 401, if email or password is empty", async () => {
      user.password = "";
      user.email = "";

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body).to.be.jsonSchema(errorSchema);
    });
  });
});
