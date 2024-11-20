import { PrismaClient } from "@prisma/client";
import { Worker } from "worker_threads";
import path from "path";
import dotenv from "dotenv";
const prisma = new PrismaClient();
dotenv.config();

const isDebugMode = process.env.DEBUGMODE === "true";
export async function startCodeUpdater() {
  const workerPath = path.resolve(__dirname, "codeUpdater.js");

  const worker = new Worker(workerPath);

  const users = await prisma.user.findMany();
  worker.postMessage({ users });

  worker.on(
    "message",
    async (updatedUser: { id: number; code: string; email: string }) => {
      await prisma.user.update({
        where: { id: updatedUser.id },
        data: { currentCode: updatedUser.code },
      });
      if (isDebugMode) {
        console.log(
          `Código atualizado para o usuário: ${updatedUser.email} : ${updatedUser.code}`
        );
      }
    }
  );

  worker.on("error", (err) => {
    if (isDebugMode) {
      console.error("Erro no Worker:", err);
    }
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      if (isDebugMode) {
        console.error(`Worker finalizado com código de erro: ${code}`);
      }
    } else {
      if (isDebugMode) {
        console.log("Worker finalizado com sucesso.");
      }
    }
  });
}
