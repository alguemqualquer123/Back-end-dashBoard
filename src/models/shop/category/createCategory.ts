import { PrismaClient } from "@prisma/client";

export async function createCategory(name: string): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    const ThisCreate = await prisma.category.create({
      data: {
        name,
      },
    });
    if (ThisCreate) {
      return true;
    } else {
      new Error("Falha ao criar produto.");
      return;
    }
  } catch (error) {
    new Error("Falha ao criar produto: " + error);
    return false;
  }
}
