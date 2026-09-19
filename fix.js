const fs = require('fs');

const files = ['js/games-repository.js', 'js/ecommerce-core.js', 'checkout.html'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\\$\\{/g, '${');
  content = content.replace(/\\\\`/g, '`');
  content = content.replace(/\\\\'/g, "\\'");
  
  // Specific fixes for \` that were escaped
  content = content.replace(/\\`/g, '`');
  // Specific fixes for \${
  content = content.replace(/\\\${/g, '${');
  
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});

