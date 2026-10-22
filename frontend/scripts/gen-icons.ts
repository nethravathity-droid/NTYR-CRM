import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const pubDir = join("public", "icons");
const assetsDir = "assets";
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

mkdirSync(assetsDir, { recursive: true });

for (const size of sizes) {
  await sharp("public/icons/icon-source.svg")
    .resize(size, size)
    .png()
    .toFile(join(pubDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}

await sharp("public/icons/icon-source.svg")
  .resize(1024, 1024)
  .png()
  .toFile(join(assetsDir, "icon.png"));
console.log("Generated assets/icon.png");

const splashBackground = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#0a0a0a"/>
  <path fill="#863bff" d="M1366 680 L2049 1366 L1366 2052 L683 1366 Z"/>
  <circle cx="1366" cy="1200" r="120" fill="#ede6ff"/>
  <circle cx="1366" cy="1200" r="60" fill="#863bff"/>
</svg>
`);
await sharp(splashBackground)
  .png()
  .toFile(join(assetsDir, "splash.png"));
console.log("Generated assets/splash.png");

await sharp(splashBackground)
  .png()
  .toFile(join(assetsDir, "splash-dark.png"));
console.log("Generated assets/splash-dark.png");
