import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });
      const data = await response.json();
      
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: data.reply || "Sorry, I couldn't process that." }] }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: "Error connecting to support." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-50 bg-primary hover:bg-button-hover text-white p-4 rounded-full shadow-2xl transition-all ${isOpen ? 'scale-0' : 'scale-100'} hover:scale-110`}
      >
        <MessageCircle size={24} />
      </button>

      <div className={`fixed bottom-6 left-6 z-50 w-[350px] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden transition-all origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-primary p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-bold">FireWood Store Support</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="h-[350px] overflow-y-auto p-4 flex flex-col gap-4 bg-background">
          {history.length === 0 && (
            <div className="text-center text-text-secondary mt-4">
              <Bot size={40} className="mx-auto mb-2 opacity-50" />
              <p>Hi! How can I help you find the right assets today?</p>
            </div>
          )}
          
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-border text-text-primary rounded-bl-none'}`}>
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border p-3 rounded-xl rounded-bl-none text-text-secondary text-sm flex gap-1">
                <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
          />
          <button 
            type="submit" 
            disabled={!message.trim() || isLoading}
            className="bg-primary hover:bg-button-hover disabled:bg-primary/50 text-white p-2 rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
