import { PrismaClient } from "@prisma/client";

interface getUserInfosTypes {
  id?: number;
  email?: string;
  name?: string;
}

export async function getUserInfos(Data: getUserInfosTypes) {
  const prisma = new PrismaClient();

  try {
    if (Data?.email) {
      const User = await prisma.user.findUnique({
        where: {
          email: Data.email,
        },
      });

      if (!User) throw new Error("Usuário não encontrado.");

      const Licenses = await prisma.licenses.findMany({
        where: {
          userId: User.id,
        },
      });

      const UserAdmin = await prisma.admin.findUnique({
        where: {
          email: User.email,
        },
      });

      return {
        user: {
          name: User.name,
          id: User.id,
          email: User.email,
          role: UserAdmin?.role || "Membro",
          avatar: User.avatar,
        },
        licenses: Licenses,
      };
    }

    if (Data?.id) {
      const User = await prisma.user.findUnique({
        where: {
          id: Data.id,
        },
      });

      if (!User) throw new Error("Usuário não encontrado.");

      const UserAdmin = await prisma.admin.findUnique({
        where: {
          email: User.email,
        },
      });

      const Licenses = await prisma.licenses.findMany({
        where: {
          userId: User.id,
        },
      });

      return {
        user: {
          name: User.name,
          id: User.id,
          email: User.email,
          role: UserAdmin?.role || "Membro",
          avatar: User.avatar,
        },
        licenses: Licenses,
      };
    }

    if (Data?.name) {
      const Users = await prisma.user.findMany({
        where: {
          name: Data.name,
        },
      });

      if (Users.length === 0) throw new Error("Usuário não encontrado.");

      const User = Users[0];
      const UserAdmin = await prisma.admin.findUnique({
        where: {
          email: User.email,
        },
      });

      const Licenses = await prisma.licenses.findMany({
        where: {
          userId: User.id,
        },
      });

      return {
        user: {
          name: User.name,
          id: User.id,
          email: User.email,
          role: UserAdmin?.role || "Membro",
          avatar: User.avatar,
        },
        licenses: Licenses,
      };
    }

    return;
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    throw error; 
  }
}
