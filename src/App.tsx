import { Contact } from './pages/Contact';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import { Chatbot } from './components/Chatbot';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, Suspense, lazy } from 'react';
import { useAppStore, Product } from './store';
import { collection, onSnapshot, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';
import { mockProducts } from './data';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));

function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} FireWood Store. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore */}
      <Suspense key={location.pathname} fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes location={location}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/contact" element={<Contact />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  const products = useAppStore(state => state.products);
    const setProducts = useAppStore(state => state.setProducts);
  const setCurrency = useAppStore(state => state.setCurrency);

  useEffect(() => {
    setCurrency('INR');
    
    const unsubscribe = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (snapshot.empty) {
        // Only seed once if totally empty
        try {
          const batch = writeBatch(db);
          mockProducts.forEach(p => {
            const docRef = doc(collection(db, 'products'), p.id);
            batch.set(docRef, p);
          });
          await batch.commit();
        } catch(e) {
          console.error("Seeding failed or permission denied", e);
        }
      } else {
        const firebaseProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        setProducts(firebaseProducts);
      }
    }, (error) => {
      console.error("Firestore Error in products listener:", error);
    });

    
    return () => unsubscribe();
  }, [setProducts, setCurrency]); // remove products and updateProduct from deps so it doesn't trigger on every product update

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background text-text-primary">
          <Navbar />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Chatbot />
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
