import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app";

describe("Home Route", () => {
  it('should return 200', async () => {
    const response = await supertest(app).get('/');
    // assertions
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Blog Apis');
  })
})