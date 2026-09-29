const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const selectHtml = `
                    <select className="w-full bg-background border border-border rounded-xl px-4 py-2" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      {categories.length === 0 && <option value="cc">CC (Colour Correction)</option>}
                    </select>
`;

code = code.replace(
  /<select className="w-full bg-background border border-border rounded-xl px-4 py-2" value=\{newProduct\.category\} onChange=\{e => setNewProduct\(\{\.\.\.newProduct, category: e\.target\.value\}\)\}>[\s\S]*?<\/select>/,
  selectHtml
);

fs.writeFileSync('src/pages/Admin.tsx', code);
