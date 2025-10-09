import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app";
import { connectInstance } from "./database.mjs";
import { PostModel } from "../post/post.model";

describe("Post Route", () => {
  let database;
  let request;

  beforeAll(async () => {
    database = await connectInstance();
    request = supertest(app);
  })

  afterEach(async () => {
    await database.clear();
  })

  afterAll(async () => {
    await database.disconnect();
  })

  describe("GET /api/v1/posts", () => {})
  
  describe("GET /api/v1/posts:id", () => {})

  describe("POST /api/v1/posts", () => {})

  describe("GET /api/v1/posts/user/me", () => {})

  describe("PATCH /api/v1/posts:id", () => {})
  
  describe("PATCH /api/v1/posts:id/publish", () => {})

  describe("DELETE /api/v1/posts:id", () => {})
})