import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Trash2, ArrowRight, Check, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { getAccessToken, signInWithGoogle, auth } from '../lib/firebase';
import { formatPrice } from '../lib/currency';

export function Cart() {
  const { cart, removeFromCart, clearCart, user, addPurchase, coupons } = useAppStore();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
  
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const total = subtotalAfterCoupon;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!user) {
      setCouponError('Please log in to apply coupons');
      return;
    }
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not logged in");
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ code: couponCode.toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');
      setAppliedCoupon(data.coupon);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to continue to checkout.");
      return;
    }
    
    const confirmed = window.confirm(`Ready to check out and send an email receipt to ${user.email}?`);
    if (!confirmed) return;
    
    let token = getAccessToken();
    
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not logged in");
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ cart, couponCode: appliedCoupon?.code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      
      const orderId = data.orderId;
      
      data.purchases.forEach((p: any) => {
        addPurchase(p);
      });
      
      const orderDate = new Date().toISOString();

      

    // Send email using Gmail API
    try {
      if (!token) {
        const confirmLogin = window.confirm("You need to sign in with Google again to send the receipt via Gmail. Proceed?");
        if (!confirmLogin) return;
        await signInWithGoogle();
        token = getAccessToken();
        if (!token) throw new Error("Failed to get access token");
      }
      
      const subject = 'Your Receipt from FireWood Store';
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for your purchase!</h2>
          <p>Your order has been processed successfully. You bought <strong>${cart.length}</strong> items for a total of <strong>${formatPrice(total)}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px;">Item</th>
              <th style="text-align: right; padding: 8px;">Price</th>
            </tr>
            ${cart.map(item => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px;">${item.title}</td>
                <td style="text-align: right; padding: 8px;">${formatPrice(item.price)}</td>
              </tr>
            `).join('')}
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total</td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">${formatPrice(total)}</td>
            </tr>
          </table>
          <p style="margin-top: 24px;">You can access your digital downloads in your <a href="https://firewood-assets.com/dashboard" style="color: #2563eb;">account dashboard</a>.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">&copy; ${new Date().getFullYear()} FireWood Store. All rights reserved.</p>
        </div>
      `;
      
      const emailLines = [
        `To: ${user.email}`,
        'Subject: ' + subject,
        'Content-Type: text/html; charset="UTF-8"',
        '',
        htmlBody
      ];
      const email = emailLines.join('\r\n');
      const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
        
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64EncodedEmail
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error("Gmail API error:", err);
        throw new Error("Failed to send email");
      }
      
      console.log('Email receipt sent successfully via Gmail API');
    } catch (error) {
      console.error('Error sending email receipt:', error);
      alert('Failed to send email receipt, but your order was processed.');
    }

    setOrderDetails({
      id: orderId,
      date: orderDate,
      items: [...cart],
      total,
      subtotal,
      discount: couponDiscount
    });
    
    clearCart();
    setCheckoutComplete(true);
    window.scrollTo(0, 0);
    } catch (error: any) {
      alert(`Checkout error: ${error.message}`);
    }
  };

  if (checkoutComplete && orderDetails) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl print-invoice">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center print:border-none print:shadow-none print:p-0">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6 print-hide">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Checkout Successful!</h2>
          <p className="text-text-secondary mb-8 print-hide">Your order #{orderDetails.id} has been processed.</p>
          
          <div className="text-left bg-background border border-border p-6 rounded-xl mb-8 print:border-none print:p-0 print:bg-transparent">
             <div className="flex justify-between items-end border-b border-border pb-4 mb-4">
                <div>
                   <h3 className="font-bold text-lg">Order Summary</h3>
                   <p className="text-sm text-text-secondary">Order #{orderDetails.id}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm text-text-secondary">{new Date(orderDetails.date).toLocaleDateString()}</p>
                </div>
             </div>
             
             <div className="space-y-3 mb-4">
               {orderDetails.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.title}</span>
                      {item.quantity > 1 && <span className="text-text-secondary text-sm ml-2">x{item.quantity}</span>}
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
               ))}
             </div>

             {orderDetails.discount > 0 && (
               <div className="flex justify-between text-success text-sm mb-4">
                  <span>Discounts Applied</span>
                  <span>-{formatPrice(orderDetails.discount)}</span>
               </div>
             )}

             <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span>{formatPrice(orderDetails.total)}</span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center print-hide">
            <button 
              onClick={() => window.print()} 
              className="bg-surface border border-border hover:bg-background text-text-primary px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" /> Download Receipt
            </button>
            <Link 
              to="/dashboard" 
              className="bg-primary hover:bg-button-hover text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-text-secondary mb-8">Looks like you haven't added any digital assets to your cart yet.</p>
        <Link to="/" className="bg-primary hover:bg-button-hover text-white px-8 py-3 rounded-full font-medium transition-colors inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border">
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 sm:w-24 sm:h-24 object-cover rounded-lg" />
              <div className="flex-1 w-full flex justify-between items-start sm:items-center">
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-text-secondary text-sm capitalize">{item.category === 'cc' ? 'CC (Colour Correction)' : item.category}</p>
                  <div className="font-bold mt-2">{formatPrice(item.price)} x {item.quantity}</div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-surface p-6 rounded-xl border border-border h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-4 pb-4 border-b border-border">Order Summary</h3>
          <div className="flex justify-between mb-4 text-text-secondary">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <form onSubmit={handleApplyCoupon} className="mb-4 pt-4 border-t border-border">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Coupon Code" 
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponError) setCouponError('');
                }}
                onFocus={() => {
                  if (couponError) {
                    setCouponCode('');
                    setCouponError('');
                  }
                }}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm uppercase"
              />
              <button type="submit" className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Apply
              
                </button>
            </div>
            {couponError && <p className="text-error text-xs mt-2">{couponError}</p>}
          </form>

          {appliedCoupon && (
            <div className="flex justify-between items-center mb-4 text-success font-medium">
              <div className="flex items-center gap-2">
                <span>Coupon ({appliedCoupon.code})</span>
                <button 
                  onClick={() => setAppliedCoupon(null)} 
                  className="text-xs text-error hover:underline bg-error/10 px-2 py-0.5 rounded-full"
                >
                  Remove
                
                </button>
              </div>
              <span>-{formatPrice(couponDiscount)}</span>
            </div>
          )}
          
          

          <div className="flex justify-between font-bold text-xl mb-2 pt-4 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          
          <div className="text-xs text-text-secondary mb-8 text-right">
            Earns {Math.floor(total)} loyalty points
          </div>
          <button onClick={handleCheckout}
            className="w-full bg-primary hover:bg-button-hover text-white py-4 rounded-xl font-bold flex items-center justify-center transition-colors"
          >
            Checkout Securely in Rupees (₹) <ArrowRight className="ml-2 w-5 h-5" />
          
                </button>
        </div>
      </div>
    </div>
  );
}
