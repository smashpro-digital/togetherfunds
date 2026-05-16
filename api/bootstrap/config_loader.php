<?php
declare(strict_types=1);

function load_local_config(): array {
  static $cached = null;
  if (is_array($cached)) return $cached;

  $paths = [
    __DIR__ . "/../config.local.php",
    __DIR__ . "/../config.php",
  ];

  foreach ($paths as $path) {
    if (is_file($path)) {
      $config = require $path;
      $cached = is_array($config) ? $config : [];
      return $cached;
    }
  }

  $cached = [];
  return $cached;
}

function get_config_value(string $path, $default = null) {
  $config = load_local_config();
  $parts = array_values(array_filter(explode(".", $path), fn($part) => $part !== ""));
  $current = $config;

  foreach ($parts as $part) {
    if (!is_array($current) || !array_key_exists($part, $current)) {
      return $default;
    }
    $current = $current[$part];
  }

  return $current ?? $default;
}
