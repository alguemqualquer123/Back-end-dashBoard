import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import routes from "@routes/userRoutes";
const app = express();

const prisma = new PrismaClient({
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
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

app.use(express.json());
app.use("/", routes(prisma));

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

app.get("/routes", (req: Request, res: Response) => {
  const routes = app._router.stack
    .filter((r: any) => r.route)
    .map((r: any) => ({
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