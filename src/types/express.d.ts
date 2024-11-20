// express.d.ts
import * as express from "express";
import { UserPayload } from "../middleware/middleware";

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}
