const fs = require('fs');
let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

code = code.replace(
  /const \[appliedPriceRange, setAppliedPriceRange\] = useState<number>\(100\);/g,
  'const [appliedPriceRange, setAppliedPriceRange] = useState<number>(10000);'
);

code = code.replace(
  /const \[localPriceRange, setLocalPriceRange\] = useState<number>\(100\);/g,
  'const [localPriceRange, setLocalPriceRange] = useState<number>(10000);'
);

code = code.replace(
  /<input \n                  type="range" \n                  min="0" \n                  max="100" \n                  step="5"/g,
  '<input \n                  type="range" \n                  min="0" \n                  max="10000" \n                  step="500"'
);

code = code.replace(
  /<span>\{formatPrice\(100\)}\+<\/span>/g,
  '<span>{formatPrice(10000)}+</span>'
);

fs.writeFileSync('src/pages/Products.tsx', code);
