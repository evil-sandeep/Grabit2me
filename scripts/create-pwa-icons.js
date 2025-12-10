const sharp = require('sharp');
const path = require('path');

async function createIcons() {
  const inputPath = path.join(__dirname, '../public/adaptive-icon.png');
  
  // Create icons with white background for better visibility
  const sizes = [
    { size: 192, name: 'icon-192-solid.png' },
    { size: 512, name: 'icon-512-solid.png' },
  ];

  for (const { size, name } of sizes) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toFile(path.join(__dirname, '../public', name));
    
    console.log(`✓ Created ${name}`);
  }
}

createIcons().catch(console.error);
