import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { SEO } from '../components/SEO';
import { useAppStore } from '../store';
import { useState, useEffect } from 'react';

export function Home() {
  const products = useAppStore((state) => state.products);
  const isLoading = products.length === 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO />
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-24 relative bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format,compress&fit=crop&q=80&w=1200')] md:bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format,compress&fit=crop&q=80&w=2564')] bg-cover bg-center rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
            Be like <span className="text-primary block sm:inline">'FireWood'</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Premium digital assets for creators, editors, and motion designers. 
            Find, preview, and download high-quality packs instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/products?category=cc" 
              className="w-full sm:w-auto bg-primary hover:bg-button-hover text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Explore CC (Colour Correction)
            </Link>
            <Link 
              to="/products?category=templates" 
              className="w-full sm:w-auto bg-surface hover:bg-border text-text-primary px-8 py-3 rounded-full font-medium transition-colors border border-border"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Assets</h2>
            <p className="text-text-secondary">Top tier quality for your next project.</p>
          </div>
          <Link to="/products" className="text-primary hover:text-button-hover flex items-center font-medium">
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 border-t border-border mt-12">
        <div className="max-w-3xl mx-auto text-center bg-surface border border-border p-6 md:p-10 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-text-secondary mb-8">
            Have questions about a product, licensing, or need support with your order? Send us a message and we'll get back to you shortly.
          </p>
          <form className="space-y-4 max-w-md mx-auto text-left" onSubmit={(e) => { e.preventDefault(); alert('Your message has been sent successfully! We will contact you soon.'); }}>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-primary" 
                placeholder="you@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
              <textarea 
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors h-32 resize-none text-text-primary" 
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-button-hover text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
