import express, { Request, Response } from "express";
import routes from "@routes/userRoutes";
const app = express();
import cors from "cors";
import { startCodeUpdater } from "./controllers/authCode";
import { testConnection } from "./middleware/connectionPrisma";
const isAUTH_CONTENT = process.env.AUTH_CONTENT === "true";

app.use(
  cors({
    // origin: ["*", "https://example.com", "https://another-example.com"], // only allow requests from these origins
    origin: "*", // only allow requests from these origins
    methods: ["GET", "POST", "PUT", "DELETE"], // only allow these methods
    headers: ["Content-Type", "Authorization"], // only allow these headers
    maxAge: 3600, // set the max age of the CORS configuration
    credentials: true, // allow credentials (e.g., cookies) to be sent with requests
  })
);


app.use(express.json());
app.use("/", routes());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  testConnection();
  if (isAUTH_CONTENT) {
    startCodeUpdater();
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});
