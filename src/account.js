const root = document.querySelector("[data-account-app]");
const endpoint = "/api/account.php";
let state = { csrf: "", user: null, subscriptions: [], payments: [] };

const labels = {
  validation_failed: "Please review the highlighted information.",
  email_exists: "An account already exists for this email.",
  invalid_credentials: "The email or password is incorrect.",
  invalid_or_expired_token: "This reset link is invalid or expired.",
  rate_limited: "Please wait a moment and try again.",
  subscription_not_found: "The selected subscription could not be found.",
  admin_required: "Administrator access is required.",
};

async function request(action, body) {
  const response = await fetch(`${endpoint}?action=${encodeURIComponent(action)}`, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json", "X-CSRF-Token": state.csrf } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({ ok: false, error: "unexpected_response" }));
  if (!response.ok || !payload.ok) throw new Error(labels[payload.error] || "The request could not be completed.");
  return payload;
}

function message(text, error = false) {
  const element = root.querySelector("[data-message]");
  if (!element) return;
  element.textContent = text;
  element.className = `form-message ${error ? "is-error" : "is-success"}`;
}

function passwordField(name, label, confirmation = false) {
  return `<label>${label}<span class="password-input"><input name="${name}" type="password" minlength="10" required autocomplete="${confirmation ? "new-password" : "current-password"}"><button type="button" data-show-password aria-label="Show password">Show</button></span></label>`;
}

function authView() {
  const reset = new URLSearchParams(location.search).get("reset");
  if (reset) return `
    <section class="account-card"><p class="eyebrow">Account recovery</p><h1>Set a new password</h1>
      <form data-action="reset">${passwordField("password", "New password")}${passwordField("confirmPassword", "Confirm password", true)}
      <button class="button" type="submit">Update password</button></form><p data-message class="form-message"></p></section>`;
  return `
    <section class="account-welcome"><p class="eyebrow">ScaleUp Tech account</p><h1>One account for your products and subscriptions.</h1>
      <p>Register, sign in, submit an InstaPay or bank-transfer reference, and follow activation from one secure workspace.</p></section>
    <section class="auth-grid">
      <article class="account-card"><h2>Sign in</h2><form data-action="signin">
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        ${passwordField("password", "Password")}
        <button class="button" type="submit">Sign in</button></form>
        <button class="text-button" type="button" data-forgot>Forgot password?</button></article>
      <article class="account-card"><h2>Create an account</h2><form data-action="signup">
        <label>Name<input name="name" required minlength="2" autocomplete="name"></label>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Country<select name="country" required><option value="">Select country</option><option value="EG">Egypt</option><option value="SA">Saudi Arabia</option><option value="AE">United Arab Emirates</option><option value="QA">Qatar</option><option value="KW">Kuwait</option><option value="ZZ">Other</option></select></label>
        ${passwordField("password", "Password")}${passwordField("confirmPassword", "Confirm password", true)}
        <button class="button" type="submit">Create account</button></form></article>
      <p data-message class="form-message account-message"></p>
    </section>`;
}

function dashboardView() {
  const pending = state.subscriptions.find((item) => item.status === "pending" && Number(item.amount) > 0);
  const subscriptions = state.subscriptions.length
    ? state.subscriptions.map((item) => `<tr><td>${item.product}</td><td>${item.billing_cycle}</td><td>${item.amount} ${item.currency}</td><td><span class="status status-${item.status}">${item.status}</span></td></tr>`).join("")
    : `<tr><td colspan="4">No subscriptions yet.</td></tr>`;
  return `
    <section class="dashboard-head"><div><p class="eyebrow">Customer workspace</p><h1>Welcome, ${state.user.name}</h1><p>${state.user.email}</p></div>
      <div class="dashboard-actions">${state.user.role === "admin" ? `<a class="button" href="/admin/">Open admin</a>` : ""}<button class="button button-quiet" data-signout>Sign out</button></div></section>
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
  const payments = payload.payments.length ? payload.payments.map((item) => `<tr><td>${item.email}</td><td>${item.product || "—"}</td><td>${item.transfer_reference}</td><td>${item.status}</td><td>${item.status === "pending" ? `<button data-payment="${item.id}" data-decision="approved">Approve</button><button data-payment="${item.id}" data-decision="rejected">Reject</button>` : "Reviewed"}</td></tr>`).join("") : `<tr><td colspan="5">No payment requests.</td></tr>`;
  const users = payload.users.map((item) => `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.country}</td><td>${item.role}</td><td>${item.status}</td></tr>`).join("");
  root.innerHTML = `<section class="dashboard-head"><div><p class="eyebrow">Administration</p><h1>Platform control center</h1></div><a class="button button-quiet" href="/account/">Customer account</a></section>
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
    location.replace("/account/?next=/admin/");
    return;
  }
  try { adminView(await request("admin")); } catch (error) {
    root.innerHTML = `<section class="account-card"><h1>Access denied</h1><p>${error.message}</p><a class="button" href="/account/">Return to account</a></section>`;
  }
}

function bind() {
  root.querySelectorAll("[data-show-password]").forEach((button) => button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
    button.textContent = input.type === "password" ? "Show" : "Hide";
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
      if (action === "forgot") message("If the address exists, a reset link has been sent.");
      else if (action === "payment") message(`Submitted successfully. Reference: ${result.referenceNumber}`);
      else if (action === "reset") { history.replaceState({}, "", "/account/"); await renderAccount(); }
      else await renderAccount();
    } catch (error) { message(error.message, true); }
    finally { submit.disabled = false; }
  }));
  root.querySelector("[data-forgot]")?.addEventListener("click", async () => {
    const email = root.querySelector('form[data-action="signin"] [name=email]').value;
    if (!email) return message("Enter your email first.", true);
    try { await request("forgot", { email }); message("If the address exists, a reset link has been sent."); }
    catch (error) { message(error.message, true); }
  });
  root.querySelector("[data-signout]")?.addEventListener("click", async () => {
    await request("signout", {});
    await renderAccount();
  });
}

if (root?.dataset.accountApp === "admin") renderAdmin();
else if (root) renderAccount().catch((error) => { root.innerHTML = `<section class="account-card"><h1>Account unavailable</h1><p>${error.message}</p></section>`; });
