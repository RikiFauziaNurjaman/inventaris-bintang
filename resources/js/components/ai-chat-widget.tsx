import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronDown, Loader2, Send, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const QUICK_SUGGESTIONS = [
    'Berapa total stok barang saat ini?',
    'Barang apa yang stoknya kritis?',
    'Analisis stok per lokasi',
    'Rekomendasi restok barang',
    'Ringkasan aktivitas terbaru',
    'Lokasi mana stok terbanyak?',
];

function formatAiMessage(text: string): string {
    // Simple markdown-like formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\s*[-•]\s/gm, '• ')
        .replace(/^\s*(\d+)\.\s/gm, '<span class="font-semibold text-blue-400">$1.</span> ')
        .replace(/\n/g, '<br/>');
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isOpen, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMsg: Message = {
            id: generateId(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build history (last 10 messages for context)
            const history = messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await axios.post('/api/ai-chat', {
                message: content.trim(),
                history,
            });

            const aiMsg: Message = {
                id: generateId(),
                role: 'assistant',
                content: response.data.message || 'Maaf, tidak ada respons.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error: unknown) {
            const errorMsg = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Terjadi kesalahan jaringan.'
                : 'Terjadi kesalahan yang tidak diketahui.';

            const aiMsg: Message = {
                id: generateId(),
                role: 'assistant',
                content: `⚠️ ${errorMsg}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <>
            {/* Header Icon Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:shadow-md"
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
                }}
                id="ai-chat-btn"
                aria-label="Toggle AI Assistant"
            >
                <Sparkles className="h-4 w-4 text-white" />
                {/* Pulse ring (optional, can be kept subtle) */}
                {!isOpen && <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />}
                <span
                    className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-background"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                    AI
                </span>
            </motion.button>

            {/* Chat Panel */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-4 bottom-4 z-50 flex flex-col overflow-hidden rounded-2xl border shadow-2xl sm:right-6 sm:bottom-6"
                        style={{
                            width: 'min(400px, calc(100vw - 2rem))',
                            height: 'min(620px, calc(100vh - 2rem))',
                            borderColor: 'rgba(99, 102, 241, 0.2)',
                            boxShadow:
                                '0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 0 40px -10px rgba(99, 102, 241, 0.15)',
                        }}
                        id="ai-chat-panel"
                    >
                        {/* Header */}
                        <div
                            className="relative flex items-center justify-between px-5 py-4"
                            style={{
                                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                    }}
                                >
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                                        <span className="text-xs text-indigo-200">Online • DeepSeek</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearChat}
                                        className="rounded-lg p-2 text-indigo-300 transition-colors hover:bg-white/10 hover:text-white"
                                        title="Hapus riwayat chat"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M3 6h18" />
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-2 text-indigo-300 transition-colors hover:bg-white/10 hover:text-white"
                                    aria-label="Tutup chat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {/* Decorative gradient line */}
                            <div
                                className="absolute right-0 bottom-0 left-0 h-[2px]"
                                style={{
                                    background: 'linear-gradient(90deg, #6366f1, #a78bfa, #c084fc, #6366f1)',
                                }}
                            />
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {/* Welcome message */}
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center py-6 text-center"
                                >
                                    <div
                                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                                        }}
                                    >
                                        <Sparkles className="h-8 w-8 text-indigo-500" />
                                    </div>
                                    <h4 className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-100">
                                        Halo! Saya AI Assistant 👋
                                    </h4>
                                    <p className="mb-5 max-w-[280px] text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                        Saya bisa membantu Anda menganalisis data inventaris, menjawab pertanyaan stok, dan
                                        memberikan rekomendasi pengelolaan.
                                    </p>

                                    {/* Quick Suggestions */}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {QUICK_SUGGESTIONS.map((suggestion, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs text-indigo-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-gray-700"
                                            >
                                                {suggestion}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Message List */}
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div
                                            className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            }}
                                        >
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'rounded-br-md text-white'
                                                : 'rounded-bl-md border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                        }`}
                                        style={
                                            msg.role === 'user'
                                                ? {
                                                      background:
                                                          'linear-gradient(135deg, #3b82f6, #6366f1)',
                                                  }
                                                : {}
                                        }
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div
                                                className="ai-message-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: formatAiMessage(msg.content),
                                                }}
                                            />
                                        ) : (
                                            msg.content
                                        )}
                                        <div
                                            className={`mt-1 text-[10px] ${
                                                msg.role === 'user'
                                                    ? 'text-right text-blue-200'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                        >
                                            {msg.timestamp.toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-3 flex justify-start"
                                >
                                    <div
                                        className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        }}
                                    >
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    className="h-2 w-2 rounded-full bg-indigo-400"
                                                    animate={{
                                                        y: [0, -6, 0],
                                                        opacity: [0.4, 1, 0.4],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        delay: i * 0.15,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="ml-1 text-xs text-gray-400">AI sedang berpikir...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Post-response suggestions */}
                            {messages.length > 0 &&
                                !isLoading &&
                                messages[messages.length - 1]?.role === 'assistant' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-2 flex flex-wrap gap-1.5"
                                    >
                                        {QUICK_SUGGESTIONS.slice(0, 3).map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestionClick(s)}
                                                className="rounded-full border border-indigo-200/50 bg-white/80 px-2.5 py-1 text-[11px] text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800/50 dark:bg-gray-800/80 dark:text-indigo-400 dark:hover:bg-gray-700"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={scrollToBottom}
                                    className="absolute right-6 bottom-20 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition-colors hover:bg-indigo-600"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-850 dark:bg-gray-900">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Tanya tentang inventaris..."
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
                                    id="ai-chat-input"
                                />
                                <motion.button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-all disabled:opacity-40 disabled:shadow-none"
                                    style={{
                                        background:
                                            inputValue.trim() && !isLoading
                                                ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                                                : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                                    }}
                                    id="ai-chat-send"
                                    aria-label="Kirim pesan"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </motion.button>
                            </form>
                            <p className="mt-1.5 text-center text-[10px] text-gray-400 dark:text-gray-500">
                                Didukung oleh DeepSeek AI • Data real-time inventaris
                            </p>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
