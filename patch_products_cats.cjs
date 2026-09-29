const fs = require('fs');
let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

code = code.replace(
  `const formatCategory = (cat: string) => {\n  if (cat === 'cc') return 'CC (Colour Correction)';\n  if (cat === 'tools') return 'Tools & Plugins';\n  return cat.charAt(0).toUpperCase() + cat.slice(1);\n};`,
  `// Dynamic formatCategory using store`
);

code = code.replace(
  `const {  } = useAppStore();`,
  `const { categories } = useAppStore();\n  const formatCategory = (cat: string) => {\n    const found = categories.find(c => c.id === cat);\n    if (found) return found.name;\n    if (cat === 'cc') return 'CC (Colour Correction)';\n    if (cat === 'tools') return 'Tools & Plugins';\n    return cat.charAt(0).toUpperCase() + cat.slice(1);\n  };`
);

code = code.replace(
  `const categories = Array.from(new Set(products.map(p => p.category)));`,
  `const categoryIds = categories.length > 0 ? categories.map(c => c.id) : Array.from(new Set(products.map(p => p.category)));`
);

// We need to change where we iterate over `categories` in the UI to iterate over `categoryIds`
code = code.replace(
  `{categories.map(cat => (`,
  `{categoryIds.map(cat => (`
);

fs.writeFileSync('src/pages/Products.tsx', code);
