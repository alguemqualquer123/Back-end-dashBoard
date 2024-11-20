import { PrismaClient } from "@prisma/client";

export async function updateProduct(
  id: number,
  name: string,
  description: string,
  price: number,
  stock: number,
  categoryId: number,
  image : string,
): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      console.log("Produto não encontrado.");
      return false;
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      console.log("Categoria não encontrada.");
      return false;
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image
      },
    });

    console.log("Produto atualizado com sucesso:", updatedProduct);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error("Erro ao atualizar produto.");
  } finally {
    await prisma.$disconnect();
  }
}
