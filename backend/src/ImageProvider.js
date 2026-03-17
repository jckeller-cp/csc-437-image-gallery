import { getEnvVar } from "./getEnvVar.js";

export class ImageProvider {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;
    const collectionName = getEnvVar("IMAGES_COLLECTION_NAME");
    this.collection = this.mongoClient.db().collection(collectionName);
    this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
  }

  getAllImages() {
    return this.collection
      .aggregate([
        {
          $lookup: {
            from: this.usersCollectionName,
            localField: "authorId",
            foreignField: "username",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();
  }

  getImageAuthorId(imageId) {
    return this.collection.findOne(
      { _id: imageId },
      { projection: { authorId: 1 } }
    );
  }

  renameImage(imageId, newName) {
    return this.collection.updateOne(
      { _id: imageId },
      { $set: { name: newName } }
    );
  }

  createImage(imageData) {
    return this.collection.insertOne(imageData);
  }

  getImageById(imageId) {
    return this.collection
      .aggregate([
        { $match: { _id: imageId } },
        {
          $lookup: {
            from: this.usersCollectionName,
            localField: "authorId",
            foreignField: "username",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .next();
  }
}
