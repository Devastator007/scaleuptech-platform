import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { articles, legalPages, marketingPages, products, site } from "../src/content.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "dist/index.html",
  "dist/assets/styles.css",
  "dist/assets/site.js",
  "dist/assets/account.js",
  "dist/api/bootstrap.php",
  "dist/api/account.php",
  "dist/api/provision-admin.php",
  "dist/account/index.html",
  "dist/admin/index.html",
  "dist/app/jobpilot/index.html",
  "dist/product/job-autoapply/index.html",
  "dist/product/scale-cx/index.html",
  "dist/.htaccess",
  "dist/robots.txt",
  "dist/sitemap.xml",
  "dist/favicon.svg",
  "dist/apple-touch-icon.svg",
  "dist/manifest.webmanifest",
  "dist/scaleup-logo-128.webp",
  "dist/scaleup-logo-640.webp",
  "dist/favicon-180.png",
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
    "dist/account/index.html",
    "dist/admin/index.html",
    ...articles.map((article) => `dist/insights/${article.slug}/index.html`),
  ]
    .map(async (file) => ({ file, source: await readFile(resolve(root, file), "utf8") })),
);

for (const { file, source } of pages) {
  for (const marker of ["<title>", 'name="description"', 'rel="canonical"', 'favicon-180.png?v=', 'scaleup-logo-128.webp?v=', 'family=Alexandria', 'styles.css?v=', 'lang="en"', 'id="main"', `https://wa.me/${site.whatsapp}`]) {
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

for (const page of legalPages) {
  const source = await readFile(resolve(root, `dist/${page.slug}/index.html`), "utf8");
  if (!source.includes(`mailto:${site.supportEmail}`)) {
    throw new Error(`${page.slug} must direct document questions to product support`);
  }
  if (source.includes(`mailto:${site.email}`)) {
    throw new Error(`${page.slug} must not direct document questions to sales`);
  }
}

const contact = await readFile(resolve(root, "dist/contact/index.html"), "utf8");
for (const address of [site.email, site.supportEmail, site.securityEmail]) {
  if (!contact.includes(`mailto:${address}`)) throw new Error(`Contact page is missing ${address}`);
}

const jobPilotCallback = await readFile(resolve(root, "dist/app/jobpilot/index.html"), "utf8");
for (const marker of [
  'meta name="robots" content="noindex,nofollow"',
  'meta name="referrer" content="no-referrer"',
  'new URL("https://devastator007.github.io/ScaleUp-JobPilot/")',
  "destination.search = window.location.search",
  "destination.hash = window.location.hash",
  "window.location.replace(destination.toString())",
]) {
  if (!jobPilotCallback.includes(marker)) throw new Error(`JobPilot callback bridge is missing ${marker}`);
}

const accountApi = await readFile(resolve(root, "dist/api/account.php"), "utf8");
const bootstrap = await readFile(resolve(root, "dist/api/bootstrap.php"), "utf8");
const provisionAdmin = await readFile(resolve(root, "dist/api/provision-admin.php"), "utf8");
for (const marker of [
  "password_hash(", "password_verify(", "session_regenerate_id(true)",
  "require_csrf()", "require_user(true)", "'customer'", "admin_payment",
]) {
  if (!accountApi.includes(marker) && !bootstrap.includes(marker)) throw new Error(`Account backend is missing ${marker}`);
}
for (const forbidden of ["admin_email()", "role=\"admin\"", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL"]) {
  if (accountApi.includes(forbidden) || bootstrap.includes(forbidden)) throw new Error(`Account backend contains forbidden pattern ${forbidden}`);
}
if (!bootstrap.includes("'secure' => true") || !bootstrap.includes("'httponly' => true")) {
  throw new Error("Account session cookies are not secure");
}
if (!provisionAdmin.includes("PHP_SAPI !== 'cli'") || !provisionAdmin.includes('UPDATE users SET role="admin"')) {
  throw new Error("Admin provisioning must be CLI-only and persist the role server-side");
}

if (articles.length !== products.length * 4) {
  throw new Error(`Expected four articles per product; found ${articles.length} for ${products.length} products`);
}

const styles = await readFile(resolve(root, "dist/assets/styles.css"), "utf8");
for (const marker of [
  '[dir="rtl"] body { line-height: 1.85; }',
  '[dir="rtl"] .hero h1 {',
  "line-height: 1.34;",
  "text-wrap: balance;",
  "letter-spacing: 0;",
  "font-size: clamp(2.45rem, 10.5vw, 3.35rem);",
  ".contact-phone { direction: ltr; unicode-bidi: isolate;",
]) {
  if (!styles.includes(marker)) throw new Error(`RTL typography system is missing ${marker}`);
}

console.log(`Validated ${pages.length} pages and ${requiredFiles.length} required files`);
