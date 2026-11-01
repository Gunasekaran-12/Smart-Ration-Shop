import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Database,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatbotApi, stockApi } from '../services';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/PageContainer';
import type { StockSummary } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  source?: string;
  isError?: boolean;
  intent?: string;
}

export const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveStock, setLiveStock] = useState<StockSummary[]>([]);
  const [activeCategory, setActiveCategory] = useState<'stock' | 'booking' | 'beneficiary' | 'admin'>('stock');

  const QUESTION_CATEGORIES = [
    {
      id: 'stock' as const,
      label: 'Stock Availability',
      shortLabel: 'Stock',
      icon: Package,
      badge: 'Live',
      questions: [
        'View all available ration commodities',
        'How much rice is available?',
        'Check wheat availability',
        'Is sugar available?',
        'Show all out-of-stock commodities',
        'Show low-stock commodities',
        'Which commodities are available right now?',
      ],
    },
    {
      id: 'booking' as const,
      label: 'Booking & Distribution',
      shortLabel: 'Booking',
      icon: Calendar,
      badge: 'Slots',
      questions: [
        "Check today's available booking slots",
        'Which slots are completely booked?',
        'Find the next available slot',
        'Can I book rice now?',
        'Why is a particular commodity unavailable?',
        'When is the next distribution date?',
      ],
    },
    {
      id: 'beneficiary' as const,
      label: 'Beneficiary Info',
      shortLabel: 'Beneficiary',
      icon: User,
      badge: 'NFSA',
      questions: [
        'Check my ration entitlement',
        'Check my remaining eligible quantity',
        'Check my booking status',
        'Which commodities can I book?',
      ],
    },
    {
      id: 'admin' as const,
      label: 'Admin & Operations',
      shortLabel: 'Admin',
      icon: ShieldCheck,
      badge: 'Ledger',
      questions: [
        'How much stock was added today?',
        'How much stock was distributed?',
        'Show current stock movement',
        'Which commodities need replenishment?',
      ],
    },
  ];

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize role-tailored default suggestions
  const getRoleSuggestions = (): string[] => {
    if (user?.role === 'SHOP_OPERATOR') {
      return [
        "What is today's distribution summary?",
        'Which commodities have low stock?',
        'How many booking places remain?',
        'Show full stock ledger table',
        'When is replenishment expected?',
      ];
    }
    if (user?.role === 'AUDITOR') {
      return [
        'Show quality audit and compliance summary',
        'Which commodities have low stock?',
        'Show full stock ledger table',
        'What are the ration distribution rules?',
      ];
    }
    if (user?.role === 'SUPER_ADMIN') {
      return [
        'Statewide inventory health',
        'Which commodities are out of stock?',
        'Show full stock ledger table',
        'Show quality audit and compliance summary',
      ];
    }
    // Default Beneficiary
    return [
      'How much rice is available?',
      'Which commodities are out of stock?',
      'Which items are running low?',
      'Can I book a ration slot now?',
      'Which commodities can I obtain now versus later?',
      'Why is a slot available but requested commodity unavailable?',
      'When is replenishment expected?',
      "What are this month's distribution dates?",
    ];
  };

  const [quickReplies, setQuickReplies] = useState<string[]>(getRoleSuggestions());

  // Initial welcome greeting
  useEffect(() => {
    initNewChat();
    loadLiveStock();
  }, [user]);

  const loadLiveStock = async () => {
    try {
      const data = await stockApi.getStockSummary(user?.shopId || 1);
      setLiveStock(data);
    } catch {
      // Fallback stock overview
    }
  };

  const initNewChat = () => {
    const newId = `conv-${Date.now()}`;
    setConversationId(newId);
    setLastFailedMessage(null);
    setQuickReplies(getRoleSuggestions());

    const roleTitle = user?.role === 'SHOP_OPERATOR'
      ? 'Fair Price Shop Operator'
      : user?.role === 'AUDITOR'
      ? 'State Quality Auditor'
      : user?.role === 'SUPER_ADMIN'
      ? 'State Directorate Administrator'
      : 'Beneficiary Cardholder';

    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `👋 **Vanakkam, ${user?.fullName || 'User'}!**\n\nWelcome to the **ChatGPT-style Smart Ration AI Assistant** for **FPS-1001**.\n\nConnected directly to **MySQL \`smart\`** with real-time stock balances, slot capacity, and statutory NFSA rules.\n\nRole Access: **${roleTitle}** &bull; **Live Telemetry Active**.\n\nAsk me factual questions about stock levels, slot reservations, out-of-stock items, or distribution windows.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'MySQL `smart` Live Database',
      },
    ]);
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

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

    // Build chat history for contextual follow-up resolution
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
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: '⚠️ **Communication Alert:** Unable to query the Fair Price Shop MySQL database. Please verify your connection or click Retry below.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ==========================================================================
  // ADVANCED MARKDOWN & TABLE PARSER
  // ==========================================================================
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];

    const flushTable = () => {
      if (tableBuffer.length >= 2) {
        const headerRow = tableBuffer[0];
        const headers = headerRow.split('|').map((c) => c.trim()).filter(Boolean);
        // Skip separator line tableBuffer[1]
        const dataRows = tableBuffer.slice(2);

        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-white/10 shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0b162a] border-b border-white/10 text-emerald-400 font-mono text-[11px] uppercase tracking-wider">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#08101e]/80">
                {dataRows.map((r, rIdx) => {
                  const cells = r.split('|').map((c) => c.trim()).filter(Boolean);
                  return (
                    <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                          {renderInlineSpans(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
    };

    lines.forEach((line, idx) => {
      // Check if line is a table row
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        tableBuffer.push(line.trim());
      } else {
        if (tableBuffer.length > 0) {
          flushTable();
        }

        // Heading 3
        if (line.startsWith('### ')) {
          elements.push(
            <h3 key={idx} className="text-sm font-bold text-emerald-300 mt-2 mb-1 flex items-center gap-1.5">
              {renderInlineSpans(line.replace('### ', ''))}
            </h3>
          );
        }
        // Heading 4
        else if (line.startsWith('#### ')) {
          elements.push(
            <h4 key={idx} className="text-xs font-bold text-slate-200 mt-2 mb-0.5">
              {renderInlineSpans(line.replace('#### ', ''))}
            </h4>
          );
        }
        // Bullet list item
        else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          const itemText = line.trim().replace(/^[-•]\s*/, '');
          elements.push(
            <li key={idx} className="ml-3 pl-1 text-xs text-slate-300 leading-relaxed list-disc marker:text-emerald-400">
              {renderInlineSpans(itemText)}
            </li>
          );
        }
        // Numbered list item
        else if (/^\d+\.\s/.test(line.trim())) {
          elements.push(
            <p key={idx} className="text-xs text-slate-300 leading-relaxed pl-2 font-medium">
              {renderInlineSpans(line.trim())}
            </p>
          );
        }
        // Empty line
        else if (line.trim() === '') {
          elements.push(<div key={idx} className="h-1.5" />);
        }
        // Standard paragraph
        else {
          elements.push(
            <p key={idx} className="text-xs text-slate-300 leading-relaxed">
              {renderInlineSpans(line)}
            </p>
          );
        }
      }
    });

    if (tableBuffer.length > 0) {
      flushTable();
    }

    return elements;
  };

  const renderInlineSpans = (text: string) => {
    // Bold parser
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="text-white font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Inline link parser [Label](url)
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <Link
            key={pIdx}
            to={linkMatch[2]}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 ml-1"
          >
            {linkMatch[1]}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <PageContainer
      title="Smart Ration AI Assistant"
      subtitle="Interactive conversational interface interlocked with live MySQL stock ledgers, active bookings, and statutory rules."
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={initNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <PlusCircle size={14} />
            <span>New Chat</span>
          </button>
          <Link
            to="/booking"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <Calendar size={13} className="text-emerald-400" />
            <span>Slot Booking</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
            <Database size={13} className="text-emerald-400" />
            <span>DB: smart (Live)</span>
          </div>
        </div>
      }
    >
      {/* 1. Live Commodity Stock Status Cards (Dynamic) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(liveStock.length > 0 ? liveStock : [
          { commodityCode: 'RICE', commodityName: 'Boiled Rice (Grade A)', currentStock: 950, measurementUnit: 'KG', isLowStock: false },
          { commodityCode: 'WHEAT', commodityName: 'Whole Milling Wheat', currentStock: 680, measurementUnit: 'KG', isLowStock: false },
          { commodityCode: 'SUGAR', commodityName: 'Refined Cane Sugar', currentStock: 0, measurementUnit: 'KG', isLowStock: true },
          { commodityCode: 'DAL', commodityName: 'Toor Dal (Pulses)', currentStock: 80, measurementUnit: 'KG', isLowStock: false },
          { commodityCode: 'OIL', commodityName: 'Cooking Oil', currentStock: 25, measurementUnit: 'LITRE', isLowStock: true },
          { commodityCode: 'SALT', commodityName: 'Fortified Iodized Salt', currentStock: 450, measurementUnit: 'KG', isLowStock: false },
        ]).map((item, idx) => {
          const isOut = Number(item.currentStock) <= 0;
          const isLow = !isOut && Boolean(item.isLowStock);
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1629]/90 to-[#070d18]/90 border border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                  {item.commodityCode}
                </span>
                {isOut ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                    <AlertCircle size={10} /> Out
                  </span>
                ) : isLow ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle size={10} /> Low
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={10} /> In Stock
                  </span>
                )}
              </div>
              <div className="text-base font-black text-white">
                {Number(item.currentStock).toFixed(2)} <span className="text-xs font-normal text-slate-400">{item.measurementUnit}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.commodityName}</div>
            </div>
          );
        })}
      </div>

      {/* 2. Main ChatGPT-Style Conversational Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Suggestions & Context Scope Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1629]/95 to-[#070d18]/95 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                <Sparkles size={14} />
                <span>Quick Queries</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {user?.role || 'BENEFICIARY'}
              </span>
            </div>

            {/* Category Navigation Pills */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#08101e] rounded-xl border border-white/5">
              {QUESTION_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <IconComponent size={12} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                    <span className="truncate">{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Subtitle */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span className="font-semibold text-slate-300">
                {QUESTION_CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {QUESTION_CATEGORIES.find((c) => c.id === activeCategory)?.badge}
              </span>
            </div>

            {/* Predefined Category Questions */}
            <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-0.5 scrollbar-thin">
              {QUESTION_CATEGORIES.find((c) => c.id === activeCategory)?.questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 transition-all font-medium leading-snug group flex items-start gap-2"
                >
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0 mt-0.5" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Role Governance & Privacy Guard Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck size={14} />
              <span>Role-Based Governance</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every factual query evaluates real unreserved inventory, active uncollected booking locks, and permissions tailored to your authenticated role.
            </p>
          </div>
        </div>

        {/* Right Chat Stream */}
        <div className="lg:col-span-3 flex flex-col h-[680px] rounded-3xl bg-gradient-to-b from-[#0c1629]/95 to-[#070d18]/95 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 px-6 border-b border-white/10 bg-[#091120]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <div className="w-full h-full bg-[#070d18] rounded-[14px] flex items-center justify-center text-emerald-400">
                  <Bot size={20} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Smart Ration AI Assistant
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fair Price Shop #1 (FPS-1001) &bull; Department of Food & Civil Supplies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={initNewChat}
                title="Start a new chat session"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 scroll-smooth"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[92%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                      : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`space-y-1.5 ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl text-xs md:text-[13px] leading-relaxed shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium'
                        : msg.isError
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-none'
                        : 'bg-[#0f1d33] border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {renderFormattedContent(msg.text)}
                  </div>

                  {/* Metadata: Timestamp, Source & Copy */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono text-emerald-400">
                          <Database size={10} />
                          {msg.source}
                        </span>
                      </>
                    )}
                    {msg.sender === 'bot' && (
                      <>
                        <span>&bull;</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-[10px]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mr-auto max-w-[85%]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#0f1d33] border border-white/10 text-slate-300 text-xs flex items-center gap-2.5 shadow-lg">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-1">
                    Analyzing context & querying live MySQL stock records...
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error Retry Option */}
            {lastFailedMessage && !isLoading && (
              <div className="flex items-center justify-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                <span>Failed to process query.</span>
                <button
                  onClick={() => handleSend(lastFailedMessage)}
                  className="font-bold underline hover:text-white flex items-center gap-1"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            )}
          </div>

          {/* Quick Replies Bar */}
          <div className="px-5 py-2.5 border-t border-white/5 bg-[#0a1324]/90 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex-shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" />
              Follow-up:
            </span>
            {quickReplies.slice(0, 5).map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qr)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 transition-all font-medium flex-shrink-0"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input & Send Controls */}
          <div className="p-4 px-6 border-t border-white/10 bg-[#091120] flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Rice, Wheat, Sugar availability, low stock, distribution dates, or slot booking..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#0d182b] border border-white/10 focus:border-emerald-500 rounded-2xl text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium shadow-inner"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 group"
            >
              <Send size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ChatbotPage;
