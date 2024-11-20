import { PrismaClient } from "@prisma/client";

export async function deleteCategory(name: string): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    const CategoryInfos = await prisma.category.findMany({
      where: {
        name,
      },
    });

    await prisma.product.deleteMany({
      where: {
        categoryId: CategoryInfos[0].id,
      },
    });

    const ThisDelete = await prisma.category.delete({
      where: {
        name,
      },
    });

    if (ThisDelete) {
      return true;
    } else {
      new Error("Falha ao deletar categoria.");
      return;
    }
  } catch (error) {
    new Error("Falha ao deletar categoria: " + error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
