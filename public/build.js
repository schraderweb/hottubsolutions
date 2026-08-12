const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');
const publicDir = __dirname;
const rootDir = path.join(__dirname, '..');

const MAPS_API_KEY = (process.env.GOOGLE_MAPS_API_KEY || '').trim();

const partial = name => {
  let content = fs.readFileSync(path.join(src, name), 'utf-8');
  content = content.replaceAll('{{GOOGLE_MAPS_API_KEY}}', MAPS_API_KEY);
  return `<!-- START: ${name} -->\n${content}\n<!-- END: ${name} -->`;
};

const pages = {
  'index.html': [
    '_head.html',
    '_nav.html',
    '_hero.html',
    '_about.html',
    '_services.html',
    '_reviews.html',
    '_inventory.html',
    '_badges.html',
    '_serving.html',
    '_map.html',
    '_brands.html',
    '_footer.html',
    '_scripts.html',
  ],
};

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const [filename, partials] of Object.entries(pages)) {
  const html = partials.map(partial).join('\n');
  fs.writeFileSync(path.join(rootDir, filename), html);
  console.log(`Built ${filename}`);
}

copyDir(path.join(publicDir, 'css'), path.join(rootDir, 'css'));
copyDir(path.join(publicDir, 'js'), path.join(rootDir, 'js'));
copyDir(path.join(publicDir, 'images'), path.join(rootDir, 'images'));

for (const file of ['favicon.png', 'form-mail.html']) {
  const srcFile = path.join(publicDir, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(rootDir, file));
    console.log(`Copied ${file}`);
  }
}

console.log('Site built to project root');
