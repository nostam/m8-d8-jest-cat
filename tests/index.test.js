const server = require("../src/server");
const request = require("supertest")(server);
const mongoose = require("mongoose");
const UserModel = require("../src/services/users/schema");
const jwt = require("jsonwebtoken");

const demo = {
  username: "demo",
  password: "password",
};
let tokens;

beforeAll((done) => {
  mongoose.connect(
    `${process.env.ATLAS_URL}/test`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    async () => {
      console.log("Successfully connected to Atlas.");
      const newUser = new UserModel(demo);
      const res = await newUser.save();
      const { body } = await request.post("/users/login").send(demo);
      tokens = body;
      console.log(tokens);
      done();
    }
  );
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

// I: Testing a test

describe("Stage I: Testing tests", () => {
  it("should check that true is true", () => {
    expect(true).toBe(true);
  });

  it("should check that the /test endpoint is working correctly", async () => {
    const response = await request.get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.message).not.toBeFalsy();
    expect(response.body.message).toEqual("Test success");
  });
});

// II: Testing user creation and login
let id = "";

describe("Stage II: testing user creation and login", () => {
  const validCredentials = {
    username: "luisanton.io",
    password: "password",
  };

  const invalidCredentials = {
    username: "luisanton.io",
  };

  const incorrectCredentials = {
    username: "luisanton.io",
    password: "incorrectPassword",
  };

  const validToken = (pwd) => "VALID_TOKEN";

  it("should return an id from a /users/register endpoint when provided with valid credentials", async () => {
    const response = await request
      .post("/users/register")
      .send(validCredentials);

    const { _id } = response.body;
    id = _id;
    expect(_id).toBeDefined();
    expect(typeof _id).toBe("string");

    const user = await UserModel.findById(_id);

    expect(user).toBeDefined();
  });

  it("should NOT return an id from a /users/register endpoint when provided with incorrect credentials", async () => {
    const response = await request
      .post("/users/register")
      .send(invalidCredentials);

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe("wrong_credentials");
  });

  it("should return a valid token when loggin in with correct credentials", async () => {
    const response = await request.post("/users/login").send(validCredentials); //

    const { accessToken, refreshToken } = response.body;
    tokens = { accessToken, refreshToken };
    expect(jwt.verify(accessToken, process.env.JWT_SECRET)).toMatchObject({
      _id: id,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
    expect(
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    ).toMatchObject({
      _id: id,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it("should NOT return a valid token when loggin in with INCORRECT credentials", async () => {
    const response = await request
      .post("/users/login")
      .send(invalidCredentials);

    expect(response.status).toBe(401);

    const { token } = response.body;
    expect(token).not.toBeDefined();
  });
});

describe("Stage III: Testing protected endpoints", () => {
  // const cfg = {
  //   headers: {
  //     authorization: `Bearer ${tokens.accessToken}`,
  //   },
  // }; //AT is undefined in this code block
  it("/cats route requires authentication", async () => {
    const res = await request.get("/cats");
    expect(res.status).toBe(401);
  });

  it("tokens should be defined", () => {
    expect(tokens).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(
      jwt.verify(tokens.accessToken, process.env.JWT_SECRET)
    ).toMatchObject({
      _id: id,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it("res status should be 200 with authorization", async () => {
    const res = await request
      .get("/cats")
      .set("authorization", `Bearer ${tokens.accessToken}`)
      .send({ refreshToken: tokens.refreshToken });
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      created_at: expect.any(String),
      url: expect.any(String),
    });
    expect(res.body.url).toBeDefined();
  });
});
