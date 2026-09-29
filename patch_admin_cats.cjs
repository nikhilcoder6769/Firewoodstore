const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `{product.category === 'cc' ? 'CC (Colour Correction)' : product.category}`,
  `{categories.find(c => c.id === product.category)?.name || (product.category === 'cc' ? 'CC (Colour Correction)' : product.category)}`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
