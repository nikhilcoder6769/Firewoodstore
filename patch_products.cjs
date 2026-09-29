const fs = require('fs');
let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

code = code.replace(
  `import { useSearchParams } from 'react-router-dom';`,
  `import { useSearchParams, useNavigate } from 'react-router-dom';`
);

code = code.replace(
  `const [searchParams, setSearchParams] = useSearchParams();`,
  `const [searchParams, setSearchParams] = useSearchParams();\n  const navigate = useNavigate();`
);

code = code.replace(
  `const [localPriceRange, setLocalPriceRange] = useState<number>(100);`,
  `const [localPriceRange, setLocalPriceRange] = useState<number>(100);\n\n  useEffect(() => {\n    setLocalCategory(categoryFilter);\n    setLocalCreator(creatorFilter);\n  }, [categoryFilter, creatorFilter]);`
);

code = code.replace(
  `onClick={() => {\n                      setSearchQuery(product.title);\n                    }}`,
  `onClick={() => {\n                      navigate(\`/product/\${product.id}\`);\n                    }}`
);

fs.writeFileSync('src/pages/Products.tsx', code);
