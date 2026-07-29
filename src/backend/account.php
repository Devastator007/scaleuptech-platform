<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
same_origin();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = clean($_GET['action'] ?? 'me', 40);

if ($method === 'GET' && $action === 'me') {
    $current = user();
    $subscriptions = [];
    $payments = [];
    if ($current) {
        $statement = db()->prepare('SELECT * FROM subscriptions WHERE user_id=? ORDER BY id DESC');
        $statement->execute([$current['id']]);
        $subscriptions = $statement->fetchAll();
        $statement = db()->prepare('SELECT * FROM payment_requests WHERE user_id=? ORDER BY id DESC');
        $statement->execute([$current['id']]);
        $payments = $statement->fetchAll();
    }
    respond(200, ['ok' => true, 'csrf' => csrf(), 'user' => $current, 'subscriptions' => $subscriptions, 'payments' => $payments]);
}

if ($method === 'GET' && $action === 'admin') {
    require_user(true);
    respond(200, [
        'ok' => true,
        'csrf' => csrf(),
        'users' => db()->query('SELECT id,name,email,country,role,status,created_at,last_login_at FROM users ORDER BY id DESC LIMIT 200')->fetchAll(),
        'subscriptions' => db()->query('SELECT s.*,u.email FROM subscriptions s JOIN users u ON u.id=s.user_id ORDER BY s.id DESC LIMIT 200')->fetchAll(),
        'payments' => db()->query('SELECT p.*,u.email,s.product,s.amount,s.currency FROM payment_requests p JOIN users u ON u.id=p.user_id LEFT JOIN subscriptions s ON s.id=p.subscription_id ORDER BY p.id DESC LIMIT 200')->fetchAll(),
        'audit' => db()->query('SELECT a.*,u.email actor_email FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id ORDER BY a.id DESC LIMIT 100')->fetchAll(),
    ]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}
require_csrf();
$data = json_input();

if ($action === 'signup') {
    rate_limit('signup', 5);
    $name = clean($data['name'] ?? '', 120);
    $email = strtolower(clean($data['email'] ?? '', 190));
    $country = strtoupper(clean($data['country'] ?? '', 2));
    $password = (string) ($data['password'] ?? '');
    $confirm = (string) ($data['confirmPassword'] ?? '');
    if (strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[A-Z]{2}$/', $country)
        || strlen($password) < 10 || strlen($password) > 200 || !hash_equals($password, $confirm)) {
        respond(422, ['ok' => false, 'error' => 'validation_failed']);
    }
    try {
        $statement = db()->prepare('INSERT INTO users(name,email,country,password_hash,role,created_at) VALUES(?,?,?,?,?,?)');
        $statement->execute([$name, $email, $country, password_hash($password, PASSWORD_DEFAULT), 'customer', gmdate('c')]);
    } catch (PDOException $exception) {
        if ((string) $exception->getCode() === '23000' || str_contains(strtolower($exception->getMessage()), 'unique')) {
            respond(409, ['ok' => false, 'error' => 'email_exists']);
        }
        throw $exception;
    }
    secure_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) db()->lastInsertId();
    audit((int) $_SESSION['user_id'], 'account.signup', 'user', $_SESSION['user_id']);
    respond(201, ['ok' => true, 'role' => 'customer']);
}

if ($action === 'signin') {
    rate_limit('signin', 3);
    $email = strtolower(clean($data['email'] ?? '', 190));
    $password = (string) ($data['password'] ?? '');
    $statement = db()->prepare('SELECT * FROM users WHERE email=?');
    $statement->execute([$email]);
    $record = $statement->fetch();
    if (!$record || $record['status'] !== 'active' || !password_verify($password, $record['password_hash'])) {
        respond(401, ['ok' => false, 'error' => 'invalid_credentials']);
    }
    secure_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $record['id'];
    db()->prepare('UPDATE users SET last_login_at=? WHERE id=?')->execute([gmdate('c'), $record['id']]);
    audit((int) $record['id'], 'account.signin', 'user', $record['id']);
    respond(200, ['ok' => true, 'role' => $record['role']]);
}

if ($action === 'signout') {
    $current = user();
    if ($current) audit((int) $current['id'], 'account.signout', 'user', $current['id']);
    $_SESSION = [];
    session_destroy();
    respond(200, ['ok' => true]);
}

if ($action === 'forgot') {
    rate_limit('forgot', 30);
    $email = strtolower(clean($data['email'] ?? '', 190));
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $statement = db()->prepare('SELECT id FROM users WHERE email=? AND status="active"');
        $statement->execute([$email]);
        if ($record = $statement->fetch()) {
            $token = bin2hex(random_bytes(32));
            db()->prepare('DELETE FROM password_resets WHERE user_id=? OR expires_at<?')->execute([$record['id'], gmdate('c')]);
            db()->prepare('INSERT INTO password_resets(user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)')
                ->execute([$record['id'], hash('sha256', $token), gmdate('c', time() + 3600), gmdate('c')]);
            $url = 'https://scaleuptech.org/account/?reset=' . rawurlencode($token);
            @mail($email, 'Reset your ScaleUp Tech password', "Use this link within one hour:\n$url", 'From: ScaleUp Tech <support@scaleuptech.org>');
        }
    }
    respond(200, ['ok' => true]);
}

if ($action === 'reset') {
    rate_limit('reset', 5);
    $token = (string) ($data['token'] ?? '');
    $password = (string) ($data['password'] ?? '');
    $confirm = (string) ($data['confirmPassword'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/i', $token) || strlen($password) < 10 || !hash_equals($password, $confirm)) {
        respond(422, ['ok' => false, 'error' => 'validation_failed']);
    }
    $statement = db()->prepare('SELECT * FROM password_resets WHERE token_hash=? AND used_at IS NULL AND expires_at>?');
    $statement->execute([hash('sha256', $token), gmdate('c')]);
    $reset = $statement->fetch();
    if (!$reset) respond(422, ['ok' => false, 'error' => 'invalid_or_expired_token']);
    db()->prepare('UPDATE users SET password_hash=? WHERE id=?')->execute([password_hash($password, PASSWORD_DEFAULT), $reset['user_id']]);
    db()->prepare('UPDATE password_resets SET used_at=? WHERE id=?')->execute([gmdate('c'), $reset['id']]);
    audit((int) $reset['user_id'], 'password.reset', 'user', $reset['user_id']);
    respond(200, ['ok' => true]);
}

if ($action === 'subscribe') {
    $current = require_user();
    $product = clean($data['product'] ?? '', 60);
    $cycle = clean($data['billingCycle'] ?? '', 20);
    $months = $cycle === 'annual' ? 12 : ($cycle === 'custom' ? (int) ($data['months'] ?? 0) : 1);
    if (!in_array($product, ['jobpilot', 'crm', 'scalecx', 'pharmacy-manager', 'sales-flow-erp'], true)
        || !in_array($cycle, ['monthly', 'annual', 'custom'], true) || $months < 1 || $months > 60) {
        respond(422, ['ok' => false, 'error' => 'validation_failed']);
    }
    $unit = $product === 'jobpilot' ? 5.0 : 0.0;
    $amount = $unit * $months * ($months >= 12 ? 0.8 : 1);
    $currency = $product === 'jobpilot' ? 'USD' : 'EGP';
    $now = gmdate('c');
    $statement = db()->prepare('INSERT INTO subscriptions(user_id,product,billing_cycle,months,amount,currency,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?, ?,?)');
    $statement->execute([$current['id'], $product, $cycle, $months, $amount, $currency, 'pending', $now, $now]);
    $id = (int) db()->lastInsertId();
    audit((int) $current['id'], 'subscription.requested', 'subscription', $id);
    respond(201, ['ok' => true, 'subscriptionId' => $id, 'amount' => $amount, 'currency' => $currency]);
}

if ($action === 'payment') {
    $current = require_user();
    $subscriptionId = (int) ($data['subscriptionId'] ?? 0);
    $method = clean($data['method'] ?? '', 30);
    $reference = clean($data['reference'] ?? '', 120);
    if (!in_array($method, ['instapay', 'bank_transfer'], true) || strlen($reference) < 4) {
        respond(422, ['ok' => false, 'error' => 'validation_failed']);
    }
    $statement = db()->prepare('SELECT id FROM subscriptions WHERE id=? AND user_id=? AND status="pending"');
    $statement->execute([$subscriptionId, $current['id']]);
    if (!$statement->fetch()) respond(404, ['ok' => false, 'error' => 'subscription_not_found']);
    $now = gmdate('c');
    db()->prepare('INSERT INTO payment_requests(user_id,subscription_id,method,transfer_reference,note,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
        ->execute([$current['id'], $subscriptionId, $method, $reference, clean($data['note'] ?? '', 500), 'pending', $now, $now]);
    audit((int) $current['id'], 'payment.submitted', 'subscription', $subscriptionId);
    respond(201, ['ok' => true, 'referenceNumber' => 'SUP-' . str_pad((string) db()->lastInsertId(), 6, '0', STR_PAD_LEFT)]);
}

if ($action === 'admin_payment') {
    $admin = require_user(true);
    $paymentId = (int) ($data['paymentId'] ?? 0);
    $decision = clean($data['decision'] ?? '', 20);
    if (!in_array($decision, ['approved', 'rejected'], true)) respond(422, ['ok' => false, 'error' => 'validation_failed']);
    $statement = db()->prepare('SELECT subscription_id FROM payment_requests WHERE id=? AND status="pending"');
    $statement->execute([$paymentId]);
    $payment = $statement->fetch();
    if (!$payment) respond(404, ['ok' => false, 'error' => 'payment_not_found']);
    $now = gmdate('c');
    db()->prepare('UPDATE payment_requests SET status=?,reviewed_by=?,reviewed_at=?,updated_at=? WHERE id=?')
        ->execute([$decision, $admin['id'], $now, $now, $paymentId]);
    if ($decision === 'approved' && $payment['subscription_id']) {
        db()->prepare('UPDATE subscriptions SET status="active",starts_at=?,updated_at=? WHERE id=?')
            ->execute([$now, $now, $payment['subscription_id']]);
    }
    audit((int) $admin['id'], 'payment.' . $decision, 'payment', $paymentId);
    respond(200, ['ok' => true]);
}

respond(404, ['ok' => false, 'error' => 'unknown_action']);
