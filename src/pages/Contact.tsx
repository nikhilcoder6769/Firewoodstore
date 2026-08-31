import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';

export function Contact() {
  const { user } = useAppStore();
  const [formData, setFormData] = useState({ name: '', email: user?.email || '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'unread',
        userId: user?.uid || null
      });
      setStatus('success');
      setFormData({ name: '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="text-text-secondary text-center mb-12">Have a question or need support? Send us a message and we'll get back to you soon.</p>
      
      {status === 'success' ? (
        <div className="bg-success/10 border border-success/30 p-8 rounded-2xl flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-success mb-4" />
          <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
          <p className="text-text-secondary">Thank you for reaching out. We will get back to you as soon as possible.</p>
          <button onClick={() => setStatus('idle')} className="mt-6 font-medium text-primary hover:underline">Send another message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Subject</label>
            <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" placeholder="How can we help?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
            <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 min-h-[150px]" placeholder="Type your message here..."></textarea>
          </div>
          
          {status === 'error' && (
            <p className="text-error text-sm">Failed to send message. Please try again later.</p>
          )}
          
          <button disabled={status === 'submitting'} type="submit" className="w-full bg-primary hover:bg-button-hover text-white py-4 rounded-xl font-bold flex items-center justify-center transition-colors disabled:opacity-70">
            {status === 'submitting' ? 'Sending...' : <><Send className="w-5 h-5 mr-2" /> Send Message</>}
          </button>
        </form>
      )}
    </div>
  );
}
