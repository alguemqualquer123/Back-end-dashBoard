import { PrismaClient } from "@prisma/client";

export const validRoles = ["Ceo", "Coo", "Gerente"];
const DefaultRole = "Membro";

export async function isAdmin(email: string): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    let user = await prisma.admin.findUnique({
      where: { email },
    });
    if (!user) {
      user = await prisma.admin.create({
        data: {
          email,
          role: DefaultRole,
        },
      });
    }

    return validRoles.includes(user.role);
  } catch (error) {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
