const fs = require('fs');
let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

code = code.replace(
  `setSearchParams(searchParams);`,
  `setSearchParams(new URLSearchParams(searchParams.toString()));`
);

fs.writeFileSync('src/pages/Products.tsx', code);
