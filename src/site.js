const root = document.documentElement;
const languageButton = document.querySelector("[data-language-toggle]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const routeLanguage = window.location.pathname.match(/^\/(en|ar)(?:\/|$)/)?.[1];

function localizedHref(href, language) {
  if (!href.startsWith("/")) return href;
  if (href.startsWith("/en/") || href.startsWith("/ar/")) return href.replace(/^\/(?:en|ar)(?=\/)/, `/${language}`);
  if (
    href.startsWith("/assets/") || href.startsWith("/api/") || href.startsWith("/app/") ||
    href.startsWith("/favicon") || href.startsWith("/scaleup-logo") || href === "/manifest.webmanifest" ||
    /\.[a-z0-9]+(?:[?#].*)?$/i.test(href)
  ) return href;
  return `/${language}${href}`;
}

function rewriteLocalizedLinks(language) {
  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.setAttribute("href", localizedHref(link.getAttribute("href"), language));
  });
}

function setLanguage(language) {
  const isArabic = language === "ar";
  root.lang = isArabic ? "ar-EG" : "en";
  root.dir = isArabic ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-ar]").forEach((element) => {
    element.textContent = element.dataset[language];
  });

  rewriteLocalizedLinks(language);
  localStorage.setItem("scaleup-language", language);
  document.title = isArabic
    ? document.title.replace("Technology that grows with your business", "التقنية التي تنمو مع أعمالك")
    : document.title.replace("التقنية التي تنمو مع أعمالك", "Technology that grows with your business");
}

languageButton?.addEventListener("click", () => {
  const nextLanguage = root.dir === "rtl" ? "en" : "ar";
  const nextPath = window.location.pathname.startsWith("/en/") || window.location.pathname.startsWith("/ar/")
    ? window.location.pathname.replace(/^\/(?:en|ar)(?=\/)/, `/${nextLanguage}`)
    : `/${nextLanguage}${window.location.pathname}`;
  window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`);
});

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

setLanguage(routeLanguage || (localStorage.getItem("scaleup-language") === "ar" ? "ar" : "en"));
