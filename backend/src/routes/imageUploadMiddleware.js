import multer from "multer";

class ImageFormatError extends Error {}

function getRandomFilename(fileExtension) {
  return (
    Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + fileExtension
  );
}

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.IMAGE_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, getRandomFilename("png"));
    } else if (file.mimetype === "image/jpeg") {
      cb(null, getRandomFilename("jpg"));
    } else {
      cb(new ImageFormatError("Unsupported image type"));
    }
  },
});

export const imageMiddlewareFactory = multer({
  storage: storageEngine,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export function handleImageFileErrors(err, req, res, next) {
  if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
    res.status(400).send({
      error: "Bad Request",
      message: err.message,
    });
    return;
  }
  next(err); // Some other error, let the next middleware handle it
}
