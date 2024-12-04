import { PrismaClient } from "@prisma/client";

async function deleteLicense(
  prisma: PrismaClient,
  license: string
): Promise<boolean> {
  
  const checkExistentLicense = await prisma.licenses.findMany({
    where: { license },
  });

  if (!checkExistentLicense) {
    return false;
  }

  const deleteLicense = await prisma.licenses.deleteMany({
    where: { license },
  });

  if (deleteLicense) {
    console.log("Licença deletada:", deleteLicense);
    return true;
  }
}

export default deleteLicense;
