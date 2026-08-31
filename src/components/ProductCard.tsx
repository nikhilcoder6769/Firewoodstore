import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, ArrowRight, Heart } from 'lucide-react';
import { useAppStore, Product } from '../store';
import { useState } from 'react';
import { formatPrice } from '../lib/currency';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
  key?: React.Key | string | number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { user, addToCart, cart, wishlist, toggleWishlist } = useAppStore();
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const navigate = useNavigate();

  const inCart = cart.some(item => item.id === product.id);
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      navigate('/cart');
    } else {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWishlisted) {
      setWishlistAdded(true);
      setTimeout(() => setWishlistAdded(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className={`overflow-hidden relative bg-black block group/image ${product.category?.toLowerCase().includes('thumbnail') ? 'aspect-video' : 'aspect-[4/3]'}`}>
        <Link to={`/product/${product.id}`} className="w-full h-full block relative">
          <img 
            src={product.beforeImageUrl || product.imageUrl} 
            alt={product.title} 
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 group-hover/image:scale-105 ${product.afterImageUrl ? 'absolute inset-0 opacity-100 group-hover/image:opacity-0' : ''}`}
          />
          {product.afterImageUrl && (
            <img 
              src={product.afterImageUrl} 
              alt={`${product.title} After view`} 
              loading="lazy"
              className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-105 absolute inset-0 opacity-0 group-hover/image:opacity-100"
            />
          )}
        </Link>
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white capitalize border border-white/10 pointer-events-none">
          {product.category === 'cc' ? 'CC (Colour Correction)' : product.category}
        </div>
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/60 transition-colors z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-primary text-primary border-none' : ''}`} />
        </button>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-semibold text-lg mb-1 truncate hover:text-primary transition-colors">{product.title}</h3>
        </Link>
        
        {product.aeCompatible && (
          <div className="inline-block mt-1 mb-2 text-xs font-medium px-2 py-1 bg-[#00005e]/20 text-[#9999ff] border border-[#9999ff]/30 rounded-md">
            Compatible with Adobe After Effects 2023 or newer
          </div>
        )}

        <div className="flex items-center text-sm text-text-secondary mb-3">
          <Star className="w-4 h-4 text-secondary fill-secondary mr-1" />
          <span>4.9 (128 reviews)</span>
        </div>
        
        {/* Spacer to push price to bottom */}
        <div className="flex-1"></div>

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          <button 
            onClick={handleAddToCart}
            className={`w-full py-2 rounded-xl font-bold flex items-center justify-center transition-colors text-sm ${
              inCart || added 
                ? 'bg-success hover:bg-success/90 text-white' 
                : 'bg-primary hover:bg-button-hover text-white'
            }`}
          >
            {inCart ? (
              <><ArrowRight className="mr-2 w-4 h-4" /> Go to Cart</>
            ) : added ? (
              <><Check className="mr-2 w-4 h-4" /> Added</>
            ) : (
              <><ShoppingCart className="mr-2 w-4 h-4" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
      
      {/* Pop message popup for cart */}
      {added && (
        <div className="fixed bottom-6 right-6 bg-surface border border-border shadow-2xl p-4 rounded-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 bg-success/20 text-success rounded-full flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Added to Cart</p>
            <p className="text-xs text-text-secondary">{product.title}</p>
          </div>
        </div>
      )}

      {/* Pop message popup for wishlist */}
      {wishlistAdded && (
        <div className="fixed bottom-24 right-6 bg-surface border border-border shadow-2xl p-4 rounded-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">Added to Wishlist</p>
            <p className="text-xs text-text-secondary">{product.title}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
