import { PrismaClient } from "@prisma/client";

async function alteruserIp(license: string, ip: string): Promise<boolean> {
  const prisma = new PrismaClient();

  try {
    const checkExistentLicense = await prisma.licenses.findMany({
      where: { license },
    });

    if (!checkExistentLicense) {
      return false;
    }

    const updatedIp = await prisma.licenses.update({
      where: { license },
      data: { ip },
    });

    if (updatedIp) {
      console.log(`Ip da Licença ${license} alterado para:`, ip);
      return true;
    }
  } catch (error) {
    new Error(error)
    return
  }
}

export default alteruserIp;
