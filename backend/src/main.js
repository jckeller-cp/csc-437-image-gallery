import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "./shared/example.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();

const mongoClient = connectMongo();

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req, res) => {
  res.send("Hello, World " + SHARED_TEST);
});

function waitDuration(numMs) {
  return new Promise((resolve) => setTimeout(resolve, numMs));
}

app.get("/api/images", (req, res) => {
  waitDuration(1000).then(() => {
    const imageProvider = new ImageProvider(mongoClient);
    imageProvider.getAllImages().then((images) => {
      console.log(images);
      res.json(images);
    });
  });
});

app.get(Object.values(VALID_ROUTES), (req, res) => {
  res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
