import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { legalPages, products, site } from "../src/content.mjs";
import { renderHome, renderLegal, renderProduct } from "../src/render.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "assets"), { recursive: true });
await writeFile(resolve(dist, "index.html"), renderHome());

for (const product of products) {
  const productDirectory = resolve(dist, "product", product.slug);
  await mkdir(productDirectory, { recursive: true });
  await writeFile(resolve(productDirectory, "index.html"), renderProduct(product));
}

for (const page of legalPages) {
  const pageDirectory = resolve(dist, page.slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(resolve(pageDirectory, "index.html"), renderLegal(page));
}

await cp(resolve(root, "src", "styles.css"), resolve(dist, "assets", "styles.css"));
await cp(resolve(root, "src", "site.js"), resolve(dist, "assets", "site.js"));

const routes = [
  "/",
  ...products.map((product) => `/product/${product.slug}/`),
  ...legalPages.map((page) => `/${page.slug}/`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${site.url}${route}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(resolve(dist, "sitemap.xml"), sitemap);
await writeFile(resolve(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await writeFile(resolve(dist, "_headers"), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);
await writeFile(resolve(dist, ".htaccess"), `Options -Indexes
DirectoryIndex index.html

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
</IfModule>
`);

console.log(`Built ${routes.length} routes in dist/`);
