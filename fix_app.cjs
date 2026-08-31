const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/\/\/ Migration to replace LUTs with CC \(Colour Correction\) in user's local storage[\s\S]*?\}\);/g, '');

fs.writeFileSync('src/App.tsx', app);
