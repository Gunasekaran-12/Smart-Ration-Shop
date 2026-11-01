import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Info,
  RefreshCw,
  Sparkles,
  Database,
  Maximize2,
} from 'lucide-react';
import { chatbotApi } from '../services';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  source?: string;
  isError?: boolean;
}

const INITIAL_SUGGESTIONS = [
  'What ration commodities are currently available?',
  'Is rice currently out of stock?',
  'When is the next stock replenishment expected?',
  'What are this month\'s distribution dates?',
  'Which weekly distribution window is available?',
  'What time slots can I book?',
  'How many booking places remain in a particular slot?',
  'What should I do if a commodity is missing?',
  'How can I register or track a complaint?',
  'What are the ration distribution rules?',
];

export const ChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId] = useState<string>(() => `widget-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Vanakkam! Welcome to the Smart Ration AI Assistant. I can check live database stock levels, shop opening hours, monthly distribution dates, and 30-minute slot booking availability directly from MySQL `smart`. How may I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'State Civil Supplies Database (MySQL `smart`)',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_SUGGESTIONS.slice(0, 5));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLastFailedMessage(null);

    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const response = await chatbotApi.sendMessage(
        textToSend,
        user?.rationCardId,
        user?.shopId || 1,
        historyPayload,
        conversationId
      );

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source || 'MySQL `smart` Database',
      };

      setMessages((prev) => [...prev, botMsg]);
      if (response.quickReplies && response.quickReplies.length > 0) {
        setQuickReplies(response.quickReplies);
      }
    } catch (err: any) {
      setLastFailedMessage(textToSend);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I am temporarily having trouble reaching the database query service. Please verify your connection or click Retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Always visible on Landing, Login, & Dashboard) */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-full shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300 flex items-center justify-center cursor-pointer group"
        title="Open Smart Ration Shop Management System with Real-Time Stock Analytics Assistant"
      >
        {isOpen ? (
          <X size={22} className="text-slate-950" />
        ) : (
          <div className="relative">
            <MessageSquare size={22} className="text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
          </div>
        )}
      </motion.button>

      {/* Glassmorphic Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[580px] max-h-[82vh] bg-[#091120]/95 border border-emerald-500/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[260px]">
                      Smart Ration Shop Management System with Real-Time Stock Analytics
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-1 shrink-0">
                      <Database size={10} />
                      LIVE DB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Authoritative Real-Time Data (English + தமிழ்)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  to="/chatbot"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                  title="Open Dedicated Full-Screen Assistant Dashboard"
                >
                  <Maximize2 size={16} />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Widget"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="px-3.5 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-[10px] text-amber-300 font-medium">
              <Info size={12} className="flex-shrink-0 text-amber-400" />
              <span>
                Informational assistant only. Transactions require authenticated counter validation.
              </span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-br-sm shadow-md'
                        : msg.isError
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200 rounded-bl-sm'
                        : 'bg-slate-800/85 border border-white/10 text-slate-200 rounded-bl-sm shadow-inner'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                      <span className={msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'}>
                        {msg.timestamp}
                      </span>
                      {msg.source && (
                        <span className="text-emerald-400/80 font-mono text-[9px] ml-2">
                          {msg.source}
                        </span>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="bg-slate-800/80 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono ml-1 text-slate-400">Querying live database...</span>
                  </div>
                </div>
              )}

              {lastFailedMessage && !isLoading && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => handleSend(lastFailedMessage)}
                    className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 hover:bg-rose-500/30 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Retry Last Query</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggested Questions Bar */}
            <div className="px-3.5 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-900/60">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-shrink-0">
                <Sparkles size={11} className="text-amber-400" /> Suggested:
              </span>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(reply)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-[11px] px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-all font-medium disabled:opacity-50 cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask stock, schedule, rules / கேள்வி கேளுங்கள்..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 transition-all cursor-pointer font-bold shadow-md shadow-emerald-500/20"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
