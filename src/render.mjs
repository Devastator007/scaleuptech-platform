import { articles, legalPages, marketingPages, products, site } from "./content.mjs";

const html = String.raw;
const assetVersion = "20260729-05";

function head({ title, description, path = "/" }) {
  const canonical = `${site.url}${path}`;
  return html`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    ${path === "/account/" || path === "/admin/" ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
    <meta name="theme-color" content="#0f172a">
    <link rel="icon" href="/favicon-180.png?v=${assetVersion}" type="image/png">
    <link rel="apple-touch-icon" href="/favicon-180.png?v=${assetVersion}">
    <link rel="manifest" href="/manifest.webmanifest?v=${assetVersion}">
    <link rel="preload" href="/scaleup-logo-128.webp?v=${assetVersion}" as="image" type="image/webp">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${site.brand}">
    <meta property="og:image" content="${site.url}/scaleup-logo-640.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${site.url}/scaleup-logo-640.webp">
    <link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.brand,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      contactPoint: [
        { "@type": "ContactPoint", contactType: "sales", email: site.email, telephone: site.phone, availableLanguage: ["Arabic", "English"] },
        { "@type": "ContactPoint", contactType: "customer support", email: site.supportEmail, availableLanguage: ["Arabic", "English"] },
      ],
    })}</script>
  `;
}

function header() {
  return html`
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="brand" href="/" aria-label="ScaleUp Tech home">
        <span class="brand-mark"><img src="/scaleup-logo-128.webp?v=${assetVersion}" width="46" height="46" alt=""></span>
        <span>ScaleUp <strong>Tech</strong></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Open navigation</span>
        <span></span><span></span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Primary navigation">
        <a href="/#products" data-en="Products" data-ar="المنتجات">Products</a>
        <a href="/services/" data-en="Services" data-ar="الخدمات">Services</a>
        <a href="/solutions/" data-en="Solutions" data-ar="الحلول">Solutions</a>
        <a href="/pricing/" data-en="Pricing" data-ar="الأسعار">Pricing</a>
        <a href="/insights/" data-en="Insights" data-ar="المقالات">Insights</a>
        <a href="/about/" data-en="About" data-ar="عن الشركة">About</a>
        <button class="language-toggle" type="button" data-language-toggle aria-label="Switch language">
          <span data-en="العربية" data-ar="English">العربية</span>
        </button>
        <a href="/account/" data-en="Sign in" data-ar="تسجيل الدخول">Sign in</a>
        <a class="button button-small" href="/contact/" data-en="Talk to us" data-ar="تواصل معنا">Talk to us</a>
      </nav>
    </header>
  `;
}

function footer() {
  return html`
    <footer class="site-footer">
      <div>
        <a class="brand brand-footer" href="/">
          <span class="brand-mark"><img src="/scaleup-logo-128.webp?v=${assetVersion}" width="46" height="46" alt=""></span>
          <span>ScaleUp <strong>Tech</strong></span>
        </a>
        <p data-en="Practical technology for ambitious businesses." data-ar="تقنية عملية للشركات الطموحة.">Practical technology for ambitious businesses.</p>
      </div>
      <div class="footer-links">
        <a href="/contact/" data-en="Contact" data-ar="تواصل معنا">Contact</a>
        <a href="/services/" data-en="Services" data-ar="الخدمات">Services</a>
        <a href="/solutions/" data-en="Solutions" data-ar="الحلول">Solutions</a>
        <a href="/pricing/" data-en="Pricing" data-ar="الأسعار">Pricing</a>
        <a href="/faq/" data-en="FAQ" data-ar="الأسئلة الشائعة">FAQ</a>
        <a href="/insights/" data-en="Insights" data-ar="المقالات">Insights</a>
        <a href="/#products" data-en="Products" data-ar="المنتجات">Products</a>
        <a href="/privacy/" data-en="Privacy" data-ar="الخصوصية">Privacy</a>
        <a href="/terms/" data-en="Terms" data-ar="الشروط">Terms</a>
        <a href="/cookies/" data-en="Cookies" data-ar="ملفات الارتباط">Cookies</a>
        <a href="/security/" data-en="Security" data-ar="الأمان">Security</a>
      </div>
      <p class="copyright">© <span data-current-year></span> ScaleUp Tech</p>
    </footer>
    <a class="whatsapp-float" href="https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hello ScaleUp Tech, I would like to discuss my needs.")}" target="_blank" rel="noopener noreferrer" aria-label="Chat with ScaleUp Tech on WhatsApp">
      <span aria-hidden="true">◉</span>
      <span data-en="WhatsApp" data-ar="واتساب">WhatsApp</span>
    </a>
    <script src="/assets/site.js?v=${assetVersion}" defer></script>
  `;
}

function shell({ title, description, path, body }) {
  return html`<!doctype html>
  <html lang="en" dir="ltr">
    <head>${head({ title, description, path })}</head>
    <body>
      <div class="page-shell">
        ${header()}
        ${body}
        ${footer()}
      </div>
    </body>
  </html>`;
}

function productCard(product, index) {
  const highlights = product.highlights.en
    .map((item, itemIndex) => `<li data-en="${item}" data-ar="${product.highlights.ar[itemIndex]}">${item}</li>`)
    .join("");

  return html`
    <article class="product-card">
      <div class="product-number">0${index + 1}</div>
      <p class="eyebrow" data-en="${product.eyebrow.en}" data-ar="${product.eyebrow.ar}">${product.eyebrow.en}</p>
      <h3>${product.name}</h3>
      <p data-en="${product.description.en}" data-ar="${product.description.ar}">${product.description.en}</p>
      <ul class="feature-list">${highlights}</ul>
      <a class="text-link" href="/product/${product.slug}/">
        <span data-en="Explore ${product.name}" data-ar="اكتشف ${product.name}">Explore ${product.name}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  `;
}

export function renderHome() {
  const cards = products.map(productCard).join("");
  return shell({
    title: "ScaleUp Tech | Technology that grows with your business",
    description: "ScaleUp Tech builds practical SaaS products for careers, customer experience operations, and pharmacy management.",
    path: "/",
    body: html`
      <main id="main">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow" data-en="Software for operational growth" data-ar="برمجيات للنمو التشغيلي">Software for operational growth</p>
            <h1>
              <span data-en="Turn complex work into" data-ar="حوّل العمل المعقد إلى">Turn complex work into</span>
              <em data-en="clear momentum." data-ar="تقدم واضح.">clear momentum.</em>
            </h1>
            <p class="hero-lead" data-en="We build focused technology products that help teams move faster, serve better, and scale with control." data-ar="نبني منتجات تقنية مركزة تساعد الفرق على التحرك أسرع، وتقديم خدمة أفضل، والتوسع بثقة وتحكم.">
              We build focused technology products that help teams move faster, serve better, and scale with control.
            </p>
            <div class="hero-actions">
              <a class="button" href="#products" data-en="Explore products" data-ar="اكتشف المنتجات">Explore products</a>
              <a class="text-link" href="/contact/">
                <span data-en="Discuss your needs" data-ar="ناقش احتياجاتك">Discuss your needs</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div class="hero-visual" aria-label="ScaleUp Tech product system">
            <div class="signal signal-top">
              <span>01</span>
              <strong>JobPilot</strong>
              <small data-en="Career momentum" data-ar="تقدم مهني">Career momentum</small>
            </div>
            <div class="signal signal-main">
              <span class="pulse"></span>
              <div>
                <small data-en="Operating signal" data-ar="مؤشر التشغيل">Operating signal</small>
                <strong data-en="Ready to scale" data-ar="جاهز للتوسع">Ready to scale</strong>
              </div>
            </div>
            <div class="signal signal-bottom">
              <span>02</span>
              <strong>ScaleCX</strong>
              <small data-en="Customer clarity" data-ar="وضوح تجربة العميل">Customer clarity</small>
            </div>
          </div>
        </section>

        <section class="trust-strip" aria-label="Our focus">
          <p data-en="Built around real operations" data-ar="مصمم حول العمليات الفعلية">Built around real operations</p>
          <div>
            <span data-en="Focused products" data-ar="منتجات مركزة">Focused products</span>
            <span data-en="Measurable outcomes" data-ar="نتائج قابلة للقياس">Measurable outcomes</span>
            <span data-en="Human-centered design" data-ar="تصميم يركز على الإنسان">Human-centered design</span>
          </div>
        </section>

        <section id="products" class="section products-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow" data-en="Our products" data-ar="منتجاتنا">Our products</p>
              <h2 data-en="Purpose-built tools for work that matters." data-ar="أدوات مصممة خصيصاً للعمل الذي يصنع فرقاً.">Purpose-built tools for work that matters.</h2>
            </div>
            <p data-en="Each product starts with a real operating problem and removes the friction between insight and action." data-ar="يبدأ كل منتج بمشكلة تشغيل حقيقية ويزيل العوائق بين الرؤية والتنفيذ.">
              Each product starts with a real operating problem and removes the friction between insight and action.
            </p>
          </div>
          <div class="product-grid">${cards}</div>
        </section>

        <section id="approach" class="section approach-section">
          <div class="approach-copy">
            <p class="eyebrow" data-en="How we work" data-ar="كيف نعمل">How we work</p>
            <h2 data-en="Clarity first. Value quickly. Scale responsibly." data-ar="وضوح أولاً. قيمة سريعة. توسع مسؤول.">Clarity first. Value quickly. Scale responsibly.</h2>
          </div>
          <ol class="approach-list">
            <li><span>01</span><div><strong data-en="Find the friction" data-ar="حدد العائق">Find the friction</strong><p data-en="Start with the operating constraint that costs the most time or trust." data-ar="ابدأ بالقيد التشغيلي الذي يهدر أكبر قدر من الوقت أو الثقة.">Start with the operating constraint that costs the most time or trust.</p></div></li>
            <li><span>02</span><div><strong data-en="Ship a useful core" data-ar="أطلق جوهراً مفيداً">Ship a useful core</strong><p data-en="Deliver the smallest complete experience that creates measurable value." data-ar="قدّم أصغر تجربة متكاملة تحقق قيمة قابلة للقياس.">Deliver the smallest complete experience that creates measurable value.</p></div></li>
            <li><span>03</span><div><strong data-en="Improve from evidence" data-ar="طوّر بناءً على الأدلة">Improve from evidence</strong><p data-en="Use real behavior and outcomes to guide every next improvement." data-ar="استخدم السلوك والنتائج الفعلية لتوجيه كل تحسين تالٍ.">Use real behavior and outcomes to guide every next improvement.</p></div></li>
          </ol>
        </section>

        <section id="about" class="section statement-section">
          <p class="eyebrow" data-en="ScaleUp Tech" data-ar="ScaleUp Tech">ScaleUp Tech</p>
          <h2 data-en="Technology should simplify growth—not become another system to manage." data-ar="يجب أن تُبسّط التقنية النمو — لا أن تصبح نظاماً إضافياً يحتاج إلى إدارة.">
            Technology should simplify growth—not become another system to manage.
          </h2>
          <a class="button button-light" href="/contact/" data-en="Build with us" data-ar="ابنِ معنا">Build with us</a>
        </section>
        <section class="section insights-preview">
          <div class="section-heading">
            <div><p class="eyebrow" data-en="Practical insights" data-ar="مقالات عملية">Practical insights</p><h2 data-en="Make better technology decisions." data-ar="اتخذ قرارات تقنية أفضل.">Make better technology decisions.</h2></div>
            <a class="text-link" href="/insights/"><span data-en="View all 16 articles" data-ar="شاهد جميع المقالات الـ16">View all 16 articles</span><span aria-hidden="true">↗</span></a>
          </div>
          <div class="article-grid">${articles.slice(0, 4).map(articleCard).join("")}</div>
        </section>
      </main>
    `,
  });
}

function articleCard(article) {
  const product = products.find((item) => item.slug === article.product);
  return html`<article class="article-card">
    <p class="eyebrow">${product?.name || article.product}</p>
    <h2><a href="/insights/${article.slug}/" data-en="${article.title.en}" data-ar="${article.title.ar}">${article.title.en}</a></h2>
    <p data-en="${article.description.en}" data-ar="${article.description.ar}">${article.description.en}</p>
    <small><span data-en="${article.readTime} min read" data-ar="قراءة ${article.readTime} دقائق">${article.readTime} min read</span></small>
  </article>`;
}

export function renderMarketing(page) {
  const items = page.items.map((item, index) => html`<article class="content-card"><span>0${index + 1}</span><p data-en="${item.en}" data-ar="${item.ar}">${item.en}</p></article>`).join("");
  return shell({
    title: `${page.title.en} | ScaleUp Tech`,
    description: page.description.en,
    path: `/${page.slug}/`,
    body: html`<main id="main" class="content-page">
      <header class="content-hero"><p class="eyebrow">ScaleUp Tech</p><h1 data-en="${page.title.en}" data-ar="${page.title.ar}">${page.title.en}</h1><p data-en="${page.description.en}" data-ar="${page.description.ar}">${page.description.en}</p></header>
      <section class="section"><div class="content-grid">${items}</div></section>
      <section class="contact-band"><h2 data-en="Ready for a practical next step?" data-ar="هل أنت مستعد للخطوة العملية التالية؟">Ready for a practical next step?</h2><a class="button button-light" href="/contact/" data-en="Contact ScaleUp Tech" data-ar="تواصل مع ScaleUp Tech">Contact ScaleUp Tech</a></section>
    </main>`,
  });
}

export function renderContact() {
  return shell({
    title: "Contact ScaleUp Tech | Sales, Support and WhatsApp",
    description: "Contact ScaleUp Tech by sales email, support email, security email, phone, or WhatsApp.",
    path: "/contact/",
    body: html`<main id="main" class="content-page">
      <header class="content-hero"><p class="eyebrow" data-en="Contact" data-ar="التواصل">Contact</p><h1 data-en="Start with the right conversation." data-ar="ابدأ بالمحادثة الصحيحة.">Start with the right conversation.</h1><p data-en="Choose the channel that matches your request. We support Arabic and English." data-ar="اختر القناة المناسبة لطلبك. ندعم العربية والإنجليزية.">Choose the channel that matches your request. We support Arabic and English.</p></header>
      <section class="section contact-grid">
        <a class="contact-card" href="mailto:${site.email}"><span data-en="Sales and projects" data-ar="المبيعات والمشاريع">Sales and projects</span><strong>${site.email}</strong></a>
        <a class="contact-card" href="mailto:${site.supportEmail}"><span data-en="Product support" data-ar="دعم المنتجات">Product support</span><strong>${site.supportEmail}</strong></a>
        <a class="contact-card" href="mailto:${site.securityEmail}"><span data-en="Security reports" data-ar="بلاغات الأمان">Security reports</span><strong>${site.securityEmail}</strong></a>
        <a class="contact-card" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener noreferrer"><span data-en="WhatsApp and phone" data-ar="واتساب والهاتف">WhatsApp and phone</span><strong class="contact-phone" dir="ltr">${site.phone}</strong></a>
      </section>
    </main>`,
  });
}

export function renderInsights() {
  return shell({
    title: "Insights | ScaleUp Tech",
    description: "Practical bilingual guides for careers, CRM, customer experience operations, and pharmacy management.",
    path: "/insights/",
    body: html`<main id="main" class="content-page"><header class="content-hero"><p class="eyebrow" data-en="Insights" data-ar="المقالات">Insights</p><h1 data-en="Useful ideas for better operations." data-ar="أفكار مفيدة لعمليات أفضل.">Useful ideas for better operations.</h1><p data-en="Sixteen practical guides—four for every ScaleUp Tech product." data-ar="ستة عشر دليلاً عملياً — أربعة لكل منتج من ScaleUp Tech.">Sixteen practical guides—four for every ScaleUp Tech product.</p></header><section class="section"><div class="article-grid">${articles.map(articleCard).join("")}</div></section></main>`,
  });
}

export function renderArticle(article) {
  const product = products.find((item) => item.slug === article.product);
  return shell({
    title: `${article.title.en} | ScaleUp Tech`,
    description: article.description.en,
    path: `/insights/${article.slug}/`,
    body: html`<main id="main" class="article-page">
      <header class="article-hero"><a class="back-link" href="/insights/" data-en="← All insights" data-ar="← كل المقالات">← All insights</a><p class="eyebrow">${product?.name || article.product}</p><h1 data-en="${article.title.en}" data-ar="${article.title.ar}">${article.title.en}</h1><p data-en="${article.description.en}" data-ar="${article.description.ar}">${article.description.en}</p></header>
      <article class="article-body">
        <h2 data-en="Start with the operating outcome" data-ar="ابدأ بالنتيجة التشغيلية">Start with the operating outcome</h2>
        <p data-en="Define the decision, behavior, or customer outcome that must improve. A clear baseline prevents activity from being confused with progress." data-ar="حدد القرار أو السلوك أو نتيجة العميل المطلوب تحسينها. يمنع خط الأساس الواضح الخلط بين النشاط والتقدم.">Define the decision, behavior, or customer outcome that must improve. A clear baseline prevents activity from being confused with progress.</p>
        <h2 data-en="Build the smallest complete workflow" data-ar="ابنِ أصغر مسار عمل متكامل">Build the smallest complete workflow</h2>
        <p data-en="Map ownership, inputs, exceptions, and the next action. Remove duplicate steps before automating them, then make status visible to everyone responsible." data-ar="حدد الملكية والمدخلات والاستثناءات والخطوة التالية. أزل الخطوات المكررة قبل أتمتتها واجعل الحالة مرئية لكل مسؤول.">Map ownership, inputs, exceptions, and the next action. Remove duplicate steps before automating them, then make status visible to everyone responsible.</p>
        <h2 data-en="Measure, learn, and improve" data-ar="قس وتعلم وحسّن">Measure, learn, and improve</h2>
        <p data-en="Review a small set of outcome and quality measures on a fixed cadence. Investigate exceptions, protect human judgment, and change the system only when evidence supports it." data-ar="راجع مجموعة صغيرة من مؤشرات النتائج والجودة بوتيرة ثابتة. افحص الاستثناءات وحافظ على القرار البشري ولا تغير النظام إلا عندما تدعم الأدلة ذلك.">Review a small set of outcome and quality measures on a fixed cadence. Investigate exceptions, protect human judgment, and change the system only when evidence supports it.</p>
      </article>
    </main>`,
  });
}

export function renderAccountPage(admin = false) {
  const path = admin ? "/admin/" : "/account/";
  const title = admin ? "Admin | ScaleUp Tech" : "Account | ScaleUp Tech";
  return shell({
    title,
    description: admin
      ? "Protected administration for ScaleUp Tech customers, subscriptions, and manual payment approvals."
      : "Register, sign in, manage subscriptions, and submit manual payments for ScaleUp Tech products.",
    path,
    body: html`<main id="main" class="account-page"><div class="account-app" data-account-app="${admin ? "admin" : "account"}"><section class="account-card"><p>Loading secure account…</p></section></div></main>
      <script src="/assets/account.js?v=${assetVersion}" defer></script>`,
  });
}

export function renderProduct(product) {
  const related = products.filter((item) => item.slug !== product.slug);
  const features = product.highlights.en
    .map((item, index) => html`
      <li>
        <span>0${index + 1}</span>
        <strong data-en="${item}" data-ar="${product.highlights.ar[index]}">${item}</strong>
      </li>`)
    .join("");

  return shell({
    title: `${product.name} | ScaleUp Tech`,
    description: product.description.en,
    path: `/product/${product.slug}/`,
    body: html`
      <main id="main">
        <section class="product-hero">
          <a class="back-link" href="/#products" data-en="← All products" data-ar="← كل المنتجات">← All products</a>
          <div class="product-hero-grid">
            <div>
              <p class="eyebrow" data-en="${product.eyebrow.en}" data-ar="${product.eyebrow.ar}">${product.eyebrow.en}</p>
              <h1>${product.name}</h1>
              <h2 data-en="${product.title.en}" data-ar="${product.title.ar}">${product.title.en}</h2>
              <p class="hero-lead" data-en="${product.description.en}" data-ar="${product.description.ar}">${product.description.en}</p>
              <a
                class="button"
                href="${product.appPath || `mailto:${site.email}?subject=${encodeURIComponent(`${product.name} enquiry`)}`}"
                data-en="${product.appPath ? `Open ${product.name}` : "Get started"}"
                data-ar="${product.appPath ? `افتح ${product.name}` : "ابدأ الآن"}"
              >${product.appPath ? `Open ${product.name}` : "Get started"}</a>
            </div>
            <div class="product-panel">
              <p data-en="What it unlocks" data-ar="ما الذي يتيحه">What it unlocks</p>
              <ul>${features}</ul>
            </div>
          </div>
        </section>
        <section class="section product-purpose">
          <p class="eyebrow" data-en="Designed for progress" data-ar="مصمم للتقدم">Designed for progress</p>
          <div>
            <h2 data-en="Less operational noise. More confident action." data-ar="ضوضاء تشغيلية أقل. قرارات أكثر ثقة.">Less operational noise. More confident action.</h2>
            <p data-en="We are building ${product.name} around the workflows people use every day—keeping the experience focused, measurable, and easy to adopt." data-ar="نطوّر ${product.name} حول مسارات العمل اليومية — مع تجربة مركزة وقابلة للقياس وسهلة التبني.">
              We are building ${product.name} around the workflows people use every day—keeping the experience focused, measurable, and easy to adopt.
            </p>
          </div>
        </section>
        <section class="section related-products">
          <p class="eyebrow" data-en="Explore more" data-ar="اكتشف المزيد">Explore more</p>
          <div class="related-grid">
            ${related.map((item) => `<a href="/product/${item.slug}/"><span>${item.name}</span><span aria-hidden="true">↗</span></a>`).join("")}
          </div>
        </section>
      </main>
    `,
  });
}

export function renderLegal(page) {
  const sections = page.sections.map((section) => html`
    <section>
      <h2 data-en="${section.heading.en}" data-ar="${section.heading.ar}">${section.heading.en}</h2>
      <p data-en="${section.body.en}" data-ar="${section.body.ar}">${section.body.en}</p>
    </section>
  `).join("");

  return shell({
    title: `${page.title.en} | ScaleUp Tech`,
    description: page.description.en,
    path: `/${page.slug}/`,
    body: html`
      <main id="main" class="legal-page">
        <header class="legal-hero">
          <p class="eyebrow" data-en="Trust center" data-ar="مركز الثقة">Trust center</p>
          <h1 data-en="${page.title.en}" data-ar="${page.title.ar}">${page.title.en}</h1>
          <p data-en="${page.description.en}" data-ar="${page.description.ar}">${page.description.en}</p>
          <small data-en="Last updated: 29 July 2026" data-ar="آخر تحديث: 29 يوليو 2026">Last updated: 29 July 2026</small>
        </header>
        <div class="legal-layout">
          <nav class="legal-nav" aria-label="Legal documents">
            ${legalPages.map((item) => `<a href="/${item.slug}/"${item.slug === page.slug ? ' aria-current="page"' : ""} data-en="${item.title.en}" data-ar="${item.title.ar}">${item.title.en}</a>`).join("")}
          </nav>
          <article class="legal-content">
            ${sections}
            <section>
              <h2 data-en="Contact" data-ar="التواصل">Contact</h2>
              <p>
                <span data-en="Questions about this document can be sent to" data-ar="يمكن إرسال الأسئلة المتعلقة بهذه الوثيقة إلى">Questions about this document can be sent to</span>
                <a href="mailto:${site.supportEmail}">${site.supportEmail}</a>.
              </p>
            </section>
          </article>
        </div>
      </main>
    `,
  });
}
