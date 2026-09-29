const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import { useAppStore, Product } from './store';`,
  `import { useAppStore, Product, Category } from './store';`
);

code = code.replace(
  `const setProducts = useAppStore(state => state.setProducts);`,
  `const setProducts = useAppStore(state => state.setProducts);\n  const setCategories = useAppStore(state => state.setCategories);`
);

code = code.replace(
  `    return () => unsubscribe();\n  }, [setProducts, setCurrency]);`,
  `    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {\n      if (!snapshot.empty) {\n        const firebaseCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));\n        setCategories(firebaseCategories);\n      } else {\n        setCategories([]);\n      }\n    });\n\n    return () => {\n      unsubscribe();\n      unsubscribeCategories();\n    };\n  }, [setProducts, setCurrency, setCategories]);`
);

fs.writeFileSync('src/App.tsx', code);
