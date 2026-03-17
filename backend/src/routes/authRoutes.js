import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

/**
 * Creates a Promise for a JWT token, with a specified username embedded inside.
 *
 * @param username the username to embed in the JWT token
 * @return a Promise for a JWT
 */
function generateAuthToken(username) {
  return new Promise((resolve, reject) => {
    const payload = {
      username,
    };
    jwt.sign(
      payload,
      getEnvVar("JWT_SECRET"),
      { expiresIn: "1d" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      },
    );
  });
}

function trySendAuthTokenResponse(res, tokenPromise) {
  tokenPromise
    .then((token) => {
      res.status(200).send({ token });
    })
    .catch((error) => {
      console.error("Error generating auth token:", error);
      res.status(500).send({
        error: "Internal Server Error",
        message: "Failed to generate auth token",
      });
    });
}

export function registerAuthRoutes(app, credentialsProvider) {
  app.post("/api/users", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Username is required and must be a string",
      });
      return;
    }

    if (!email || typeof email !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Email is required and must be a string",
      });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Password is required and must be a string",
      });
      return;
    }

    credentialsProvider
      .registerUser(username, email, password)
      .then((success) => {
        if (success) {
          trySendAuthTokenResponse(res, generateAuthToken(username));
        } else {
          res.status(409).send({
            error: "Conflict",
            message: "Username already taken",
          });
        }
      });
  });

  app.post("/api/auth/tokens", (req, res) => {
    const { username, password } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Username is required and must be a string",
      });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Password is required and must be a string",
      });
      return;
    }

    credentialsProvider.verifyPassword(username, password).then((valid) => {
      if (valid) {
        trySendAuthTokenResponse(res, generateAuthToken(username));
      } else {
        res.status(401).send({
          error: "Unauthorized",
          message: "Invalid username or password",
        });
      }
    });
  });
}
