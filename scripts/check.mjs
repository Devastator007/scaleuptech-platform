import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../src/content.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "dist/index.html",
  "dist/assets/styles.css",
  "dist/assets/site.js",
  "dist/robots.txt",
  "dist/sitemap.xml",
  ...products.map((product) => `dist/product/${product.slug}/index.html`),
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const pages = await Promise.all(
  ["dist/index.html", ...products.map((product) => `dist/product/${product.slug}/index.html`)]
    .map(async (file) => ({ file, source: await readFile(resolve(root, file), "utf8") })),
);

for (const { file, source } of pages) {
  for (const marker of ["<title>", 'name="description"', 'rel="canonical"', 'lang="en"', 'id="main"']) {
    if (!source.includes(marker)) throw new Error(`${file} is missing ${marker}`);
  }

  const localLinks = [...source.matchAll(/href="(\/[^"#?]*)"/g)].map((match) => match[1]);
  for (const link of localLinks) {
    if (link.startsWith("/assets/")) continue;
    const target = link === "/" ? "dist/index.html" : `dist${link}index.html`;
    await access(resolve(root, target));
  }
}

console.log(`Validated ${pages.length} pages and ${requiredFiles.length} required files`);
