const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/const updateProduct = useAppStore\(state => state\.updateProduct\);\n/g, '');

fs.writeFileSync('src/App.tsx', app);
