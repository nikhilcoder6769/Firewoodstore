const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `<option value="templates">Templates</option>`,
  `<option value="templates">Templates</option>\n                      <option value="tools">Tools & Plugins</option>`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
