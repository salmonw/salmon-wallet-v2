const fs = require('fs');
const path = require('path');

const findFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && file !== 'adapter') {
      results = results.concat(findFiles(filePath));
    } else if (file.endsWith('.js') && !filePath.includes('src/adapter')) {
      results.push(filePath);
    }
  });
  return results;
};

const files = findFiles('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Reemplazar importaciones del adapter local por el paquete npm
  if (content.includes("from '../../adapter") || 
      content.includes("from '../../../adapter") ||
      content.includes("from '../adapter") ||
      content.includes("from './adapter")) {
    
    // Reemplazar todas las variantes
    content = content.replace(/from ['"]\.\.\/\.\.\/adapter['"]/g, `from 'salmon-wallet-adapter'`);
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/adapter['"]/g, `from 'salmon-wallet-adapter'`);
    content = content.replace(/from ['"]\.\.\/adapter['"]/g, `from 'salmon-wallet-adapter'`);
    content = content.replace(/from ['"]\.\/adapter['"]/g, `from 'salmon-wallet-adapter'`);
    content = content.replace(/from ['"]\.\.\/adapter\//g, `from 'salmon-wallet-adapter/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/adapter\//g, `from 'salmon-wallet-adapter/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/adapter\//g, `from 'salmon-wallet-adapter/`);
    
    // Solo si cambió, guardar
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✓ Updated: ${file}`);
    }
  }
});

console.log('Done!');

