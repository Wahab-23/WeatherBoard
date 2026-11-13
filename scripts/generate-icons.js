import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Minimalist, premium Linear/Mercury inspired icon SVG
const createSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0A0D14"/>
  <rect x="1" y="1" width="510" height="510" rx="127" stroke="rgba(255, 255, 255, 0.1)" stroke-width="2"/>
  
  <defs>
    <radialGradient id="sunGlow" cx="0%" cy="0%" r="100%">
      <stop offset="0%" stop-color="#FCD34D" stop-opacity="1"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="cloudGrad" x1="120" y1="180" x2="380" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Sun Circle -->
  <circle cx="310" cy="190" r="72" fill="url(#sunGlow)" opacity="0.95"/>
  <circle cx="310" cy="190" r="88" stroke="#FBBF24" stroke-width="2" opacity="0.25"/>

  <!-- Minimal Modern Cloud -->
  <path d="M176 348C136.235 348 104 315.765 104 276C104 238.647 132.484 207.935 168.91 204.381C184.234 162.774 224.288 134 272 134C333.856 134 384 184.144 384 246C384 249.438 383.845 252.839 383.541 256.196C408.85 264.445 427 288.163 427 316C427 351.346 398.346 380 363 380L186 380C148 380 120 354 120 324" 
    stroke="url(#cloudGrad)" 
    stroke-width="28" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    fill="none"
    filter="url(#subtleGlow)"
  />

  <circle cx="210" cy="310" r="10" fill="#38BDF8"/>
  <circle cx="260" cy="310" r="10" fill="#818CF8"/>
  <circle cx="310" cy="310" r="10" fill="#C084FC"/>
</svg>
`;

async function generate() {
  const svg512 = createSvg(512);
  const svgPath = path.resolve(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svg512);

  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.resolve(publicDir, 'pwa-512x512.png'));

  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile(path.resolve(publicDir, 'pwa-192x192.png'));

  await sharp(Buffer.from(svg512))
    .resize(180, 180)
    .png()
    .toFile(path.resolve(publicDir, 'apple-touch-icon.png'));

  console.log('PWA icons successfully generated in public/ directory.');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});

