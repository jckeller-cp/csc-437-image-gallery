import bcrypt from "bcrypt";
import { getEnvVar } from "./getEnvVar.js";

export class CredentialsProvider {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
    const credsCollectionName = getEnvVar("CREDS_COLLECTION_NAME");
    const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
    this.credsCollection = this.mongoClient
      .db()
      .collection(credsCollectionName);
    this.usersCollection = this.mongoClient
      .db()
      .collection(usersCollectionName);
  }

  async registerUser(username, email, password) {
    const existing = await this.credsCollection.findOne({ username });
    if (existing) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const session = this.mongoClient.startSession();
    try {
      await session.withTransaction(async () => {
        await this.credsCollection.insertOne(
          { username, password: hashedPassword },
          { session },
        );
        await this.usersCollection.insertOne({ username, email }, { session });
      });
    } finally {
      await session.endSession();
    }
    return true;
  }

  async verifyPassword(username, password) {
    const existing = await this.credsCollection.findOne({ username });
    if (!existing) {
      return false;
    }

    const match = await bcrypt.compare(password, existing.password);
    if (!match) {
      return false;
    }

    return true;
  }
}
