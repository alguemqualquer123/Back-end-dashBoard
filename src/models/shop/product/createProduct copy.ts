import { PrismaClient } from "@prisma/client";

export async function createProduct(
  name: string,
  description: string,
  price: number,
  stock: number,
  categoryId: number
): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    const GetCattegory = await prisma.category.findUnique({
      where: {
        id: categoryId
      }
    })
    if (!GetCattegory) {
      console.log("Categoria não existente para o produto.")
      new Error("Categoria não existente para o produto.");
      return
    }

    const ThisCreate = await prisma.product.create({
      data: {
        name,
        price,
        categoryId,
        description,
        stock,
      },
    });
    if (ThisCreate) {
      return true;
    } else {
      new Error("Falha ao criar produto.");
  
      return;
    }
  } catch (error) {
  
    return error;;
  }
}
