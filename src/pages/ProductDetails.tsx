import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ImageSlider } from '../components/ImageSlider';
import { Check, ShoppingCart, ShieldCheck, Download, ArrowRight, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Reviews } from '../components/Reviews';
import { formatPrice } from '../lib/currency';
import { ProductDetailsSkeleton } from '../components/ProductDetailsSkeleton';
import { SEO } from '../components/SEO';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, products, wishlist, toggleWishlist } = useAppStore();
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const isLoading = products.length === 0;
  
  const product = products.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-20 text-center">Product not found.</div>;
  }
  
  const inCart = cart.some(item => item.id === product.id);
  const isWishlisted = wishlist.includes(product.id);

  const displayImage = selectedImage || product.imageUrl;
  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    if (inCart) {
      navigate('/cart');
    } else {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [
      displayImage
    ],
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Firewood Assets"
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 relative">
      <SEO 
        title={`${product.title} | FireWood`} 
        description={product.description} 
        image={product.imageUrl}
        schema={productSchema}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Visuals */}
        <div className="space-y-6">
          {product.beforeImageUrl && product.afterImageUrl ? (
            <ImageSlider 
              beforeImage={product.beforeImageUrl} 
              afterImage={product.afterImageUrl} 
            />
          ) : (
            <div className="space-y-4">
              <div className={`rounded-2xl overflow-hidden bg-surface border border-border ${product.category?.toLowerCase().includes('thumbnail') ? 'aspect-video' : 'aspect-[4/3]'}`}>
                <img src={displayImage} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${displayImage === img ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-text-secondary/50'}`}
                    >
                      <img src={img} alt={`${product.title} view ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-2 uppercase text-xs font-bold tracking-wider text-primary">
            {product.category === 'cc' ? 'CC (Colour Correction)' : product.category}
          </div>
          <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
          
          {product.aeCompatible && (
            <div className="inline-block mb-4 w-max text-sm font-medium px-3 py-1.5 bg-[#00005e]/20 text-[#9999ff] border border-[#9999ff]/30 rounded-md">
              Compatible with Adobe After Effects 2023 or newer
            </div>
          )}
          
          <p className="text-xl text-text-secondary mb-8">{product.description}</p>
          
          <div className="bg-surface border border-border rounded-xl p-6 mb-8 relative">
            <button 
              onClick={() => {
                toggleWishlist(product.id);
                if (!isWishlisted) {
                  setWishlistAdded(true);
                  setTimeout(() => setWishlistAdded(false), 2000);
                }
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-background transition-colors border border-border"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : 'text-text-secondary'}`} />
            </button>
            <div className="text-3xl font-bold mb-6">{formatPrice(product.price)}</div>
            <button 
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-colors shadow-lg ${
                inCart || added
                  ? 'bg-success hover:bg-success/90 text-white shadow-success/20'
                  : 'bg-primary hover:bg-button-hover text-white shadow-primary/20'
              }`}
            >
              {inCart ? (
                <><ArrowRight className="mr-2" /> Go to Cart</>
              ) : added ? (
                <><Check className="mr-2" /> Added to Cart</>
              ) : (
                <><ShoppingCart className="mr-2" /> Add to Cart</>
              )}
            </button>
            
            <div className="mt-6 flex flex-col gap-3 text-sm text-text-secondary">
              <div className="flex items-center">
                <Download className="w-4 h-4 mr-2 text-primary" /> Instant digital download
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-success" /> Secure payment in Rupees via Razorpay
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">What's Included</h3>
            <ul className="space-y-3">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="w-5 h-5 mr-3 text-success shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <Reviews productId={product.id} />

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
    </div>
  );
}
