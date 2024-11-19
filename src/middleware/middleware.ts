import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const accessTokenSecret = process.env.JWT_SECRET || "your_jwt_secret";

export type UserPayload =
  | {
      id: number;
      email: string;
    }
  | undefined;

export const authenticateJWT = (
  req: any,
  res: any,
  next: any
) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, accessTokenSecret, (err: any, user: any) => {
      if (err) {
        res.sendStatus(403)
        return 
      }

      if (user) {
        req.user = user;
      }
      next();
    });
  } else {
    console.error("Cabeçalho de autorização não encontrado.");
    res.sendStatus(401);
  }
};
