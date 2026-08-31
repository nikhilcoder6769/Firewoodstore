import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Moon, Sun, User, LogOut, Package, Menu, X, Search, Heart, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';
import { logOut } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { useAdmin } from '../hooks/useAdmin';
import { AuthModal } from './AuthModal';


export function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme, cart, user, setUser, wishlist } = useAppStore();
  const adminRoles = useAdmin();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleAuth = async () => {
    if (user) {
      await logOut();
      setIsDropdownOpen(false);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-8 shrink-0">
          <button 
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter text-primary shrink-0">
            FireWood Store
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/products?category=cc" className="hover:text-primary transition-colors">CC (Colour Correction)</Link>
            <Link to="/products?category=thumbnails" className="hover:text-primary transition-colors">Thumbnails</Link>
            <Link to="/products?category=templates" className="hover:text-primary transition-colors">Templates</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-4 shrink-0">
          
          <Link to="/products" className="p-2 sm:p-2.5 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/wishlist" className="p-2 sm:p-2.5 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors relative" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 hidden dark:block" />
            <Moon className="h-5 w-5 block dark:hidden" />
          </button>
          
          <Link to="/cart" className="p-2 sm:p-2.5 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          <div className="relative">
            <button
              onClick={() => user ? setIsDropdownOpen(!isDropdownOpen) : handleAuth()}
              className="flex items-center gap-2 p-2 sm:p-2.5 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            >
              {user && user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>
            
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-surface ring-1 ring-black ring-opacity-5 border border-border">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary truncate">{user.displayName}</p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-background"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Buy History
                </Link>
                {(adminRoles.isSuperAdmin || adminRoles.isProductAdmin || adminRoles.isCouponAdmin || adminRoles.isSupportAdmin) && (
                  <Link
                    to="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-background"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleAuth}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-error hover:bg-background"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-text-primary hover:text-primary transition-colors">Home</Link>
          <Link to="/products?category=cc" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-text-primary hover:text-primary transition-colors">CC (Colour Correction)</Link>
          <Link to="/products?category=thumbnails" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-text-primary hover:text-primary transition-colors">Thumbnails</Link>
          <Link to="/products?category=templates" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-text-primary hover:text-primary transition-colors">Templates</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-text-primary hover:text-primary transition-colors">Contact</Link>
          <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-text-primary hover:text-primary transition-colors">Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</Link>
          <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="block text-base font-medium text-text-primary hover:text-primary transition-colors text-left w-full">Toggle Theme</button>
        </div>
      )}
    </nav>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
