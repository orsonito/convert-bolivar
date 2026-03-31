import { writeFile } from "node:fs/promises";
import pngToIco from "png-to-ico";
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const publicDir = join(rootDir, "public");
const appDir = join(rootDir, "app");

/** Green circle frame (corners transparent); flying Bs banknote inside. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="greenCircle" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="55%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
    <linearGradient id="greenRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#052e16" stop-opacity="0.25"/>
    </linearGradient>
    <linearGradient id="billPaper" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffef8"/>
      <stop offset="100%" stop-color="#f2edd4"/>
    </linearGradient>
    <filter id="billShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="10" stdDeviation="8" flood-color="#052e16" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Green disk (inscribed in square → transparent corners) -->
  <circle cx="256" cy="256" r="252" fill="url(#greenCircle)"/>
  <circle cx="256" cy="256" r="252" fill="url(#greenRim)"/>
  <circle cx="256" cy="256" r="246" fill="none" stroke="#052e16" stroke-width="4" opacity="0.35"/>
  <circle cx="256" cy="256" r="238" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>

  <!-- Speed lines -->
  <g opacity="0.4" stroke="#ecfdf5" stroke-width="7" stroke-linecap="round" fill="none">
    <path d="M 56 300 Q 110 275 168 258"/>
    <path d="M 44 340 Q 108 310 188 288"/>
    <path d="M 72 260 Q 118 242 168 228"/>
  </g>

  <ellipse cx="278" cy="348" rx="118" ry="22" fill="#052e16" opacity="0.15" transform="rotate(-14 278 348)"/>

  <!-- Flying banknote (Bs) -->
  <g filter="url(#billShadow)" transform="translate(256 268) rotate(-14) translate(-256 -268)">
    <rect x="118" y="188" width="276" height="168" rx="14" fill="url(#billPaper)" stroke="#14532d" stroke-width="6"/>
    <rect x="134" y="204" width="244" height="136" rx="9" fill="none" stroke="#166534" stroke-width="2.5" opacity="0.45"/>
    <circle cx="156" cy="222" r="12" fill="none" stroke="#166534" stroke-width="3"/>
    <circle cx="356" cy="322" r="12" fill="none" stroke="#166534" stroke-width="3"/>
    <path d="M 164 268 h 48 M 300 268 h 48" stroke="#166534" stroke-width="2.5" stroke-linecap="round" opacity="0.45"/>
    <text x="256" y="278" text-anchor="middle" font-size="72" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" font-weight="700" fill="#14532d" letter-spacing="-0.02em">Bs</text>
    <text x="256" y="312" text-anchor="middle" font-size="20" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" font-weight="600" fill="#15803d" letter-spacing="0.35em">VES</text>
  </g>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(192, 192).png().toFile(join(publicDir, "icon-192.png"));
await sharp(buf).resize(512, 512).png().toFile(join(publicDir, "icon-512.png"));

const png32 = await sharp(buf).resize(32, 32).png().toBuffer();
const png16 = await sharp(buf).resize(16, 16).png().toBuffer();
const icoBuf = await pngToIco([png32, png16]);
await writeFile(join(appDir, "favicon.ico"), icoBuf);

console.log(
  "Wrote public/icon-192.png, public/icon-512.png, and app/favicon.ico",
);
