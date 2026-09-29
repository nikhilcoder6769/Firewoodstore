const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
  '    match /products/{productId} {',
  '    match /categories/{categoryId} {\n      allow read: if true;\n      allow write: if isProductAdmin();\n    }\n\n    match /products/{productId} {'
);
fs.writeFileSync('firestore.rules', code);
