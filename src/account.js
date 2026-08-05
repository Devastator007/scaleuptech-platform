const root = document.querySelector("[data-account-app]");
const endpoint = "/api/account.php";
let state = { csrf: "", user: null, subscriptions: [], payments: [] };

const copy = {
  validation_failed: { en: "Please review the highlighted information.", ar: "يرجى مراجعة البيانات المحددة." },
  email_exists: { en: "An account already exists for this email.", ar: "يوجد حساب مسجل بهذا البريد الإلكتروني." },
  invalid_credentials: { en: "The email or password is incorrect.", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
  invalid_or_expired_token: { en: "This reset link is invalid or expired.", ar: "رابط إعادة التعيين غير صالح أو منتهي." },
  rate_limited: { en: "Please wait a moment and try again.", ar: "يرجى الانتظار قليلاً ثم المحاولة مرة أخرى." },
  subscription_not_found: { en: "The selected subscription could not be found.", ar: "تعذر العثور على الاشتراك المحدد." },
  admin_required: { en: "Administrator access is required.", ar: "صلاحية المدير مطلوبة." },
  unexpected_response: { en: "The request could not be completed.", ar: "تعذر إكمال الطلب." },
  account_recovery: { en: "Account recovery", ar: "استعادة الحساب" },
  set_password: { en: "Set a new password", ar: "تعيين كلمة مرور جديدة" },
  new_password: { en: "New password", ar: "كلمة المرور الجديدة" },
  confirm_password: { en: "Confirm password", ar: "تأكيد كلمة المرور" },
  update_password: { en: "Update password", ar: "تحديث كلمة المرور" },
  account_label: { en: "ScaleUp Tech account", ar: "حساب ScaleUp Tech" },
  account_headline: { en: "One account for your products and subscriptions.", ar: "حساب واحد لمنتجاتك واشتراكاتك." },
  account_intro: { en: "Register, sign in, submit an InstaPay or bank-transfer reference, and follow activation from one secure workspace.", ar: "سجل الدخول أو أنشئ حساباً، وأرسل مرجع InstaPay أو التحويل البنكي، وتابع التفعيل من مساحة آمنة واحدة." },
  signin: { en: "Sign in", ar: "تسجيل الدخول" },
  create_account: { en: "Create an account", ar: "إنشاء حساب" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  name: { en: "Name", ar: "الاسم" },
  country: { en: "Country", ar: "الدولة" },
  select_country: { en: "Select country", ar: "اختر الدولة" },
  egypt: { en: "Egypt", ar: "مصر" },
  saudi: { en: "Saudi Arabia", ar: "السعودية" },
  uae: { en: "United Arab Emirates", ar: "الإمارات" },
  qatar: { en: "Qatar", ar: "قطر" },
  kuwait: { en: "Kuwait", ar: "الكويت" },
  other: { en: "Other", ar: "أخرى" },
  forgot: { en: "Forgot password?", ar: "هل نسيت كلمة المرور؟" },
  show: { en: "Show", ar: "إظهار" },
  hide: { en: "Hide", ar: "إخفاء" },
  enter_email: { en: "Enter your email first.", ar: "أدخل بريدك الإلكتروني أولاً." },
  reset_sent: { en: "If the address exists, a reset link has been sent.", ar: "إذا كان البريد مسجلاً، فقد تم إرسال رابط إعادة التعيين." },
  account_unavailable: { en: "Account unavailable", ar: "الحساب غير متاح" },
  customer_workspace: { en: "Customer workspace", ar: "مساحة العميل" },
  welcome: { en: "Welcome", ar: "مرحباً" },
  open_admin: { en: "Open admin", ar: "فتح الإدارة" },
  signout: { en: "Sign out", ar: "تسجيل الخروج" },
  customer_account: { en: "Customer account", ar: "حساب العميل" },
  access_denied: { en: "Access denied", ar: "تم رفض الوصول" },
  return_account: { en: "Return to account", ar: "العودة إلى الحساب" },
};

function language() {
  return location.pathname.match(/^\/ar(?:\/|$)/) ? "ar" : "en";
}

function t(key) {
  return copy[key]?.[language()] || copy[key]?.en || key;
}

function pagePath(path) {
  const locale = location.pathname.match(/^\/(en|ar)(?:\/|$)/)?.[1];
  return locale ? `/${locale}${path}` : path;
}

async function request(action, body) {
  const response = await fetch(`${endpoint}?action=${encodeURIComponent(action)}`, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json", "X-CSRF-Token": state.csrf } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({ ok: false, error: "unexpected_response" }));
  if (!response.ok || !payload.ok) throw new Error(t(payload.error || "unexpected_response"));
  return payload;
}

function message(text, error = false) {
  const element = root.querySelector("[data-message]");
  if (!element) return;
  element.textContent = text;
  element.className = `form-message ${error ? "is-error" : "is-success"}`;
}

function passwordField(name, label, confirmation = false) {
  const visibleLabel = t(label);
  return `<label>${visibleLabel}<span class="password-input"><input name="${name}" type="password" minlength="10" required autocomplete="${confirmation ? "new-password" : "current-password"}"><button type="button" data-show-password aria-label="${t("show")}">${t("show")}</button></span></label>`;
}

function authView() {
  const reset = new URLSearchParams(location.search).get("reset");
  if (reset) return `
    <section class="account-card"><p class="eyebrow">${t("account_recovery")}</p><h1>${t("set_password")}</h1>
      <form data-action="reset">${passwordField("password", "new_password")}${passwordField("confirmPassword", "confirm_password", true)}
      <button class="button" type="submit">${t("update_password")}</button></form><p data-message class="form-message"></p></section>`;
  return `
    <section class="account-welcome"><p class="eyebrow">${t("account_label")}</p><h1>${t("account_headline")}</h1>
      <p>${t("account_intro")}</p></section>
    <section class="auth-grid">
      <article class="account-card"><h2>${t("signin")}</h2><form data-action="signin">
        <label>${t("email")}<input name="email" type="email" required autocomplete="email"></label>
        ${passwordField("password", "password")}
        <button class="button" type="submit">${t("signin")}</button></form>
        <button class="text-button" type="button" data-forgot>${t("forgot")}</button></article>
      <article class="account-card"><h2>${t("create_account")}</h2><form data-action="signup">
        <label>${t("name")}<input name="name" required minlength="2" autocomplete="name"></label>
        <label>${t("email")}<input name="email" type="email" required autocomplete="email"></label>
        <label>${t("country")}<select name="country" required><option value="">${t("select_country")}</option><option value="EG">${t("egypt")}</option><option value="SA">${t("saudi")}</option><option value="AE">${t("uae")}</option><option value="QA">${t("qatar")}</option><option value="KW">${t("kuwait")}</option><option value="ZZ">${t("other")}</option></select></label>
        ${passwordField("password", "password")}${passwordField("confirmPassword", "confirm_password", true)}
        <button class="button" type="submit">${t("create_account")}</button></form></article>
      <p data-message class="form-message account-message"></p>
    </section>`;
}

function dashboardView() {
  const pending = state.subscriptions.find((item) => item.status === "pending" && Number(item.amount) > 0);
  const subscriptions = state.subscriptions.length
    ? state.subscriptions.map((item) => `<tr><td>${item.product}</td><td>${item.billing_cycle}</td><td>${item.amount} ${item.currency}</td><td><span class="status status-${item.status}">${item.status}</span></td></tr>`).join("")
    : `<tr><td colspan="4">No subscriptions yet.</td></tr>`;
  return `
    <section class="dashboard-head"><div><p class="eyebrow">${t("customer_workspace")}</p><h1>${t("welcome")}, ${state.user.name}</h1><p>${state.user.email}</p></div>
      <div class="dashboard-actions">${state.user.role === "admin" ? `<a class="button" href="${pagePath("/admin/")}">${t("open_admin")}</a>` : ""}<button class="button button-quiet" data-signout>${t("signout")}</button></div></section>
    <section class="dashboard-grid">
      <article class="account-card"><h2>Start a subscription</h2><form data-action="subscribe">
        <label>Product<select name="product"><option value="jobpilot">JobPilot</option><option value="crm">ScaleUp CRM — request pricing</option><option value="scalecx">ScaleCX — request pricing</option><option value="pharmacy-manager">Pharmacy Manager — request pricing</option><option value="sales-flow-erp">SalesFlow ERP — request pricing</option></select></label>
        <label>Subscription type<select name="billingCycle" data-cycle><option value="monthly">Monthly</option><option value="annual">Annual — 20% discount</option><option value="custom">Custom months</option></select></label>
        <label data-months hidden>Months<input name="months" type="number" min="1" max="60" value="1"></label>
        <button class="button" type="submit">Create payment request</button></form></article>
      <article class="account-card"><h2>Submit payment</h2>${pending ? `<form data-action="payment">
        <input type="hidden" name="subscriptionId" value="${pending.id}">
        <label>Payment method<select name="method"><option value="instapay">InstaPay</option><option value="bank_transfer">Bank transfer</option></select></label>
        <label>Transfer reference<input name="reference" required minlength="4"></label>
        <label>Note<textarea name="note" rows="3"></textarea></label>
        <button class="button" type="submit">Submit for approval</button></form>` : `<p>Create a priced JobPilot subscription first. Business-product requests remain pending until sales confirms the scope and price.</p>`}</article>
    </section>
    <section class="account-card account-table"><h2>Your subscriptions</h2><div class="table-wrap"><table><thead><tr><th>Product</th><th>Cycle</th><th>Total</th><th>Status</th></tr></thead><tbody>${subscriptions}</tbody></table></div></section>
    <p data-message class="form-message"></p>`;
}

async function renderAccount() {
  const payload = await request("me");
  state = payload;
  root.innerHTML = state.user ? dashboardView() : authView();
  bind();
}

function adminView(payload) {
  const payments = payload.payments.length ? payload.payments.map((item) => `<tr><td>${item.email}</td><td>${item.product || "-"}</td><td>${item.transfer_reference}</td><td>${item.status}</td><td>${item.status === "pending" ? `<button data-payment="${item.id}" data-decision="approved">Approve</button><button data-payment="${item.id}" data-decision="rejected">Reject</button>` : "Reviewed"}</td></tr>`).join("") : `<tr><td colspan="5">No payment requests.</td></tr>`;
  const users = payload.users.map((item) => `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.country}</td><td>${item.role}</td><td>${item.status}</td></tr>`).join("");
  root.innerHTML = `<section class="dashboard-head"><div><p class="eyebrow">Administration</p><h1>Platform control center</h1></div><a class="button button-quiet" href="${pagePath("/account/")}">${t("customer_account")}</a></section>
  <section class="account-card account-table"><h2>Pending and reviewed payments</h2><div class="table-wrap"><table><thead><tr><th>Customer</th><th>Product</th><th>Reference</th><th>Status</th><th>Action</th></tr></thead><tbody>${payments}</tbody></table></div></section>
  <section class="account-card account-table"><h2>Customers</h2><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Country</th><th>Role</th><th>Status</th></tr></thead><tbody>${users}</tbody></table></div></section><p data-message class="form-message"></p>`;
  root.querySelectorAll("[data-payment]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await request("admin_payment", { paymentId: Number(button.dataset.payment), decision: button.dataset.decision });
      await renderAdmin();
    } catch (error) { message(error.message, true); }
  }));
}

async function renderAdmin() {
  const me = await request("me");
  state = me;
  if (!me.user) {
    location.replace(`${pagePath("/account/")}?next=${encodeURIComponent(pagePath("/admin/"))}`);
    return;
  }
  try { adminView(await request("admin")); } catch (error) {
    root.innerHTML = `<section class="account-card"><h1>${t("access_denied")}</h1><p>${error.message}</p><a class="button" href="${pagePath("/account/")}">${t("return_account")}</a></section>`;
  }
}

function bind() {
  root.querySelectorAll("[data-show-password]").forEach((button) => button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
    button.textContent = input.type === "password" ? t("show") : t("hide");
  }));
  root.querySelector("[data-cycle]")?.addEventListener("change", (event) => {
    root.querySelector("[data-months]").hidden = event.target.value !== "custom";
  });
  root.querySelectorAll("form[data-action]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    try {
      const body = Object.fromEntries(new FormData(form));
      const action = form.dataset.action;
      if (action === "reset") body.token = new URLSearchParams(location.search).get("reset");
      const result = await request(action, body);
      if (action === "forgot") message(t("reset_sent"));
      else if (action === "payment") message(`Submitted successfully. Reference: ${result.referenceNumber}`);
      else if (action === "reset") { history.replaceState({}, "", pagePath("/account/")); await renderAccount(); }
      else await renderAccount();
    } catch (error) { message(error.message, true); }
    finally { submit.disabled = false; }
  }));
  root.querySelector("[data-forgot]")?.addEventListener("click", async () => {
    const email = root.querySelector('form[data-action="signin"] [name=email]').value;
    if (!email) return message(t("enter_email"), true);
    try { await request("forgot", { email }); message(t("reset_sent")); }
    catch (error) { message(error.message, true); }
  });
  root.querySelector("[data-signout]")?.addEventListener("click", async () => {
    await request("signout", {});
    await renderAccount();
  });
}

if (root?.dataset.accountApp === "admin") renderAdmin();
else if (root) renderAccount().catch((error) => { root.innerHTML = `<section class="account-card"><h1>${t("account_unavailable")}</h1><p>${error.message}</p></section>`; });
