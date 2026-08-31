import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { SEO } from '../components/SEO';
import { useState, useMemo, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { useAppStore } from '../store';
import { formatPrice } from '../lib/currency';

const formatCategory = (cat: string) => {
  if (cat === 'cc') return 'CC (Colour Correction)';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export function Products() {
  const products = useAppStore(state => state.products);
  const {  } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const creatorFilter = searchParams.get('creator');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState<number>(100);
  const isLoading = products.length === 0;
  
  const [localCategory, setLocalCategory] = useState<string | null>(categoryFilter);
  const [localCreator, setLocalCreator] = useState<string | null>(creatorFilter);
  const [localPriceRange, setLocalPriceRange] = useState<number>(100);
  
  const [showFilters, setShowFilters] = useState(false);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const creators = Array.from(new Set(products.map(p => p.creator).filter(Boolean))) as string[];

  const displayedProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = categoryFilter ? p.category === categoryFilter : true;
      const matchCreator = creatorFilter ? p.creator === creatorFilter : true;
      const matchPrice = p.price <= appliedPriceRange;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchCreator && matchPrice && matchSearch;
    });
  }, [categoryFilter, creatorFilter, appliedPriceRange, searchQuery, products]);

  const handleApplyFilters = () => {
    if (localCategory) {
      searchParams.set('category', localCategory);
    } else {
      searchParams.delete('category');
    }
    if (localCreator) {
      searchParams.set('creator', localCreator);
    } else {
      searchParams.delete('creator');
    }
    setSearchParams(searchParams);
    setAppliedPriceRange(localPriceRange);
    
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title={`${categoryFilter ? formatCategory(categoryFilter) : 'All Assets'} | FireWood`} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {categoryFilter ? <span>{formatCategory(categoryFilter)}</span> : 'All Assets'}
          </h1>
          <p className="text-text-secondary">
            {categoryFilter ? `Browse our collection of premium ${categoryFilter}.` : 'Browse our entire collection of digital assets.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
            />
            {searchQuery && displayedProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {displayedProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSearchQuery(product.title);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-border/50 text-sm border-b border-border last:border-0 transition-colors"
                  >
                    <div className="font-medium text-text-primary">{product.title}</div>
                    <div className="text-xs text-text-secondary capitalize">{formatCategory(product.category)} • {formatPrice(product.price)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-sm font-medium shrink-0"
          >
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`w-full md:w-64 shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div>
            <h2 className="font-bold text-lg mb-4 pb-2 border-b border-border flex items-center gap-2">
              <Filter size={18} /> Filters
            </h2>
            
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium mb-3 text-text-secondary">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={!localCategory}
                      onChange={() => setLocalCategory(null)}
                      className="text-primary focus:ring-primary bg-background border-border"
                    />
                    <span className="text-sm">All</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={localCategory === cat}
                        onChange={() => setLocalCategory(cat)}
                        className="text-primary focus:ring-primary bg-background border-border"
                      />
                      <span className="text-sm">{formatCategory(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Creator Filter */}
              {creators.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 text-text-secondary">Creator</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="creator" 
                        checked={!localCreator}
                        onChange={() => setLocalCreator(null)}
                        className="text-primary focus:ring-primary bg-background border-border"
                      />
                      <span className="text-sm">All Creators</span>
                    </label>
                    {creators.map(creator => (
                      <label key={creator} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="creator" 
                          checked={localCreator === creator}
                          onChange={() => setLocalCreator(creator)}
                          className="text-primary focus:ring-primary bg-background border-border"
                        />
                        <span className="text-sm">{creator}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              <div>
                <h3 className="font-medium mb-3 text-text-secondary flex justify-between">
                  <span>Max Price</span>
                  <span className="text-primary">{formatPrice(localPriceRange)}</span>
                </h3>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={localPriceRange}
                  onChange={(e) => setLocalPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(100)}+</span>
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full bg-primary hover:bg-button-hover text-white py-2 rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              displayedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
          {!isLoading && displayedProducts.length === 0 && (
            <div className="text-center py-20 text-text-secondary bg-surface border border-border rounded-2xl">
              No products found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
