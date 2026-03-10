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

    if (!name || typeof name !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Image name is required and must be a string",
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

    imageProvider.renameImage(imageId, name).then((result) => {
      if (result.matchedCount === 0) {
        res.status(404).send({
          error: "Not Found",
          message: "Image does not exist",
        });
      } else {
        res.status(204).send();
      }
    });
  });

  app.get("/api/images/:imageId", (req, res) => {
    const { imageId } = req.params;
    waitDuration(1000)
      .then(() => {
        return imageProvider.getImageById(imageId);
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
}
