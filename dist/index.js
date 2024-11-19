"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const userRoutes_1 = __importDefault(require("@routes/userRoutes"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
async function testConnection() {
    try {
        await prisma.$connect();
        console.log("Conexão bem-sucedida ao banco de dados!");
    }
    catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
app.use(express_1.default.json());
app.use("/", (0, userRoutes_1.default)(prisma));
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});
app.get("/routes", (req, res) => {
    const routes = app._router.stack
        .filter((r) => r.route)
        .map((r) => ({
        method: Object.keys(r.route.methods).join(", ").toUpperCase(),
        path: r.route.path,
    }));
    res.json(routes);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    testConnection();
    console.log(`Server is running on http://localhost:${PORT}`);
});
