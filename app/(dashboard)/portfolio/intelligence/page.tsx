"use client";

import { useChat } from '@ai-sdk/react';
import { Bot, Send, User, BrainCircuit, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function PortfolioIntelligencePage() {
  const { messages, sendMessage, status } = useChat({});
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ parts: [{ type: 'text', text: input }], role: 'user' });
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-navy dark text-t1 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle bg-navy/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-t1 tracking-tight">Portfolio GPT</h1>
          <p className="text-xs text-t3 font-medium">Your AI Investment Research Analyst</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col gap-6 p-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto gap-4 mt-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 shadow-2xl">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">How can I help you analyze?</h2>
            <p className="text-sm text-t3 leading-relaxed">
              I have full access to your Quantr portfolio, watchlists, and market data. Ask me to break down your performance, analyze an Indian stock, or explain a financial concept.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button 
                type="button" 
                onClick={() => handleInputChange({ target: { value: 'Analyze my portfolio performance' } } as any)} 
                className="px-4 py-2 rounded-full border border-border-subtle bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Analyze my portfolio
              </button>
              <button 
                type="button" 
                onClick={() => handleInputChange({ target: { value: 'Explain P/E ratio with an example' } } as any)} 
                className="px-4 py-2 rounded-full border border-border-subtle bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Explain P/E ratio
              </button>
            </div>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 py-1 shrink-0 flex items-center justify-center border border-blue-500/30 mt-1">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}
              
              <div className={`px-5 py-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50' 
                  : 'bg-navy-card border border-border-subtle text-t2 rounded-tl-sm shadow-black/20'
              }`}>
                <div className="whitespace-pre-wrap">
                  {m.parts && m.parts.length > 0 
                    ? m.parts.map(p => p.type === 'text' ? p.text : '').join('')
                    : (m as any).content || ''}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-[#57FFD8] shrink-0 flex items-center justify-center mt-1">
                   <User className="w-4 h-4 text-navy shadow-sm" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 justify-start mt-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 shrink-0 flex items-center justify-center border border-blue-500/30">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-navy-card border border-border-subtle text-t3 rounded-tl-sm w-24 flex justify-center items-center gap-1.5 h-[52px]">
              <span className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-navy shrink-0 border-t border-border-subtle w-full flex justify-center sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl w-full relative group items-center">
          <input
            className="flex-1 bg-navy-card border border-border-subtle text-t1 text-sm rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-t3 shadow-inner"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Portfolio GPT about your investments or market terms..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md group-focus-within:shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      <div className="text-center pb-3 pt-1 bg-navy shrink-0">
        <p className="text-[10px] text-t3 opacity-60">Portfolio GPT can make mistakes. Consider verifying important financial information.</p>
      </div>
    </div>
  );
}
