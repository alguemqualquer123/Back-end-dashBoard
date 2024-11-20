import { PrismaClient } from "@prisma/client";

export async function deleteProduct(id: number): Promise<boolean> {
  const prisma = new PrismaClient();
  try {

    const ProductInfo = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!ProductInfo) {
      new Error("Falha ao deletar produto.");
      return
    }

    const ThisDelete = await prisma.product.deleteMany({
      where: { id: id },
    });

    if (ThisDelete) {
      return true;
    } else {
      new Error("Falha ao deletar produto.");
      return;
    }
  } catch (error) {
    new Error("Falha ao deletar produto: " + error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
