import { ObjectId } from "mongodb";
import {
  handleImageFileErrors,
  imageMiddlewareFactory,
} from "./imageUploadMiddleware.js";

export function registerImageRoutes(app, imageProvider) {
  function waitDuration(numMs) {
    return new Promise((resolve) => setTimeout(resolve, numMs));
  }

  app.get("/api/images", (req, res) => {
    waitDuration(1000)
      .then(() => {
        return imageProvider.getAllImages();
      })
      .then((images) => {
        res.json(images);
      });
  });

  app.patch("/api/images/:imageId", (req, res) => {
    const { imageId } = req.params;
    const { name } = req.body;

    const { username } = req.userInfo || {};

    if (!username) {
      res.status(401).send({
        error: "Unauthorized",
        message: "Authentication required to rename images",
      });
      return;
    }

    if (!name || typeof name !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Image name is required and must be a string",
      });
      return;
    }

    if (!ObjectId.isValid(imageId)) {
      res.status(404).send({
        error: "Not Found",
        message: "Invalid image ID",
      });
      return;
    }

    if (name.length > 100) {
      res.status(413).send({
        error: "Content Too Large",
        message: `Image name exceeds 100 characters`,
      });
      return;
    }

    imageProvider.getImageAuthorId(new ObjectId(imageId)).then((image) => {
      if (!image) {
        res.status(404).send({
          error: "Not Found",
          message: "Image does not exist",
        });
        return;
      }

      if (image.authorId !== username) {
        res.status(403).send({
          error: "Forbidden",
          message: "This user does not own this image",
        });
        return;
      }

      return imageProvider.renameImage(new ObjectId(imageId), name).then(() => {
        res.status(204).send();
      });
    });
  });

  app.get("/api/images/:imageId", (req, res) => {
    const { imageId } = req.params;

    if (!ObjectId.isValid(imageId)) {
      res.status(404).send({
        error: "Not Found",
        message: "Invalid image ID",
      });
      return;
    }

    waitDuration(1000)
      .then(() => {
        return imageProvider.getImageById(new ObjectId(imageId));
      })
      .then((image) => {
        if (image) {
          res.json(image);
        } else {
          res.status(404).send({
            error: "Not Found",
            message: "No image with that ID",
          });
        }
      });
  });

  app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"),
    handleImageFileErrors,
    async (req, res) => {
      const { username } = req.userInfo || {};
      if (!username) {
        res.status(401).send({
          error: "Unauthorized",
          message: "Authentication required to upload images",
        });
        return;
      }

      if (!req.file) {
        res
          .status(400)
          .send({ error: "Bad Request", message: "Image file is required" });
        return;
      }

      if (!req.body.name) {
        res
          .status(400)
          .send({ error: "Bad Request", message: "Image name is required" });
        return;
      }

      const result = await imageProvider.createImage({
        src: `/uploads/${req.file.filename}`,
        name: req.body.name,
        authorId: username,
      });

      res.status(201).send({ id: result.insertedId });
    },
  );
}
