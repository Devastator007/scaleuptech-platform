<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/bootstrap.php';
$email = strtolower(trim((string) ($argv[1] ?? '')));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Usage: php api/provision-admin.php owner@example.com\n");
    exit(2);
}

$statement = db()->prepare('UPDATE users SET role="admin" WHERE email=? AND status="active"');
$statement->execute([$email]);
if ($statement->rowCount() !== 1) {
    fwrite(STDERR, "No active account matched that email. Register the account first.\n");
    exit(1);
}

audit(null, 'admin.provisioned_cli', 'user', $email);
fwrite(STDOUT, "Administrator role provisioned for {$email}.\n");
