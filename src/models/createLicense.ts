import { PrismaClient } from "@prisma/client";


function generateLicenseKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let licenseKey = '';

  for (let i = 0; i < 4; i++) {
      let group = '';
      for (let j = 0; j < 4; j++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          group += characters[randomIndex];
      }
      licenseKey += group;
      if (i < 3) {
          licenseKey += '-';
      }
  }

  return licenseKey;
}


 async function createLicense(prisma: PrismaClient, userId: number, resource: string, ip: string, days?: number): Promise<any> {
  const currentTime = new Date();
  const newLicenseKey = generateLicenseKey();
  const expirationTime = new Date(currentTime.getTime() + (365146 * 24 * 60 * 60 * 1000));

  if (!days) {
    days = 30;
  }
  const newLicense = await prisma.licenses.create({
    data: {
      resource: resource,
      license: newLicenseKey,
      ip: ip || '127.0.0.1',
      time: currentTime,
      expiredIn: expirationTime,
      userId
    },
  });
 
  console.log('Licença criada:', newLicense);
  return true
}

export default createLicense