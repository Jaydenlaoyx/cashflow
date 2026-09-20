import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDirectory = path.join(process.cwd(), "public");

const iconSvg = `
<svg
  width="512"
  height="512"
  viewBox="0 0 512 512"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient
      id="background"
      x1="64"
      y1="32"
      x2="448"
      y2="480"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#3B82F6"/>
      <stop offset="1" stop-color="#1D4ED8"/>
    </linearGradient>

    <linearGradient
      id="line"
      x1="130"
      y1="330"
      x2="388"
      y2="170"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#BFDBFE"/>
      <stop offset="1" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="112" fill="url(#background)"/>

  <rect
    x="106"
    y="106"
    width="300"
    height="300"
    rx="72"
    fill="white"
    fill-opacity="0.12"
  />

  <path
    d="M142 344L218 278L278 310L374 190"
    stroke="url(#line)"
    stroke-width="34"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <circle cx="142" cy="344" r="22" fill="white"/>
  <circle cx="218" cy="278" r="22" fill="white"/>
  <circle cx="278" cy="310" r="22" fill="white"/>
  <circle cx="374" cy="190" r="22" fill="white"/>
</svg>
`;

const icons = [
  {
    filename: "icon-192x192.png",
    size: 192,
  },
  {
    filename: "icon-512x512.png",
    size: 512,
  },
  {
    filename: "apple-touch-icon.png",
    size: 180,
  },
  {
    filename: "favicon-32x32.png",
    size: 32,
  },
];

await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  icons.map(({ filename, size }) =>
    sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(outputDirectory, filename)),
  ),
);

console.log("CashFlow PWA icons generated successfully.");