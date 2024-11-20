import { PrismaClient } from "@prisma/client";
import generateLicenseKey from "./generateLicenseKey";

async function createLicense(
  prisma: PrismaClient,
  userId: number,
  resource: string,
  ip: string,
  days?: number
): Promise<any> {
  const currentTime = new Date();
  const newLicenseKey = generateLicenseKey();
  const expirationTime = new Date(
    currentTime.getTime() + 365146 * 24 * 60 * 60 * 1000
  );

  if (!days) {
    days = 30;
  }
  const newLicense = await prisma.licenses.create({
    data: {
      resource: resource,
      license: newLicenseKey,
      ip: ip || "127.0.0.1",
      time: currentTime,
      expiredIn: expirationTime,
      userId,
    },
  });

  console.log("Licença criada:", newLicense);
  return true;
}

export default createLicense;
