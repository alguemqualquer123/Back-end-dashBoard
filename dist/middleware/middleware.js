"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessTokenSecret = process.env.JWT_SECRET || "your_jwt_secret";
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                res.sendStatus(403);
                return;
            }
            if (user) {
                req.user = user;
            }
            next();
        });
    }
    else {
        console.error("Cabeçalho de autorização não encontrado.");
        res.sendStatus(401);
    }
};
exports.authenticateJWT = authenticateJWT;
