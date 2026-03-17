import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

export function verifyAuthToken(req, res, next) {
  // Call next() to run the next middleware or request handler
  const authHeader = req.get("Authorization");
  // This header's value should say "Bearer <token string>".  Discard the Bearer part.
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).end(); // No token -- cancel subsequent handlers
  } else {
    jwt.verify(token, getEnvVar("JWT_SECRET"), (error, decodedToken) => {
      if (decodedToken) {
        req.userInfo = decodedToken; // Modify the request for subsequent handlers
        next();
      } else {
        res.status(401).end(); // Token is expired or otherwise invalid
      }
    });
  }
}
