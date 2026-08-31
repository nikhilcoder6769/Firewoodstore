import React from 'react';
import { useAppStore, Purchase } from '../store';
import { Download, FileText, CheckCircle2, Star, X } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { auth } from '../lib/firebase';
import { formatPrice } from '../lib/currency';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function Dashboard() {
  const { user, purchases, products } = useAppStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [invoiceModalPurchase, setInvoiceModalPurchase] = useState<Purchase | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userPurchases = purchases.filter(p => p.userEmail === user.email);

  const handleDownload = async (purchaseId: string, productId: string) => {
    setDownloadingId(purchaseId);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not logged in");
      
      const res = await fetch('/api/get-download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get download URL');
      
      setDownloadingId(null);
      setDownloadedId(purchaseId);
      
      const a = document.createElement('a');
      a.href = data.url;
      a.download = ""; // the backend sets Content-Disposition
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => setDownloadedId(null), 3000);
    } catch (error: any) {
      setDownloadingId(null);
      alert(error.message);
    }
  };

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;
    
    const element = invoiceRef.current;
    const opt = {
      margin: 1,
      filename: `Invoice_${invoiceModalPurchase?.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-border">
        <div className="flex items-center gap-4">
          {user.photoURL && (
            <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-primary" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{user.displayName || 'Creator'}</h1>
            <p className="text-text-secondary">{user.email}</p>
          </div>
        </div>
        
        
      </div>

      <h2 className="text-2xl font-bold mb-6">Buy History</h2>
      
      {userPurchases.length === 0 ? (
        <div className="bg-surface p-10 rounded-xl border border-border text-center">
          <p className="text-text-secondary mb-4">You haven't purchased any assets yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {userPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-surface p-6 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-primary transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{purchase.title}</h3>
                <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded flex items-center font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Order #{purchase.id} &bull; {new Date(purchase.date).toLocaleDateString()} &bull; {formatPrice(purchase.price)}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link 
                to={`/product/${purchase.productId}`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-border hover:bg-background rounded-lg text-sm font-medium transition-colors"
              >
                <Star className="w-4 h-4 text-yellow-400" /> Leave a Review
              </Link>
              <button 
                onClick={() => setInvoiceModalPurchase(purchase)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-border hover:bg-background rounded-lg text-sm font-medium transition-colors"
              >
                <FileText className="w-4 h-4" /> Invoice
              </button>
              <button 
                onClick={() => handleDownload(purchase.id, purchase.productId)}
                disabled={downloadingId === purchase.id}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  downloadedId === purchase.id 
                    ? 'bg-success text-white' 
                    : 'bg-primary hover:bg-button-hover text-white'
                }`}
              >
                {downloadingId === purchase.id ? (
                  <span className="animate-pulse">Downloading...</span>
                ) : downloadedId === purchase.id ? (
                  <><CheckCircle2 className="w-4 h-4" /> Downloaded</>
                ) : (
                  <><Download className="w-4 h-4" /> Download</>
                )}
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none">
          <div ref={invoiceRef} className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative print-invoice">
            <button 
              onClick={() => setInvoiceModalPurchase(null)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-background transition-colors print-hide"
              data-html2canvas-ignore
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-primary">FIREWOOD</h2>
                  <p className="text-text-secondary text-sm">Receipt / Invoice</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">#{invoiceModalPurchase.id}</p>
                  <p className="text-sm text-text-secondary">{new Date(invoiceModalPurchase.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-sm text-text-secondary mb-1">Billed to:</p>
                <p className="font-medium">{user.displayName || 'Customer'}</p>
                <p className="text-sm">{user.email}</p>
              </div>

              <div className="bg-background rounded-xl p-4 mb-8">
                <div className="flex justify-between font-bold mb-2 pb-2 border-b border-border">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between py-2 text-text-secondary">
                  <span>{invoiceModalPurchase.title}</span>
                  <span>{formatPrice(invoiceModalPurchase.price)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                  <span>Total Paid</span>
                  <span className="text-primary">{formatPrice(invoiceModalPurchase.price)}</span>
                </div>
              </div>
              
              <div className="flex gap-4 print-hide" data-html2canvas-ignore>
                <button 
                  onClick={downloadInvoice}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button 
                  onClick={() => setInvoiceModalPurchase(null)}
                  className="w-full border border-border hover:bg-background py-3 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
