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
export default generateLicenseKey