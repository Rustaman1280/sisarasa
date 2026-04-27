const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/border-white\/5/g, 'border-black/5');
  content = content.replace(/bg-white\/5/g, 'bg-black/5');
  content = content.replace(/border-white\/10/g, 'border-black/10');
  content = content.replace(/bg-white\/10/g, 'bg-black/5');
  content = content.replace(/text-white\/50/g, 'text-black/50');
  content = content.replace(/text-white\/80/g, 'text-black/70');
  content = content.replace(/text-white\/60/g, 'text-black/60');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'app'));
console.log('Done replacing strings.');
