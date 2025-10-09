import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { connectInstance } from "./database.mjs";
import { UserModel } from "../user/user.model.js";

describe("Auth Route", () => {
  let database;
  let request;

  beforeAll(async () => {
    database = await connectInstance();
    request = supertest(app);
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe("POST /api/v1/auth/signup", () => {
    const validUserData = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    it("should register a new user successfully", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Signup successful");
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });

    it("should create user in database", async () => {
      await request.post("/api/v1/auth/signup").send(validUserData);

      const user = await UserModel.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user.first_name).toBe(validUserData.first_name.toLowerCase());
      expect(user.last_name).toBe(validUserData.last_name.toLowerCase());
      expect(user.email).toBe(validUserData.email.toLowerCase());
    });

    it("should hash password before saving", async () => {
      await request.post("/api/v1/auth/signup").send(validUserData);

      const user = await UserModel.findOne({
        email: validUserData.email,
      }).select("+password");
      expect(user.password).not.toBe(validUserData.password);
    });

    it("should return 409 if email already exists", async () => {
      // Create first user
      await request.post("/api/v1/auth/signup").send(validUserData);

      // Try to create duplicate
      const response = await request
        .post("/api/v1/auth/signup")
        .send(validUserData)
        .expect(409);

      expect(response.body).toHaveProperty("message", "Email already used");
    });

    it("should return 400 if first_name is missing", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send({
          last_name: "Doe",
          email: "john@example.com",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("first_name");
    });

    it("should return 400 if last_name is missing", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send({
          first_name: "John",
          email: "john@example.com",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("last_name");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send({
          first_name: "John",
          last_name: "Doe",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("email");
    });

    it("should return 400 if email is invalid", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send({
          first_name: "John",
          last_name: "Doe",
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("email");
    });

    it("should return 400 if password is missing", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send({
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("password");
    });

    it("should return 400 if password is less than 6 characters", async () => {
      const response = await request
        .post("/api/v1/auth/signup")
        .send({
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          password: "12345",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("password");
    });

    it("should convert email to lowercase", async () => {
      await request.post("/api/v1/auth/signup").send({
        ...validUserData,
        email: "JOHN.DOE@EXAMPLE.COM",
      });

      const user = await UserModel.findOne({ email: "john.doe@example.com" });
      expect(user).toBeTruthy();
      expect(user.email).toBe("john.doe@example.com");
    });

    it("should convert names to lowercase", async () => {
      await request.post("/api/v1/auth/signup").send({
        first_name: "JOHN",
        last_name: "DOE",
        email: "john@example.com",
        password: "password123",
      });

      const user = await UserModel.findOne({ email: "john@example.com" });
      expect(user.first_name).toBe("john");
      expect(user.last_name).toBe("doe");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    const userData = {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      password: "password123",
    };

    beforeEach(async () => {
      // Create a user before each login test
      await request.post("/api/v1/auth/signup").send(userData);
    });

    it("should login user successfully with correct credentials", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });

    it("should login with case-insensitive email", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          email: "JANE.SMITH@EXAMPLE.COM",
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("token");
    });

    it("should return 401 with incorrect email", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          email: "wrong@example.com",
          password: userData.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid Credentials");
    });

    it("should return 401 with incorrect password", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          email: userData.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid Credentials");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          password: userData.password,
        })
        .expect(400);

      console.log("Response status:", response.status);
      console.log("Response body:", response.body);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("email");
    });

    it("should return 400 if password is missing", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          email: userData.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("password");
    });

    it("should return 400 if email format is invalid", async () => {
      const response = await request
        .post("/api/v1/auth/login")
        .send({
          email: "invalid-email",
          password: userData.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("email");
    });

    it("should not expose password in any response", async () => {
      const response = await request.post("/api/v1/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      expect(response.body).not.toHaveProperty("password");
      expect(JSON.stringify(response.body)).not.toContain(userData.password);
    });
  });
});
