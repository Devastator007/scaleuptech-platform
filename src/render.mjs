import { products, site } from "./content.mjs";

const html = String.raw;

function head({ title, description, path = "/" }) {
  const canonical = `${site.url}${path}`;
  return html`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="theme-color" content="#081a16">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${site.brand}">
    <link rel="stylesheet" href="/assets/styles.css">
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.brand,
      url: site.url,
      email: site.email,
    })}</script>
  `;
}

function header() {
  return html`
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="brand" href="/" aria-label="ScaleUp Tech home">
        <span class="brand-mark" aria-hidden="true">S</span>
        <span>ScaleUp <strong>Tech</strong></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Open navigation</span>
        <span></span><span></span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Primary navigation">
        <a href="/#products" data-en="Products" data-ar="المنتجات">Products</a>
        <a href="/#approach" data-en="Approach" data-ar="منهجنا">Approach</a>
        <a href="/#about" data-en="About" data-ar="عن الشركة">About</a>
        <button class="language-toggle" type="button" data-language-toggle aria-label="Switch language">
          <span data-en="العربية" data-ar="English">العربية</span>
        </button>
        <a class="button button-small" href="mailto:${site.email}" data-en="Talk to us" data-ar="تواصل معنا">Talk to us</a>
      </nav>
    </header>
  `;
}

function footer() {
  return html`
    <footer class="site-footer">
      <div>
        <a class="brand brand-footer" href="/">
          <span class="brand-mark" aria-hidden="true">S</span>
          <span>ScaleUp <strong>Tech</strong></span>
        </a>
        <p data-en="Practical technology for ambitious businesses." data-ar="تقنية عملية للشركات الطموحة.">Practical technology for ambitious businesses.</p>
      </div>
      <div class="footer-links">
        <a href="mailto:${site.email}">${site.email}</a>
        <a href="/#products" data-en="Products" data-ar="المنتجات">Products</a>
      </div>
      <p class="copyright">© <span data-current-year></span> ScaleUp Tech</p>
    </footer>
    <script src="/assets/site.js" defer></script>
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
              <a class="text-link" href="mailto:${site.email}">
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
          <a class="button button-light" href="mailto:${site.email}" data-en="Build with us" data-ar="ابنِ معنا">Build with us</a>
        </section>
      </main>
    `,
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
              <a class="button" href="mailto:${site.email}?subject=${encodeURIComponent(`${product.name} enquiry`)}" data-en="Get started" data-ar="ابدأ الآن">Get started</a>
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
