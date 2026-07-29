import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { articles, legalPages, marketingPages, products, site } from "../src/content.mjs";
import { renderArticle, renderContact, renderHome, renderInsights, renderLegal, renderMarketing, renderProduct } from "../src/render.mjs";

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

for (const page of marketingPages) {
  const pageDirectory = resolve(dist, page.slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(resolve(pageDirectory, "index.html"), renderMarketing(page));
}

await mkdir(resolve(dist, "contact"), { recursive: true });
await writeFile(resolve(dist, "contact", "index.html"), renderContact());
await mkdir(resolve(dist, "insights"), { recursive: true });
await writeFile(resolve(dist, "insights", "index.html"), renderInsights());

for (const article of articles) {
  const articleDirectory = resolve(dist, "insights", article.slug);
  await mkdir(articleDirectory, { recursive: true });
  await writeFile(resolve(articleDirectory, "index.html"), renderArticle(article));
}

await cp(resolve(root, "src", "styles.css"), resolve(dist, "assets", "styles.css"));
await cp(resolve(root, "src", "site.js"), resolve(dist, "assets", "site.js"));
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#081a16"/><path d="M43 19H28c-6 0-10 3-10 8 0 12 24 5 24 13 0 3-3 5-8 5H19" fill="none" stroke="#c9f564" stroke-width="7" stroke-linecap="round"/></svg>`;
await writeFile(resolve(dist, "favicon.svg"), favicon);
await writeFile(resolve(dist, "apple-touch-icon.svg"), favicon);
await writeFile(resolve(dist, "manifest.webmanifest"), JSON.stringify({
  name: site.brand,
  short_name: "ScaleUp",
  start_url: "/",
  display: "standalone",
  background_color: "#f3f0e8",
  theme_color: "#081a16",
  icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
}, null, 2));

const routes = [
  "/",
  ...products.map((product) => `/product/${product.slug}/`),
  ...legalPages.map((page) => `/${page.slug}/`),
  ...marketingPages.map((page) => `/${page.slug}/`),
  "/contact/",
  "/insights/",
  ...articles.map((article) => `/insights/${article.slug}/`),
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
