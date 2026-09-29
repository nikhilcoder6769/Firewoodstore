const fs = require('fs');
let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

code = code.replace(
  `const formatCategory = (cat: string) => {\n  if (cat === 'cc') return 'CC (Colour Correction)';\n  return cat.charAt(0).toUpperCase() + cat.slice(1);\n};`,
  `const formatCategory = (cat: string) => {\n  if (cat === 'cc') return 'CC (Colour Correction)';\n  if (cat === 'tools') return 'Tools & Plugins';\n  return cat.charAt(0).toUpperCase() + cat.slice(1);\n};`
);

fs.writeFileSync('src/pages/Products.tsx', code);
