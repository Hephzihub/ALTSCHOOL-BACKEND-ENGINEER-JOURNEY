import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

mongoose.Promise = global.Promise;

class Database {
  constructor() {
    this.mongoServer = null;
    this.connection = null;
  }

  async connect() {
    this.mongoServer = await MongoMemoryServer.create();
    const url = this.mongoServer.getUri();
    this.connection = await mongoose.connect(url);
  }

  async disconnect() {
    await this.connection.disconnect();
    await this.mongoServer.stop();
  }

  async clear() {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
}

export const connectInstance = async () => {
  const database = new Database();
  await database.connect();
  return database;
};