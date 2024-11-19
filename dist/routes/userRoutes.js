"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = require("@/middleware/middleware");
const createLicense_1 = __importDefault(require("@/models/createLicense"));
dotenv_1.default.config();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.default = (prisma) => {
    const router = (0, express_1.Router)();
    // http://localhost:4041/register
    // {
    // "name": "Vini Santos",
    // "email": "danilovinicius1790@gmail.com",
    // "password": "aaa"
    // }
    router.post("/register", middleware_1.authenticateJWT, async (req, res) => {
        const { name, email, password } = req.body;
        if (!name) {
            res.status(400).json({ message: "Nome de úsuario não definido." });
            return;
        }
        if (!email) {
            res.status(400).json({ message: "Email não definido." });
            return;
        }
        if (!password) {
            res.status(400).json({ message: "Senha não definida." });
            return;
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: "Usuário já existe." });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    avatar: req.file ? req.file.buffer.toString("base64") : null,
                },
            });
            res.status(201).json({ message: "Usuário criado com sucesso!", user });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao criar usuário." });
        }
    });
    // http://localhost:4041/login
    // {
    //  "email": "danilovinicius1790@gmail.com",
    //  "password": "aaa"
    // }
    //
    router.post("/login", async (req, res) => {
        const { email, password } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email não definido." });
            return;
        }
        if (!password) {
            res.status(400).json({ message: "Senha não definida." });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(400).json({ message: "Usuário não encontrado." });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Senha inválida." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "your_jwt_secret", {
            expiresIn: "1h",
        });
        res.json({ message: "Login bem-sucedido!", token });
    });
    // http://localhost:4041/createLicense
    router.post("/createLicense", middleware_1.authenticateJWT, async (req, res) => {
        const { email, resource, ip, days } = req.body;
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({ message: "Token não fornecido." });
        }
        try {
            if (!email) {
                res.status(400).json({ message: "Email não definido." });
                return;
            }
            const user = await prisma.user.findUnique({ where: { email } });
            const userId = user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado." });
            }
            if (!resource) {
                res.status(400).json({ message: "Resource não definido." });
                return;
            }
            if (!ip) {
                res.status(400).json({ message: "IP não definida." });
                return;
            }
            if (!userId) {
                new Error("id Não Definido.");
                return false;
            }
            const newLicense = (0, createLicense_1.default)(prisma, userId, resource, ip, days);
            if (newLicense) {
                res.json({ message: "Licensa gerada com sucesso!", newLicense });
                return newLicense;
            }
        }
        catch (error) {
            return res.status(401).json({ error: error });
        }
    });
    // http://localhost:4041/getUserResources
    router.get("/getUserResources", middleware_1.authenticateJWT, async (req, res) => {
        try {
            const { email } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });
            const userId = user?.id;
            const UserResources = await prisma.licenses.findMany({
                where: { userId },
            });
            res.status(200).json(UserResources);
        }
        catch (error) {
            res.status(500);
        }
    });
    // http://localhost:4041/insertAdmin
    router.post("/insertAdmin", middleware_1.authenticateJWT, async (req, res) => {
        const { newRole, email } = req.body;
        try {
            if (!newRole || !email) {
                res.status(400).json({ error: "Role and email are required." });
                return;
            }
            const validRoles = [
                "Ceo",
                "Coo",
                "Gerente",
                "Vendedor",
                "Parceiro",
                "Cliente",
                "Membro",
            ];
            if (!validRoles.includes(newRole)) {
                res.status(400).json({ error: "Cargo não cadastrado." });
                return;
            }
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });
            if (!existingEmail) {
                res.status(400).json({ error: "Email não cadastrado." });
                return;
            }
            const role = newRole;
            const existingAdmin = await prisma.admin.findUnique({
                where: { email },
            });
            if (existingAdmin) {
                const updatedAdmin = await prisma.admin.update({
                    where: { email },
                    data: { role },
                });
                res.status(200).json(updatedAdmin);
            }
            else {
                const newAdmin = await prisma.admin.create({
                    data: {
                        role,
                        email,
                    },
                });
                res.status(201).json(newAdmin);
            }
        }
        catch (error) {
            console.error("Erro ao inserir ou atualizar administrador:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
    // http://localhost:4041/promoteAdmin
    router.put("/promoteAdmin", async (req, res) => {
        const { email, newRole } = req.body;
        const validRoles = [
            "Ceo",
            "Coo",
            "Gerente",
            "Vendedor",
            "Parceiro",
            "Cliente",
            "Membro",
        ];
        if (!email || !newRole || !validRoles.includes(newRole)) {
            res
                .status(400)
                .json({ error: "Email and a valid new role are required." });
            return;
        }
        try {
            const existingAdmin = await prisma.admin.findUnique({
                where: { email },
            });
            if (!existingAdmin) {
                res.status(404).json({ error: "Admin not found." });
                return;
            }
            const updatedAdmin = await prisma.admin.update({
                where: { email },
                data: { role: newRole },
            });
            res.status(200).json(updatedAdmin);
        }
        catch (error) {
            console.error("Error promoting admin:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
    // http://localhost:4041/demitAdmin
    // Rota para demitir um administrador
    router.delete("/demitAdmin", async (req, res) => {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required." });
            return;
        }
        try {
            const existingAdmin = await prisma.admin.findUnique({
                where: { email },
            });
            if (!existingAdmin) {
                res.status(404).json({ error: "Admin not found." });
                return;
            }
            await prisma.admin.delete({
                where: { email },
            });
            res.status(200).json({ message: "Admin demitted successfully." });
        }
        catch (error) {
            console.error("Error demitting admin:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
    // http://localhost:4041/checkIsAdmin
    router.post("/checkIsAdmin", middleware_1.authenticateJWT, async (req, res) => {
        const { email } = req.body;
        try {
            if (!email) {
                res.status(400).json({ error: "Role and email are required." });
                return;
            }
            const validAdmins = [
                "Ceo",
                "Coo",
                "Gerente",
            ];
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });
            if (!existingEmail) {
                res.status(400).json({ error: "Email não cadastrado." });
                return;
            }
            const existingAdmin = await prisma.admin.findUnique({
                where: { email },
            });
            if (!existingAdmin) {
                res.status(400).json({ error: "Email não cadastrado." });
                return;
            }
            if (validAdmins.includes(existingAdmin.role)) {
                res.status(200).send(true);
                return;
            }
            else {
                res.status(200).send(false);
                return;
            }
            res.status(200).send(false);
            return;
        }
        catch (error) {
            console.error("Erro ao inserir ou atualizar administrador:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
    return router;
};
