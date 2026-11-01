const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Ensure EXPO_PUBLIC_* variables from .env are eagerly loaded into process.env before bundling
function loadEnvFiles() {
  const candidatePaths = [
    path.resolve(projectRoot, '.env'),
    path.resolve(monorepoRoot, '.env'),
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const fileContent = fs.readFileSync(envPath, 'utf8');
        const lines = fileContent.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const separatorIndex = trimmed.indexOf('=');
            if (separatorIndex > 0) {
              const key = trimmed.slice(0, separatorIndex).trim();
              const val = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn('Could not read env file at', envPath, err);
      }
    }
  }
}

loadEnvFiles();

let config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (for live reload of shared packages)
config.watchFolders = [monorepoRoot];

// 2. Let Metro resolve node_modules from both the project and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = withNativeWind(config, {
  input: path.resolve(projectRoot, 'global.css'),
  configPath: path.resolve(projectRoot, 'tailwind.config.js'),
});
