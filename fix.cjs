const fs = require('fs');
let content = fs.readFileSync('src/pages/Cart.tsx', 'utf8');

// Fix 1: Coupon form
content = content.replace(/className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm uppercase"\s*\/>\s*<\/div>\s*<button type="submit"/g, 
  `className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm uppercase" />\n              <button type="submit"`);

// Fix 2: Coupon apply div 
content = content.replace(/<span>Coupon \(\{appliedCoupon.code\}\)<\/span>\s*<\/div>\s*<button/g,
  `<span>Coupon ({appliedCoupon.code})</span>\n                <button`);

// Fix 3: Discount points div
content = content.replace(/<span>Discount \(Points\)<\/span>\s*<\/div>\s*<button/g,
  `<span>Discount (Points)</span>\n                <button`);

// Fix 4: Total loyalty points div 
content = content.replace(/Earns \{Math.floor\(total\)\} loyalty points\s*<\/div>\s*<\/div>\s*<button\s*onClick=\{handleCheckout\}/g,
  `Earns {Math.floor(total)} loyalty points\n          </div>\n          <button onClick={handleCheckout}`);

fs.writeFileSync('src/pages/Cart.tsx', content);
