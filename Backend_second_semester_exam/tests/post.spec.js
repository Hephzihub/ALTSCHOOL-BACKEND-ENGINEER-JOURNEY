import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app";
import { connectInstance } from "./database.mjs";
import { PostModel } from "../post/post.model";
import { UserModel } from "../user/user.model";

describe("Post Route", () => {
  let database;
  let request;
  let authToken;
  let userId;
  let postId;
  let secondUserId;
  let secondUserToken;

  beforeAll(async () => {
    database = await connectInstance();
    request = supertest(app);
  });

  beforeEach(async () => {
    // Create a test user and get auth token
    const userResponse = await request.post("/api/v1/auth/signup").send({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "password123",
    });

    authToken = userResponse.body.token;
    userId = userResponse.body.user._id;

    // Create a second user for permission tests
    const secondUserResponse = await request.post("/api/v1/auth/signup").send({
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      password: "password123",
    });

    secondUserToken = secondUserResponse.body.token;
    secondUserId = secondUserResponse.body.user._id;
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe("GET /api/v1/posts", () => {
    it("should return empty array when no published posts exist", async () => {
      const response = await request.get("/api/v1/posts");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.posts).toEqual([]);
      expect(response.body.message).toBe("No Post Records");
    });

    it("should return only published posts", async () => {
      // Create draft post
      await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Draft Post",
          body: "This is a draft post",
        });

      // Create and publish post
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Published Post",
          body: "This is a published post",
        });

      await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const response = await request.get("/api/v1/posts");

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].title).toBe("Published Post");
      expect(response.body.posts[0].state).toBe("published");
    });

    it("should filter posts by title", async () => {
      // Create and publish multiple posts
      const post1 = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "JavaScript Tutorial",
          body: "Learn JavaScript",
        });

      await request
        .patch(`/api/v1/posts/${post1.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const post2 = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Python Guide",
          body: "Learn Python",
        });

      await request
        .patch(`/api/v1/posts/${post2.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const response = await request.get("/api/v1/posts?title=JavaScript");

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].title).toContain("JavaScript");
    });

    it("should filter posts by tags", async () => {
      const post1 = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Post with tags",
          body: "Content",
          tags: ["javascript", "tutorial"],
        });

      await request
        .patch(`/api/v1/posts/${post1.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const response = await request.get("/api/v1/posts?tags=javascript");

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].tags).toContain("javascript");
    });

    it("should filter posts by author name", async () => {
      const post = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "John's Post",
          body: "Content by John",
        });

      await request
        .patch(`/api/v1/posts/${post.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

        // Use lowercase to search
      const response = await request.get("/api/v1/posts?author=john");

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].author.first_name).toBe("john");
    });

    it("should sort posts by read_count", async () => {
      const post1 = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Post 1", body: "Content 1" });

      const post2 = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Post 2", body: "Content 2" });

      await request
        .patch(`/api/v1/posts/${post1.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      await request
        .patch(`/api/v1/posts/${post2.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      // Increment read count for post2
      await request.get(`/api/v1/posts/${post2.body.post._id}`);
      await request.get(`/api/v1/posts/${post2.body.post._id}`);

      const response = await request.get("/api/v1/posts?sortBy=read_count:desc");

      expect(response.status).toBe(200);
      expect(response.body.posts[0]._id).toBe(post2.body.post._id);
    });

    it("should paginate results", async () => {
      // Create 25 posts (more than LIMIT of 20)
      for (let i = 1; i <= 25; i++) {
        const post = await request
          .post("/api/v1/posts")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            title: `Post ${i}`,
            body: `Content ${i}`,
          });

        await request
          .patch(`/api/v1/posts/${post.body.post._id}/publish`)
          .set("Authorization", `Bearer ${authToken}`);
      }

      const page1 = await request.get("/api/v1/posts?page=1");
      const page2 = await request.get("/api/v1/posts?page=2");

      expect(page1.body.posts).toHaveLength(20);
      expect(page2.body.posts).toHaveLength(5);
      expect(page1.body.totalPages).toBe(2);
      expect(page1.body.currentPage).toBe(1);
    });
  });

  describe("GET /api/v1/posts/:id", () => {
    it("should return 404 for non-existent post", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request.get(`/api/v1/posts/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Post not found");
    });

    it("should return 403 for draft posts", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Draft Post",
          body: "This is a draft",
        });

      const response = await request.get(`/api/v1/posts/${postResponse.body.post._id}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied");
    });

    it("should return published post and increment read_count", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Post",
          body: "Test content",
        });

      await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const response = await request.get(`/api/v1/posts/${postResponse.body.post._id}`);

      expect(response.status).toBe(200);
      expect(response.body.post.title).toBe("Test Post");
      expect(response.body.post.read_count).toBe(1);

      // Check read count increments
      const response2 = await request.get(`/api/v1/posts/${postResponse.body.post._id}`);
      expect(response2.body.post.read_count).toBe(2);
    });

    it("should populate author information", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Post",
          body: "Test content",
        });

      await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      // Use lowercase to search
      const response = await request.get(`/api/v1/posts/${postResponse.body.post._id}`);

      expect(response.body.post.author_id).toBeDefined();
      expect(response.body.post.author_id.first_name).toBe("john");
      expect(response.body.post.author_id.email).toBe("john@example.com");
    });
  });

  describe("POST /api/v1/posts", () => {
    it("should return 401 without authentication", async () => {
      const response = await request.post("/api/v1/posts").send({
        title: "Test Post",
        body: "Test content",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with invalid data", async () => {
      const response = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Post",
          // Missing required body field
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should create a post successfully", async () => {
      const response = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "My New Post",
          description: "A great post",
          body: "This is the content of my post",
          tags: ["tech", "javascript"],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Post Created");
      expect(response.body.post.title).toBe("My New Post");
      expect(response.body.post.state).toBe("draft");
      expect(response.body.post.tags).toEqual(["tech", "javascript"]);
    });

    it("should calculate reading_time automatically", async () => {
      const longBody = "word ".repeat(400); // 400 words = 2 minutes

      const response = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Long Post",
          body: longBody,
        });

      expect(response.body.post.reading_time).toBe(2);
    });

    it("should return 409 for duplicate title", async () => {
      await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Unique Title",
          body: "Content",
        });

      const response = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Unique Title",
          body: "Different content",
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Title Already Exist");
    });
  });

  describe("GET /api/v1/posts/user/me", () => {
    it("should return 401 without authentication", async () => {
      const response = await request.get("/api/v1/posts/user/me");

      expect(response.status).toBe(401);
    });

    it("should return user's posts (both draft and published)", async () => {
      // Create draft post
      await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "My Draft",
          body: "Draft content",
        });

      // Create published post
      const publishedPost = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "My Published Post",
          body: "Published content",
        });

      await request
        .patch(`/api/v1/posts/${publishedPost.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const response = await request
        .get("/api/v1/posts/user/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(2);
    });

    it("should filter by state", async () => {
      await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Draft 1", body: "Content" });

      const published = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Published 1", body: "Content" });

      await request
        .patch(`/api/v1/posts/${published.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      const response = await request
        .get("/api/v1/posts/user/me?state=draft")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].state).toBe("draft");
    });

    it("should not return other users' posts", async () => {
      // Create post with second user
      await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send({
          title: "Jane's Post",
          body: "Content by Jane",
        });

      const response = await request
        .get("/api/v1/posts/user/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(0);
    });
  });

  describe("PATCH /api/v1/posts/:id", () => {
    it("should return 401 without authentication", async () => {
      const response = await request.patch("/api/v1/posts/123").send({
        title: "Updated Title",
        body: "Updated content",
      });

      expect(response.status).toBe(401);
    });

    it("should update post successfully", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Original Title",
          body: "Original content",
          tags: ["old"],
        });

      const updateResponse = await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          body: "Updated content with more words to test reading time calculation again",
          tags: ["new", "updated"],
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.message).toBe("Post Updated");
      expect(updateResponse.body.post.title).toBe("Updated Title");
      expect(updateResponse.body.post.tags).toEqual(["new", "updated"]);
    });

    it("should return 403 when updating another user's post", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "John's Post",
          body: "Content",
        });

      const response = await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send({
          title: "Trying to update",
          body: "Should fail",
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You don't have permission");
    });

    it("should return 400 for duplicate title", async () => {
      await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Existing Title",
          body: "Content",
        });

      const post2 = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Second Post",
          body: "Content",
        });

      const response = await request
        .patch(`/api/v1/posts/${post2.body.post._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Existing Title",
          body: "Updated content",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title Already Exist");
    });

    it("should recalculate reading_time on update", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test",
          body: "short",
        });

      const longBody = "word ".repeat(600); // 600 words = 3 minutes

      const updateResponse = await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test",
          body: longBody,
        });

      expect(updateResponse.body.post.reading_time).toBe(3);
    });
  });

  describe("PATCH /api/v1/posts/:id/publish", () => {
    it("should return 401 without authentication", async () => {
      const response = await request.patch("/api/v1/posts/123/publish");

      expect(response.status).toBe(401);
    });

    it("should publish a draft post", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Draft Post",
          body: "Content",
        });

      const publishResponse = await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(publishResponse.status).toBe(200);
      expect(publishResponse.body.message).toBe("Post published successfully");
      expect(publishResponse.body.post.state).toBe("published");
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request
        .patch(`/api/v1/posts/${fakeId}/publish`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Post not found");
    });

    it("should return 403 when publishing another user's post", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "John's Post",
          body: "Content",
        });

      const response = await request
        .patch(`/api/v1/posts/${postResponse.body.post._id}/publish`)
        .set("Authorization", `Bearer ${secondUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You don't have permission");
    });
  });

  describe("DELETE /api/v1/posts/:id", () => {
    it("should return 401 without authentication", async () => {
      const response = await request.delete("/api/v1/posts/123");

      expect(response.status).toBe(401);
    });

    it("should delete post successfully", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Post to Delete",
          body: "Content",
        });

      const deleteResponse = await request
        .delete(`/api/v1/posts/${postResponse.body.post._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe("Post deleted successfully");

      // Verify post is deleted
      const getResponse = await request.get(`/api/v1/posts/${postResponse.body.post._id}`);
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request
        .delete(`/api/v1/posts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Post not found");
    });

    it("should return 403 when deleting another user's post", async () => {
      const postResponse = await request
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "John's Post",
          body: "Content",
        });

      const response = await request
        .delete(`/api/v1/posts/${postResponse.body.post._id}`)
        .set("Authorization", `Bearer ${secondUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You don't have permission");
    });
  });
});