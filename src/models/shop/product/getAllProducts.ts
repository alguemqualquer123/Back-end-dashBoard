import { PrismaClient } from "@prisma/client";

export async function getAllProducts(): Promise<any> {
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    if (!products || products.length === 0) {
      console.log("Nenhum produto encontrado.");
      return null;
    }

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category ? product.category.name : "Sem categoria",
    }));

    return formattedProducts;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error("Erro ao buscar produtos.");
  } finally {
    await prisma.$disconnect();
  }
}
