const root = document.documentElement;
const languageButton = document.querySelector("[data-language-toggle]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

function setLanguage(language) {
  const isArabic = language === "ar";
  root.lang = language;
  root.dir = isArabic ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-ar]").forEach((element) => {
    element.textContent = element.dataset[language];
  });

  localStorage.setItem("scaleup-language", language);
  document.title = isArabic
    ? document.title.replace("Technology that grows with your business", "التقنية التي تنمو مع أعمالك")
    : document.title.replace("التقنية التي تنمو مع أعمالك", "Technology that grows with your business");
}

languageButton?.addEventListener("click", () => {
  setLanguage(root.lang === "ar" ? "en" : "ar");
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

setLanguage(localStorage.getItem("scaleup-language") === "ar" ? "ar" : "en");
