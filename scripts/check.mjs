import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { articles, legalPages, marketingPages, products, site } from "../src/content.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "dist/index.html",
  "dist/assets/styles.css",
  "dist/assets/site.js",
  "dist/.htaccess",
  "dist/robots.txt",
  "dist/sitemap.xml",
  "dist/favicon.svg",
  "dist/apple-touch-icon.svg",
  "dist/manifest.webmanifest",
  ...products.map((product) => `dist/product/${product.slug}/index.html`),
  ...legalPages.map((page) => `dist/${page.slug}/index.html`),
  ...marketingPages.map((page) => `dist/${page.slug}/index.html`),
  "dist/contact/index.html",
  "dist/insights/index.html",
  ...articles.map((article) => `dist/insights/${article.slug}/index.html`),
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const pages = await Promise.all(
  [
    "dist/index.html",
    ...products.map((product) => `dist/product/${product.slug}/index.html`),
    ...legalPages.map((page) => `dist/${page.slug}/index.html`),
    ...marketingPages.map((page) => `dist/${page.slug}/index.html`),
    "dist/contact/index.html",
    "dist/insights/index.html",
    ...articles.map((article) => `dist/insights/${article.slug}/index.html`),
  ]
    .map(async (file) => ({ file, source: await readFile(resolve(root, file), "utf8") })),
);

for (const { file, source } of pages) {
  for (const marker of ["<title>", 'name="description"', 'rel="canonical"', 'rel="icon"', 'lang="en"', 'id="main"', `https://wa.me/${site.whatsapp}`]) {
    if (!source.includes(marker)) throw new Error(`${file} is missing ${marker}`);
  }

  const localLinks = [...source.matchAll(/href="(\/[^"#?]*)"/g)].map((match) => match[1]);
  for (const link of localLinks) {
    if (link.startsWith("/assets/")) continue;
    const isFile = /\.[a-z0-9]+$/i.test(link);
    const target = link === "/" ? "dist/index.html" : isFile ? `dist${link}` : `dist${link}index.html`;
    await access(resolve(root, target));
  }
}

const contact = await readFile(resolve(root, "dist/contact/index.html"), "utf8");
for (const address of [site.email, site.supportEmail, site.securityEmail]) {
  if (!contact.includes(`mailto:${address}`)) throw new Error(`Contact page is missing ${address}`);
}

if (articles.length !== products.length * 4) {
  throw new Error(`Expected four articles per product; found ${articles.length} for ${products.length} products`);
}

console.log(`Validated ${pages.length} pages and ${requiredFiles.length} required files`);
