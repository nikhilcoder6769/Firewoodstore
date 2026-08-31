import { useAppStore } from '../store';
import { ProductCard } from '../components/ProductCard';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Wishlist() {
  const { wishlist, products, clearWishlist } = useAppStore();
  
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-12 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 fill-primary text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">My Wishlist</h1>
            <p className="text-text-secondary mt-1">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
        {wishlistedProducts.length > 0 && (
          <button 
            onClick={clearWishlist}
            className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-colors font-medium text-sm border border-error/20"
          >
            <Trash2 className="w-4 h-4" />
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl">
          <Heart className="w-16 h-16 text-border mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Save your favorite assets here to easily find them later or purchase them when you're ready.
          </p>
          <Link 
            to="/products" 
            className="inline-block bg-primary hover:bg-button-hover text-white py-3 px-8 rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
