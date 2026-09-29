const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `const { user, products, addProduct, removeProduct, coupons, addCoupon, removeCoupon } = useAppStore();`,
  `const { user, products, addProduct, removeProduct, coupons, addCoupon, removeCoupon, categories } = useAppStore();\n  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);\n  const [newCategory, setNewCategory] = useState({ id: '', name: '' });`
);

code = code.replace(
  `            {adminRoles.isProductAdmin && <button 
              onClick={() => setIsManageProductsOpen(true)}
              className="w-full text-left px-4 py-3 bg-background hover:bg-border/50 border border-border rounded-lg font-medium transition-colors"
            >
              📦 Manage Products
            </button>}`,
  `            {adminRoles.isProductAdmin && <button 
              onClick={() => setIsManageProductsOpen(true)}
              className="w-full text-left px-4 py-3 bg-background hover:bg-border/50 border border-border rounded-lg font-medium transition-colors"
            >
              📦 Manage Products
            </button>}
            {adminRoles.isProductAdmin && <button 
              onClick={() => setIsManageCategoriesOpen(true)}
              className="w-full text-left px-4 py-3 bg-background hover:bg-border/50 border border-border rounded-lg font-medium transition-colors"
            >
              🏷️ Manage Categories
            </button>}`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
