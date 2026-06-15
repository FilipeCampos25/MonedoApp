const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts',
);

if (!fs.existsSync(targetFile)) {
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');
const outdated = 'plugins { id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0") }';
const updated = 'plugins { id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0") }';

if (!source.includes(outdated)) {
  process.exit(0);
}

fs.writeFileSync(targetFile, source.replace(outdated, updated), 'utf8');
