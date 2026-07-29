<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean(mixed $value, int $max = 255): string {
    $value = trim(strip_tags((string) $value));
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function json_input(int $limit = 30000): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > $limit) respond(413, ['ok' => false, 'error' => 'payload_too_large']);
    $data = json_decode($raw, true);
    if (!is_array($data)) respond(400, ['ok' => false, 'error' => 'invalid_json']);
    return $data;
}

function secure_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('scaleup_account');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => true,
        'httponly' => true, 'samesite' => 'Lax',
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
}

function csrf(): string {
    secure_session();
    return (string) $_SESSION['csrf'];
}

function require_csrf(): void {
    secure_session();
    $provided = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if ($provided === '' || !hash_equals((string) $_SESSION['csrf'], $provided)) {
        respond(403, ['ok' => false, 'error' => 'invalid_csrf']);
    }
}

function same_origin(): void {
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && !in_array($origin, ['https://scaleuptech.org', 'https://www.scaleuptech.org'], true)) {
        respond(403, ['ok' => false, 'error' => 'origin_not_allowed']);
    }
}

function db(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $directory = dirname(__DIR__, 2) . '/storage';
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        respond(500, ['ok' => false, 'error' => 'storage_unavailable']);
    }
    $pdo = new PDO('sqlite:' . $directory . '/scaleup.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        country TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT "customer",
        status TEXT NOT NULL DEFAULT "active", created_at TEXT NOT NULL, last_login_at TEXT
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product TEXT NOT NULL,
        billing_cycle TEXT NOT NULL, months INTEGER NOT NULL DEFAULT 1, amount REAL NOT NULL,
        currency TEXT NOT NULL, status TEXT NOT NULL DEFAULT "pending", starts_at TEXT, expires_at TEXT,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS payment_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, subscription_id INTEGER,
        method TEXT NOT NULL, transfer_reference TEXT NOT NULL, note TEXT, status TEXT NOT NULL DEFAULT "pending",
        reviewed_by INTEGER, reviewed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
        FOREIGN KEY(reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, actor_user_id INTEGER, action TEXT NOT NULL,
        target_type TEXT NOT NULL, target_id TEXT, created_at TEXT NOT NULL,
        FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL
    )');
    return $pdo;
}

function user(): ?array {
    secure_session();
    if (empty($_SESSION['user_id'])) return null;
    $statement = db()->prepare('SELECT id,name,email,country,role,status,created_at,last_login_at FROM users WHERE id=?');
    $statement->execute([(int) $_SESSION['user_id']]);
    $record = $statement->fetch();
    return $record && $record['status'] === 'active' ? $record : null;
}

function require_user(bool $admin = false): array {
    $record = user();
    if (!$record) respond(401, ['ok' => false, 'error' => 'authentication_required']);
    if ($admin && $record['role'] !== 'admin') respond(403, ['ok' => false, 'error' => 'admin_required']);
    return $record;
}

function audit(?int $actor, string $action, string $type, string|int|null $id = null): void {
    db()->prepare('INSERT INTO audit_logs(actor_user_id,action,target_type,target_id,created_at) VALUES(?,?,?,?,?)')
        ->execute([$actor, clean($action, 80), clean($type, 80), $id === null ? null : clean((string) $id, 120), gmdate('c')]);
}

function rate_limit(string $key, int $seconds): void {
    secure_session();
    $slot = 'rate_' . preg_replace('/[^a-z0-9_]/i', '', $key);
    $now = time();
    if (isset($_SESSION[$slot]) && $now - (int) $_SESSION[$slot] < $seconds) {
        respond(429, ['ok' => false, 'error' => 'rate_limited']);
    }
    $_SESSION[$slot] = $now;
}
