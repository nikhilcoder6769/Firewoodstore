const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

const categoryType = `
export interface Category {
  id: string;
  name: string;
}
`;

code = code.replace(
  `export interface Product {`,
  categoryType + `\nexport interface Product {`
);

code = code.replace(
  `  products: Product[];`,
  `  categories: Category[];\n  setCategories: (categories: Category[]) => void;\n  addCategory: (category: Category) => void;\n  removeCategory: (id: string) => void;\n\n  products: Product[];`
);

code = code.replace(
  `      theme: 'system',`,
  `      categories: [],\n      setCategories: (categories) => set({ categories }),\n      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),\n      removeCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),\n\n      theme: 'system',`
);

code = code.replace(
  `wishlist: state.wishlist, coupons: state.coupons,   }),`,
  `wishlist: state.wishlist, coupons: state.coupons, categories: state.categories,  }),`
);

fs.writeFileSync('src/store.ts', code);
