import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { articles, legalPages, marketingPages, products, site } from "../src/content.mjs";
import { renderAccountPage, renderArticle, renderContact, renderHome, renderInsights, renderLegal, renderMarketing, renderProduct } from "../src/render.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

function routeFile(route) {
  return route === "/" ? resolve(dist, "index.html") : resolve(dist, route.replace(/^\//, ""), "index.html");
}

function localizedPath(locale, route) {
  return `/${locale}${route === "/" ? "/" : route}`;
}

function localizeInternalLinks(source, locale) {
  return source.replace(/href="\/([^"?#]*)([?#][^"]*)?"/g, (match, target = "", suffix = "") => {
    const path = `/${target}`;
    if (
      path === "/en/" || path.startsWith("/en/") ||
      path === "/ar/" || path.startsWith("/ar/") ||
      path.startsWith("/assets/") || path.startsWith("/api/") || path.startsWith("/app/") ||
      path.startsWith("/favicon") || path.startsWith("/scaleup-logo") || path.startsWith("/apple-touch") ||
      path === "/manifest.webmanifest" || path === "/sitemap.xml" || path === "/robots.txt" ||
      /\.[a-z0-9]+$/i.test(path)
    ) return match;
    return `href="/${locale}${path}${suffix}"`;
  });
}

function localizedHtml(source, route, locale) {
  const isArabic = locale === "ar";
  const path = localizedPath(locale, route);
  const canonical = `${site.url}${path}`;
  const alternatePath = route === "/" ? "/" : route;
  const alternates = [
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="alternate" hreflang="en" href="${site.url}/en${alternatePath}">`,
    `<link rel="alternate" hreflang="ar-EG" href="${site.url}/ar${alternatePath}">`,
    `<link rel="alternate" hreflang="x-default" href="${site.url}/en${alternatePath}">`,
  ].join("\n    ");

  return localizeInternalLinks(source, locale)
    .replace(/<html lang="en" dir="ltr">/, `<html lang="${isArabic ? "ar-EG" : "en"}" dir="${isArabic ? "rtl" : "ltr"}">`)
    .replace(/<link rel="canonical" href="[^"]+">/, alternates)
    .replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${canonical}">`);
}

function redirectPage(destination) {
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <link rel="canonical" href="${site.url}${destination}">
  <meta http-equiv="refresh" content="0;url=${destination}">
  <title>Redirecting | ScaleUp Tech</title>
</head>
<body><a href="${destination}">Continue to ScaleUp Tech</a></body>
</html>`;
}

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "assets"), { recursive: true });
await writeFile(resolve(dist, "index.html"), renderHome());

for (const product of products) {
  const productDirectory = resolve(dist, "product", product.slug);
  await mkdir(productDirectory, { recursive: true });
  await writeFile(resolve(productDirectory, "index.html"), renderProduct(product));
}

for (const [legacySlug, currentSlug] of [["job-autoapply", "jobpilot"], ["scale-cx", "scalecx"]]) {
  const legacyDirectory = resolve(dist, "product", legacySlug);
  await mkdir(legacyDirectory, { recursive: true });
  await writeFile(resolve(legacyDirectory, "index.html"), redirectPage(`/en/product/${currentSlug}/`));
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
await cp(resolve(root, "src", "account.js"), resolve(dist, "assets", "account.js"));
await cp(resolve(root, "src", "assets", "scaleup-logo-128.webp"), resolve(dist, "scaleup-logo-128.webp"));
await cp(resolve(root, "src", "assets", "scaleup-logo-640.webp"), resolve(dist, "scaleup-logo-640.webp"));
await cp(resolve(root, "src", "assets", "favicon-180.png"), resolve(dist, "favicon-180.png"));
await mkdir(resolve(dist, "api"), { recursive: true });
await cp(resolve(root, "src", "backend", "bootstrap.php"), resolve(dist, "api", "bootstrap.php"));
await cp(resolve(root, "src", "backend", "account.php"), resolve(dist, "api", "account.php"));
await cp(resolve(root, "src", "backend", "provision-admin.php"), resolve(dist, "api", "provision-admin.php"));
await mkdir(resolve(dist, "account"), { recursive: true });
await writeFile(resolve(dist, "account", "index.html"), renderAccountPage(false));
await mkdir(resolve(dist, "admin"), { recursive: true });
await writeFile(resolve(dist, "admin", "index.html"), renderAccountPage(true));
await mkdir(resolve(dist, "app", "jobpilot"), { recursive: true });
await writeFile(resolve(dist, "app", "jobpilot", "index.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="referrer" content="no-referrer">
  <title>Opening JobPilot | ScaleUp Tech</title>
</head>
<body>
  <main>
    <h1>Opening JobPilot…</h1>
    <p>Your secure sign-in session is being transferred to the application.</p>
    <noscript><p>JavaScript is required to complete secure sign-in.</p></noscript>
  </main>
  <script>
    (() => {
      const destination = new URL("https://devastator007.github.io/ScaleUp-JobPilot/");
      destination.search = window.location.search;
      destination.hash = window.location.hash;
      window.location.replace(destination.toString());
    })();
  </script>
</body>
</html>`);
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#081a16"/><path d="M43 19H28c-6 0-10 3-10 8 0 12 24 5 24 13 0 3-3 5-8 5H19" fill="none" stroke="#c9f564" stroke-width="7" stroke-linecap="round"/></svg>`;
await writeFile(resolve(dist, "favicon.svg"), favicon);
await writeFile(resolve(dist, "apple-touch-icon.svg"), favicon);
await writeFile(resolve(dist, "manifest.webmanifest"), JSON.stringify({
  name: site.brand,
  short_name: "ScaleUp",
  start_url: "/en/",
  display: "standalone",
  background_color: "#f3f0e8",
  theme_color: "#081a16",
  icons: [{ src: "/favicon-180.png", sizes: "180x180", type: "image/png", purpose: "any" }],
}, null, 2));

const sourceRoutes = [
  "/",
  ...products.map((product) => `/product/${product.slug}/`),
  ...legalPages.map((page) => `/${page.slug}/`),
  ...marketingPages.map((page) => `/${page.slug}/`),
  "/contact/",
  "/insights/",
  "/account/",
  "/admin/",
  ...articles.map((article) => `/insights/${article.slug}/`),
];

for (const locale of ["en", "ar"]) {
  for (const route of sourceRoutes) {
    const source = await readFile(routeFile(route), "utf8");
    const output = route === "/" ? resolve(dist, locale, "index.html") : resolve(dist, locale, route.replace(/^\//, ""), "index.html");
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, localizedHtml(source, route, locale));
  }
}

await writeFile(resolve(dist, "index.html"), redirectPage("/en/"));

const sitemapRoutes = sourceRoutes.filter((route) => !["/account/", "/admin/"].includes(route));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["en", "ar"].flatMap((locale) => sitemapRoutes.map((route) => `  <url><loc>${site.url}${localizedPath(locale, route)}</loc></url>`)).join("\n")}
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
RewriteEngine On

RedirectMatch 404 ^/storage(?:/|$)
RewriteRule ^$ /en/ [R=301,L,NE]
RewriteRule ^EN(?:/(.*))?$ /en/$1 [R=301,L,NE,NC]
RewriteRule ^AR(?:/(.*))?$ /ar/$1 [R=301,L,NE,NC]
RewriteRule ^(product|privacy|terms|cookies|security|about|services|solutions|pricing|faq|contact|insights|account|admin)(/.*)?$ /en/$1$2 [R=301,L,NE]

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  <FilesMatch "\.(?:html|css|js|xml)$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 0 seconds"
  ExpiresByType application/javascript "access plus 0 seconds"
  ExpiresByType application/xml "access plus 0 seconds"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
</IfModule>
`);

console.log(`Built ${sourceRoutes.length * 2} localized routes in dist/`);
